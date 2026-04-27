import { useState, useEffect, useCallback, useRef } from 'react'
import { Keyboard, Platform } from 'react-native'
import type { KeyboardFrame } from '../types'

interface KeyboardState {
  isVisible: boolean
  height: number
  frame: KeyboardFrame | null
}

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
  optionsRef.current = options

  const extractFrame = useCallback(
    (event: any): KeyboardFrame => ({
      height: event.endCoordinates.height,
      screenY: event.endCoordinates.screenY,
      duration: event.duration,
      easing: event.easing,
    }),
    [],
  )

  useEffect(() => {
    const listeners: Array<any> = []

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
          setState({ isVisible: true, height: frame.height, frame })
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
