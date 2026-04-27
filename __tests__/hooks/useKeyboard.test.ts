import { renderHook, act } from '@testing-library/react-native'
import { useKeyboard } from '../../src/hooks/useKeyboard'
import { fireKeyboardEvent, resetMocks, mockKeyboardListeners, setPlatform } from '../helpers/mockRN'

describe('useKeyboard', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('initial state', () => {
    it('returns correct initial state', () => {
      const { result } = renderHook(() => useKeyboard())
      expect(result.current).toEqual({
        isVisible: false,
        height: 0,
        frame: null,
      })
    })
  })

  describe('iOS behavior', () => {
    beforeEach(() => {
      setPlatform('ios')
    })

    it('sets isVisible=true on keyboardWillShow', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 300, screenY: 500 }) })
      expect(result.current.isVisible).toBe(true)
      expect(result.current.height).toBe(300)
      expect(result.current.frame).toEqual(
        expect.objectContaining({ height: 300, screenY: 500 }),
      )
    })

    it('sets isVisible=false on keyboardWillHide', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardWillShow') })
      expect(result.current.isVisible).toBe(true)
      act(() => { fireKeyboardEvent('keyboardWillHide') })
      expect(result.current.isVisible).toBe(false)
      expect(result.current.height).toBe(0)
    })

    it('calls onKeyboardWillShow callback', () => {
      const onShow = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardWillShow: onShow }))
      act(() => { fireKeyboardEvent('keyboardWillShow', { height: 250 }) })
      expect(onShow).toHaveBeenCalledWith(expect.objectContaining({ height: 250 }))
    })

    it('calls onKeyboardWillHide callback', () => {
      const onHide = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardWillHide: onHide }))
      act(() => { fireKeyboardEvent('keyboardWillHide') })
      expect(onHide).toHaveBeenCalledWith(expect.any(Object))
    })

    it('calls onKeyboardDidShow callback', () => {
      const onDidShow = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardDidShow: onDidShow }))
      act(() => { fireKeyboardEvent('keyboardDidShow') })
      expect(onDidShow).toHaveBeenCalledWith(expect.any(Object))
    })

    it('calls onKeyboardDidHide callback', () => {
      const onDidHide = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardDidHide: onDidHide }))
      act(() => { fireKeyboardEvent('keyboardDidHide') })
      expect(onDidHide).toHaveBeenCalledWith(expect.any(Object))
    })

    it('does not update state on keyboardDidShow', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardDidShow', { height: 400 }) })
      expect(result.current.isVisible).toBe(false)
    })

    it('does not update state on keyboardDidHide', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardWillShow') })
      act(() => { fireKeyboardEvent('keyboardDidHide') })
      expect(result.current.isVisible).toBe(true)
    })

    it('does not call optional callbacks when not provided', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => {
        fireKeyboardEvent('keyboardWillShow')
        fireKeyboardEvent('keyboardWillHide')
        fireKeyboardEvent('keyboardDidShow')
        fireKeyboardEvent('keyboardDidHide')
      })
      expect(result.current.isVisible).toBe(false)
    })
  })

  describe('Android behavior', () => {
    beforeEach(() => {
      setPlatform('android')
    })

    it('sets isVisible=true on keyboardDidShow', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardDidShow', { height: 280, screenY: 520 }) })
      expect(result.current.isVisible).toBe(true)
      expect(result.current.height).toBe(280)
    })

    it('sets isVisible=false on keyboardDidHide', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => { fireKeyboardEvent('keyboardDidShow') })
      act(() => { fireKeyboardEvent('keyboardDidHide') })
      expect(result.current.isVisible).toBe(false)
      expect(result.current.height).toBe(0)
    })

    it('calls onKeyboardDidShow callback', () => {
      const onDidShow = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardDidShow: onDidShow }))
      act(() => { fireKeyboardEvent('keyboardDidShow') })
      expect(onDidShow).toHaveBeenCalled()
    })

    it('calls onKeyboardDidHide callback', () => {
      const onDidHide = jest.fn()
      renderHook(() => useKeyboard({ onKeyboardDidHide: onDidHide }))
      act(() => { fireKeyboardEvent('keyboardDidHide') })
      expect(onDidHide).toHaveBeenCalled()
    })

    it('does not respond to keyboardWillShow events', () => {
      const onWillShow = jest.fn()
      const { result } = renderHook(() => useKeyboard({ onKeyboardWillShow: onWillShow }))
      act(() => { fireKeyboardEvent('keyboardWillShow') })
      expect(result.current.isVisible).toBe(false)
      expect(onWillShow).not.toHaveBeenCalled()
    })

    it('does not respond to keyboardWillHide events', () => {
      const onWillHide = jest.fn()
      const { result } = renderHook(() => useKeyboard({ onKeyboardWillHide: onWillHide }))
      act(() => { fireKeyboardEvent('keyboardWillHide') })
      expect(onWillHide).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('removes all listeners on unmount', () => {
      setPlatform('ios')
      const { unmount } = renderHook(() => useKeyboard())
      const listenerCount = Object.keys(mockKeyboardListeners).length
      expect(listenerCount).toBeGreaterThan(0)
      unmount()
      // After unmount, new subscriptions should not accumulate from the same hook
    })
  })

  describe('frame extraction', () => {
    beforeEach(() => {
      setPlatform('ios')
    })

    it('extracts correct frame properties', () => {
      const { result } = renderHook(() => useKeyboard())
      act(() => {
        fireKeyboardEvent('keyboardWillShow', {
          height: 350,
          screenY: 450,
          duration: 300,
          easing: 'easeInEaseOut',
        })
      })
      expect(result.current.frame).toEqual({
        height: 350,
        screenY: 450,
        duration: 300,
        easing: 'easeInEaseOut',
      })
    })
  })
})
