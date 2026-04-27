import { renderHook, act } from '@testing-library/react-native'
import { UIManager, TextInput, findNodeHandle } from 'react-native'
import { useKeyboardAwareScroll } from '../../src/hooks/useKeyboardAwareScroll'
import {
  fireKeyboardEvent,
  resetMocks,
  mockTextInputState,
  setPlatform,
} from '../helpers/mockRN'
import { DEFAULT_SCROLL_RESPONDER } from '../helpers/mockScroll'

function setupScrollResponder(hookResult: ReturnType<typeof useKeyboardAwareScroll>) {
  const responder = {
    ...DEFAULT_SCROLL_RESPONDER,
    getScrollResponder: jest.fn(() => responder),
  }
  act(() => { hookResult.handleRef(responder) })
  return responder
}

describe('useKeyboardAwareScroll', () => {
  beforeEach(() => {
    resetMocks()
    setPlatform('ios')
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initial state', () => {
    it('returns all expected keys', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const keys = Object.keys(result.current)
      expect(keys).toContain('handleRef')
      expect(keys).toContain('handleScroll')
      expect(keys).toContain('keyboardSpace')
      expect(keys).toContain('getScrollResponder')
      expect(keys).toContain('scrollToPosition')
      expect(keys).toContain('scrollToEnd')
      expect(keys).toContain('scrollToFocusedInput')
      expect(keys).toContain('scrollIntoView')
      expect(keys).toContain('update')
    })

    it('has keyboardSpace of 0 initially', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      expect(result.current.keyboardSpace).toBe(0)
    })
  })

  describe('getScrollResponder', () => {
    it('returns null when no ref is set', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      expect(result.current.getScrollResponder()).toBeNull()
    })

    it('returns getScrollResponder() result when available', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = { getScrollResponder: jest.fn(() => 'responder') }
      act(() => { result.current.handleRef(responder) })
      expect(result.current.getScrollResponder()).toBe('responder')
    })

    it('falls back to ref itself when no getScrollResponder method', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const ref = { scrollTo: jest.fn() }
      act(() => { result.current.handleRef(ref) })
      expect(result.current.getScrollResponder()).toBe(ref)
    })
  })

  describe('scrollToPosition', () => {
    it('does nothing when no responder', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      expect(() => result.current.scrollToPosition(0, 100)).not.toThrow()
    })

    it('calls responder.scrollTo with correct params', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      result.current.scrollToPosition(10, 200, false)
      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 10, y: 200, animated: false })
    })

    it('defaults animated to true', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      result.current.scrollToPosition(0, 50)
      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 0, y: 50, animated: true })
    })
  })

  describe('scrollToEnd', () => {
    it('does nothing when no responder', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      expect(() => result.current.scrollToEnd()).not.toThrow()
    })

    it('calls responder.scrollToEnd', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      result.current.scrollToEnd(false)
      expect(responder.scrollToEnd).toHaveBeenCalledWith({ animated: false })
    })
  })

  describe('handleScroll', () => {
    it('stores content offset from scroll event', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      act(() => {
        result.current.handleScroll({
          nativeEvent: { contentOffset: { x: 5, y: 150 } },
        } as any)
      })
      // position is internal but tested via scrollForExtraHeightOnAndroid behavior
    })
  })

  describe('handleRef', () => {
    it('stores the ref', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const ref = { scrollTo: jest.fn() }
      act(() => { result.current.handleRef(ref) })
      expect(result.current.getScrollResponder()).toBe(ref)
    })

    it('stores null ref', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      act(() => { result.current.handleRef(null) })
      expect(result.current.getScrollResponder()).toBeNull()
    })
  })

  describe('scrollToFocusedInput (ref-based)', () => {
    it('does nothing when ref.current is null', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const ref = { current: null }
      expect(() => result.current.scrollToFocusedInput(ref)).not.toThrow()
    })
  })

  describe('scrollToFocusedInput (nodeHandle-based)', () => {
    it('sets a timeout with keyboardOpeningTime', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({ keyboardOpeningTime: 100 }))
      setupScrollResponder(result.current)
      const responder = result.current.getScrollResponder()!

      act(() => { result.current.scrollToFocusedInput(42 as any) })
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).not.toHaveBeenCalled()
      act(() => { jest.advanceTimersByTime(100) })
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        42, 75, true,
      )
    })

    it('uses default extraHeight + extraScrollHeight', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({
        extraHeight: 100,
        extraScrollHeight: 20,
      }))
      const responder = setupScrollResponder(result.current)
      act(() => { result.current.scrollToFocusedInput(10 as any) })
      act(() => { jest.advanceTimersByTime(250) })
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        10, 120, true,
      )
    })

    it('clears previous timeout on subsequent calls', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({ keyboardOpeningTime: 200 }))
      const responder = setupScrollResponder(result.current)

      act(() => { result.current.scrollToFocusedInput(1 as any) })
      act(() => { jest.advanceTimersByTime(100) })
      act(() => { result.current.scrollToFocusedInput(2 as any) })
      act(() => { jest.advanceTimersByTime(200) })

      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledTimes(1)
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        2, 75, true,
      )
    })

    it('does not scroll if unmounted', () => {
      const { result, unmount } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      act(() => { result.current.scrollToFocusedInput(1 as any) })
      unmount()
      act(() => { jest.advanceTimersByTime(250) })
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).not.toHaveBeenCalled()
    })
  })

  describe('scrollIntoView', () => {
    it('returns early when no scrollViewRef', async () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      await expect(result.current.scrollIntoView(null)).resolves.toBeUndefined()
    })

    it('returns early when element is null', async () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)
      await expect(result.current.scrollIntoView(null)).resolves.toBeUndefined()
    })

    it('measures both elements and scrolls', async () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
          if (_node === 'parent') cb(0, 0, 400, 800)
          else cb(0, 500, 400, 50)
        },
      )

      jest.spyOn(require('react-native'), 'findNodeHandle')
        .mockReturnValueOnce('parent')
        .mockReturnValueOnce('child')

      const element = { _tag: 'child' } as any
      await act(async () => {
        await result.current.scrollIntoView(element)
      })

      expect(responder.scrollTo).toHaveBeenCalledWith({
        x: 0,
        y: 500,
        animated: true,
      })
    })

    it('uses custom getScrollPosition', async () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      const customGetPosition = jest.fn(() => ({ x: 5, y: 300, animated: false }))

      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
          cb(0, 0, 400, 800)
        },
      )

      jest.spyOn(require('react-native'), 'findNodeHandle')
        .mockReturnValueOnce('parent')
        .mockReturnValueOnce('child')

      await act(async () => {
        await result.current.scrollIntoView({} as any, { getScrollPosition: customGetPosition })
      })

      expect(customGetPosition).toHaveBeenCalled()
      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 5, y: 300, animated: false })
    })
  })

  describe('update', () => {
    it('does nothing when no focused input', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)
      result.current.update()
      act(() => { jest.advanceTimersByTime(250) })
    })

    it('scrolls to focused input when available', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
      mockTextInputState.currentlyFocusedInput = jest.fn(() => ({ _tag: 'input' }))
      jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(99)

      result.current.update()
      act(() => { jest.advanceTimersByTime(250) })

      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        99, 75, true,
      )
      mockTextInputState.currentlyFocusedInput = null
    })
  })

  describe('keyboardSpace computation', () => {
    it('is 0 when keyboard is not visible', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      expect(result.current.keyboardSpace).toBe(0)
    })

    it('includes keyboard height + extraScrollHeight when visible', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({ extraScrollHeight: 30 }))
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 300 }) })
      expect(result.current.keyboardSpace).toBe(330)
    })
  })

  describe('automatic scroll on keyboard show', () => {
    it('does not scroll when enableAutomaticScroll is false', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({ enableAutomaticScroll: false }))
      setupScrollResponder(result.current)
      mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
      jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(1)
      ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
        (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
      )
      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 600, 300, 50),
      )

      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      expect(UIManager.viewIsDescendantOf).not.toHaveBeenCalled()
      mockTextInputState.currentlyFocusedInput = null
    })

    it('does not scroll when no focused input', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336 }) })
      expect(UIManager.viewIsDescendantOf).not.toHaveBeenCalled()
    })

    it('does not scroll when no scroll responder', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
      jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(1)
      act(() => { fireKeyboardEvent('keyboardWillShow') })
      mockTextInputState.currentlyFocusedInput = null
    })

    it('does not scroll when viewIsDescendantOf returns false', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)
      mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
      jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(1)
      ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
        (_a: any, _b: any, cb: (v: boolean) => void) => cb(false),
      )

      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      expect(UIManager.measureInWindow).not.toHaveBeenCalled()
      mockTextInputState.currentlyFocusedInput = null
    })

    describe('iOS', () => {
      it('scrolls when textInputBottom > keyboardY - totalExtra', () => {
        const { result } = renderHook(() => useKeyboardAwareScroll({ extraHeight: 75 }))
        const responder = setupScrollResponder(result.current)
        mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
        jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(5)
        ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 500, 300, 50),
        )

        act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
        act(() => { jest.advanceTimersByTime(250) })

        expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
          5, 75, true,
        )
        mockTextInputState.currentlyFocusedInput = null
      })

      it('does not scroll when textInput is fully above keyboard', () => {
        const { result } = renderHook(() => useKeyboardAwareScroll({ extraHeight: 75 }))
        const responder = setupScrollResponder(result.current)
        mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
        jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(5)
        ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 100, 300, 50),
        )

        act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 700 }) })
        expect(responder.scrollResponderScrollNativeHandleToKeyboard).not.toHaveBeenCalled()
        mockTextInputState.currentlyFocusedInput = null
      })
    })

    describe('Android', () => {
      beforeEach(() => {
        setPlatform('android')
      })

      it('does not scroll when enableOnAndroid is false', () => {
        const { result } = renderHook(() => useKeyboardAwareScroll({ enableOnAndroid: false }))
        setupScrollResponder(result.current)
        mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
        jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(1)

        act(() => { fireKeyboardEvent('keyboardDidShow') })
        expect(UIManager.viewIsDescendantOf).not.toHaveBeenCalled()
        mockTextInputState.currentlyFocusedInput = null
      })

      it('scrolls extra height when input is behind keyboard', () => {
        const { result } = renderHook(() => useKeyboardAwareScroll({
          extraHeight: 75, extraScrollHeight: 0,
        }))
        const responder = setupScrollResponder(result.current)
        mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
        jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(5)
        ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 700, 300, 50),
        )

        act(() => { fireKeyboardEvent('keyboardDidShow', { height: 336, screenY: 400 }) })
        expect(responder.scrollTo).toHaveBeenCalledWith(
          expect.objectContaining({ animated: true }),
        )
        mockTextInputState.currentlyFocusedInput = null
      })
    })
  })

  describe('reset scroll on keyboard hide', () => {
    it('resets to defaultResetScrollToCoords when keyboard hides', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      act(() => {
        result.current.handleScroll({
          nativeEvent: { contentOffset: { x: 0, y: 200 } },
        } as any)
      })

      mockTextInputState.currentlyFocusedInput = jest.fn(() => ({}))
      jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(1)
      ;(UIManager.viewIsDescendantOf as jest.Mock).mockImplementation(
        (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
      )
      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 500, 300, 50),
      )

      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      act(() => { fireKeyboardEvent('keyboardWillHide') })

      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 0, y: 200, animated: true })
      mockTextInputState.currentlyFocusedInput = null
    })

    it('resets to custom resetScrollToCoords when provided', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({
        resetScrollToCoords: { x: 10, y: 50 },
      }))
      const responder = setupScrollResponder(result.current)

      act(() => { fireKeyboardEvent('keyboardWillShow') })
      act(() => { fireKeyboardEvent('keyboardWillHide') })

      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 10, y: 50, animated: true })
    })

    it('does not reset when enableResetScrollToCoords is false', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({
        enableResetScrollToCoords: false,
      }))
      const responder = setupScrollResponder(result.current)

      act(() => { fireKeyboardEvent('keyboardWillShow') })
      act(() => { fireKeyboardEvent('keyboardWillHide') })

      expect(responder.scrollTo).not.toHaveBeenCalled()
    })

    it('scrolls to 0,0 when no reset coords were captured', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      act(() => { fireKeyboardEvent('keyboardWillHide') })
      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 0, y: 0, animated: true })
    })
  })
})
