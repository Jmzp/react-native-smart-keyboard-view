import { useState, useEffect, useCallback, useRef } from 'react'
import { Keyboard, Platform, Dimensions } from 'react-native'
import type { KeyboardFrame } from '../types'

interface KeyboardState {
  isVisible: boolean
  height: number
  frame: KeyboardFrame | null
}

/**
 * Hook that tracks keyboard visibility and dimensions.
 *
 * On iOS it listens to `willShow`/`willHide` for immediate feedback.
 * On Android it falls back to `didShow`/`didHide` since `will` events are not available.
 *
 * @param options - Optional callbacks for each keyboard lifecycle event.
 * @returns Current keyboard state: `{ isVisible, height, frame }`.
 *
 * @example
 * ```tsx
 * const { isVisible, height } = useKeyboard()
 * ```
 */
export function useKeyboard(options?: {
  onKeyboardWillShow?: (frame: KeyboardFrame) => void
  onKeyboardWillHide?: (frame: KeyboardFrame) => void
  onKeyboardDidShow?: (frame: KeyboardFrame) => void
  onKeyboardDidHide?: (frame: KeyboardFrame) => void
}) {
  const [state, setState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    frame: null,
  })

  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const extractFrame = useCallback(
    (event: { endCoordinates: { height: number; screenY: number }; duration: number; easing: string }): KeyboardFrame => ({
      height: event.endCoordinates.height,
      screenY: event.endCoordinates.screenY,
      duration: event.duration,
      easing: event.easing,
    }),
    [],
  )

  useEffect(() => {
    const listeners: Array<{ remove: () => void }> = []

    if (Platform.OS === 'ios') {
      listeners.push(
        Keyboard.addListener('keyboardWillShow', (e) => {
          const frame = extractFrame(e)
          setState({ isVisible: true, height: frame.height, frame })
          optionsRef.current?.onKeyboardWillShow?.(frame)
        }),
        Keyboard.addListener('keyboardWillHide', (e) => {
          const frame = extractFrame(e)
          setState({ isVisible: false, height: 0, frame })
          optionsRef.current?.onKeyboardWillHide?.(frame)
        }),
        Keyboard.addListener('keyboardDidShow', (e) => {
          const frame = extractFrame(e)
          optionsRef.current?.onKeyboardDidShow?.(frame)
        }),
        Keyboard.addListener('keyboardDidHide', (e) => {
          const frame = extractFrame(e)
          optionsRef.current?.onKeyboardDidHide?.(frame)
        }),
      )
    } else {
      listeners.push(
        Keyboard.addListener('keyboardDidShow', (e) => {
          const frame = extractFrame(e)
          const actualHeight = frame.height > 0 ? frame.height : Dimensions.get('window').height - frame.screenY
          setState({ isVisible: true, height: actualHeight, frame: { ...frame, height: actualHeight } })
          optionsRef.current?.onKeyboardDidShow?.(frame)
        }),
        Keyboard.addListener('keyboardDidHide', (e) => {
          const frame = extractFrame(e)
          setState({ isVisible: false, height: 0, frame })
          optionsRef.current?.onKeyboardDidHide?.(frame)
        }),
      )
    }

    return () => {
      listeners.forEach((l) => l.remove())
    }
  }, [extractFrame])

  return state
}
