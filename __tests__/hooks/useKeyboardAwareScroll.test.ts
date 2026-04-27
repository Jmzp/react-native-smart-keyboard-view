import { renderHook, act } from '@testing-library/react-native'
import { UIManager, TextInput } from 'react-native'
import { useKeyboardAwareScroll } from '../../src/hooks/useKeyboardAwareScroll'
import {
  setupKeyboardMock,
  fireKeyboardEvent,
  setPlatform,
  setupUIManagerMock,
  clearUIManagerMocks,
  setupTextInputStateMock,
  setFocusedInput,
  mockFindNodeHandle,
} from '../helpers/mockRN'
import { createMockScrollResponder } from '../helpers/mockScroll'

function setupScrollResponder(hookResult: ReturnType<typeof useKeyboardAwareScroll>) {
  const responder = createMockScrollResponder()
  const ref = {
    ...responder,
    getScrollResponder: jest.fn(() => responder),
  }
  act(() => { hookResult.handleRef(ref) })
  return responder
}

describe('useKeyboardAwareScroll', () => {
  beforeEach(() => {
    setupKeyboardMock()
    setPlatform('ios')
    setupUIManagerMock()
    setupTextInputStateMock()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    clearUIManagerMocks()
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
      const innerResponder = { scrollTo: jest.fn() }
      const responder = { getScrollResponder: jest.fn(() => innerResponder) }
      act(() => { result.current.handleRef(responder) })
      expect(result.current.getScrollResponder()).toBe(innerResponder)
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
      const responder = setupScrollResponder(result.current)

      const ref = { current: { _nativeTag: 42 } }
      mockFindNodeHandle(42)

      act(() => { result.current.scrollToFocusedInput(ref) })
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
      const ref = { current: { _nativeTag: 10 } }
      mockFindNodeHandle(10)

      act(() => { result.current.scrollToFocusedInput(ref) })
      act(() => { jest.advanceTimersByTime(250) })
      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        10, 120, true,
      )
    })

    it('clears previous timeout on subsequent calls', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll({ keyboardOpeningTime: 200 }))
      const responder = setupScrollResponder(result.current)

      mockFindNodeHandle(1, 2)

      act(() => { result.current.scrollToFocusedInput({ current: {} }) })
      act(() => { jest.advanceTimersByTime(100) })
      act(() => { result.current.scrollToFocusedInput({ current: {} }) })
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
      mockFindNodeHandle('parent', 'child')
      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
          if (_node === 'parent') cb(0, 0, 400, 800)
          else cb(0, 500, 400, 50)
        },
      )

      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)
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
      mockFindNodeHandle('parent', 'child')
      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
          cb(0, 0, 400, 800)
        },
      )

      const customGetPosition = jest.fn(() => ({ x: 5, y: 300, animated: false }))
      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

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
      setFocusedInput({} as any)
      mockFindNodeHandle(99)

      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      result.current.update()
      act(() => { jest.advanceTimersByTime(250) })

      expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
        99, 75, true,
      )
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
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      expect((UIManager as any).viewIsDescendantOf).not.toHaveBeenCalled()
    })

    it('does not scroll when no focused input', () => {
      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336 }) })
      expect((UIManager as any).viewIsDescendantOf).not.toHaveBeenCalled()
    })

    it('does not scroll when viewIsDescendantOf returns false', () => {
      mockFindNodeHandle(1)
      setFocusedInput({} as any)
      ;(UIManager as any).viewIsDescendantOf.mockImplementation(
        (_a: any, _b: any, cb: (v: boolean) => void) => cb(false),
      )

      const { result } = renderHook(() => useKeyboardAwareScroll())
      setupScrollResponder(result.current)

      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      expect(UIManager.measureInWindow).not.toHaveBeenCalled()
    })

    describe('iOS', () => {
      it('scrolls when textInputBottom > keyboardY - totalExtra', () => {
        mockFindNodeHandle(5)
        setFocusedInput({} as any)
        ;(UIManager as any).viewIsDescendantOf.mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 500, 300, 50),
        )

        const { result } = renderHook(() => useKeyboardAwareScroll({ extraHeight: 75 }))
        const responder = setupScrollResponder(result.current)

        act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
        act(() => { jest.advanceTimersByTime(250) })

        expect(responder.scrollResponderScrollNativeHandleToKeyboard).toHaveBeenCalledWith(
          5, 75, true,
        )
      })

      it('does not scroll when textInput is fully above keyboard', () => {
        mockFindNodeHandle(5)
        setFocusedInput({} as any)
        ;(UIManager as any).viewIsDescendantOf.mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 100, 300, 50),
        )

        const { result } = renderHook(() => useKeyboardAwareScroll({ extraHeight: 75 }))
        const responder = setupScrollResponder(result.current)

        act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 700 }) })
        expect(responder.scrollResponderScrollNativeHandleToKeyboard).not.toHaveBeenCalled()
      })
    })

    describe('Android', () => {
      beforeEach(() => {
        setPlatform('android')
      })

      it('does not scroll when enableOnAndroid is false', () => {
        mockFindNodeHandle(1)
        setFocusedInput({} as any)

        const { result } = renderHook(() => useKeyboardAwareScroll({ enableOnAndroid: false }))
        setupScrollResponder(result.current)

        act(() => { fireKeyboardEvent('keyboardDidShow') })
        expect((UIManager as any).viewIsDescendantOf).not.toHaveBeenCalled()
      })

      it('scrolls extra height when input is behind keyboard', () => {
        mockFindNodeHandle(5)
        setFocusedInput({} as any)
        ;(UIManager as any).viewIsDescendantOf.mockImplementation(
          (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
        )
        ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
          (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 700, 300, 50),
        )

        const { result } = renderHook(() => useKeyboardAwareScroll({
          extraHeight: 75, extraScrollHeight: 0,
        }))
        const responder = setupScrollResponder(result.current)

        act(() => { fireKeyboardEvent('keyboardDidShow', { height: 336, screenY: 400 }) })
        expect(responder.scrollTo).toHaveBeenCalledWith(
          expect.objectContaining({ animated: true }),
        )
      })
    })
  })

  describe('reset scroll on keyboard hide', () => {
    it('resets to defaultResetScrollToCoords when keyboard hides', () => {
      mockFindNodeHandle(1)
      setFocusedInput({} as any)
      ;(UIManager as any).viewIsDescendantOf.mockImplementation(
        (_a: any, _b: any, cb: (v: boolean) => void) => cb(true),
      )
      ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
        (_n: any, cb: (x: number, y: number, w: number, h: number) => void) => cb(0, 500, 300, 50),
      )

      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      act(() => {
        result.current.handleScroll({
          nativeEvent: { contentOffset: { x: 0, y: 200 } },
        } as any)
      })

      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 336, screenY: 400 }) })
      act(() => { fireKeyboardEvent('keyboardWillHide') })

      expect(responder.scrollTo).toHaveBeenCalledWith({ x: 0, y: 200, animated: true })
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

    it('does not scroll when no reset coords and no captured position', () => {
      Object.defineProperty(TextInput.State, 'currentlyFocusedInput', {
        get: () => (() => null),
        configurable: true,
      })

      const { result } = renderHook(() => useKeyboardAwareScroll())
      const responder = setupScrollResponder(result.current)

      act(() => { fireKeyboardEvent('keyboardWillShow') })
      act(() => { fireKeyboardEvent('keyboardWillHide') })
      expect(responder.scrollTo).not.toHaveBeenCalled()
    })
  })
})
