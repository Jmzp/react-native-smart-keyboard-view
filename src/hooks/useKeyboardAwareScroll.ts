import { useRef, useCallback, useEffect } from 'react'
import { TextInput, findNodeHandle, UIManager, Platform } from 'react-native'
import type {
  KeyboardAwareOptions,
  ContentOffset,
  ElementLayout,
  ScrollToInputOptions,
  ScrollIntoViewOptions,
  ScrollPosition,
  ScrollEvent,
} from '../types'
import { useKeyboard } from './useKeyboard'
import { measureElement } from '../utils/measureElement'
import { DEFAULT_EXTRA_HEIGHT, DEFAULT_KEYBOARD_OPENING_TIME } from '../utils/platform'

const DEFAULT_OPTIONS: Required<
  Pick<
    KeyboardAwareOptions,
    | 'enableAutomaticScroll'
    | 'extraScrollHeight'
    | 'extraHeight'
    | 'enableResetScrollToCoords'
    | 'keyboardOpeningTime'
    | 'viewIsInsideTabBar'
    | 'enableOnAndroid'
  >
> = {
  enableAutomaticScroll: true,
  extraScrollHeight: 0,
  extraHeight: DEFAULT_EXTRA_HEIGHT,
  enableResetScrollToCoords: true,
  keyboardOpeningTime: DEFAULT_KEYBOARD_OPENING_TIME,
  viewIsInsideTabBar: false,
  enableOnAndroid: true,
}

/**
 * Core hook that provides keyboard-aware scrolling behavior.
 *
 * Automatically scrolls the focused `TextInput` into view when the keyboard
 * appears and resets the scroll position when it hides. Also exposes
 * imperative methods via its return value for manual scroll control.
 *
 * @param options - Configuration options (all optional, sensible defaults).
 * @returns An object with ref handlers, scroll methods, and the current `keyboardSpace`.
 *
 * @example
 * ```tsx
 * const { handleRef, handleScroll, keyboardSpace, scrollToPosition } = useKeyboardAwareScroll()
 *
 * return (
 *   <ScrollView ref={handleRef} onScroll={handleScroll}>
 *     {children}
 *   </ScrollView>
 * )
 * ```
 */
export function useKeyboardAwareScroll(options: KeyboardAwareOptions = {}) {
  const filtered = Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined),
  ) as Partial<KeyboardAwareOptions>
  const opts = { ...DEFAULT_OPTIONS, ...filtered } as Required<
    Pick<
      KeyboardAwareOptions,
      | 'enableAutomaticScroll'
      | 'extraScrollHeight'
      | 'extraHeight'
      | 'enableResetScrollToCoords'
      | 'keyboardOpeningTime'
      | 'viewIsInsideTabBar'
      | 'enableOnAndroid'
    >
  > & Omit<KeyboardAwareOptions, keyof typeof DEFAULT_OPTIONS>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollViewRef = useRef<any>(null)
  const position = useRef<ContentOffset>({ x: 0, y: 0 })
  const defaultResetScrollToCoords = useRef<ContentOffset | null>(null)
  const isMounted = useRef(true)
  const scrollAnimationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const keyboard = useKeyboard({
    onKeyboardWillShow: opts.onKeyboardWillShow,
    onKeyboardWillHide: opts.onKeyboardWillHide,
    onKeyboardDidShow: opts.onKeyboardDidShow,
    onKeyboardDidHide: opts.onKeyboardDidHide,
  })

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (scrollAnimationTimeout.current) {
        clearTimeout(scrollAnimationTimeout.current)
      }
    }
  }, [])

  /** Returns the underlying scroll responder from the attached ScrollView. */
  const getScrollResponder = useCallback(() => {
    if (!scrollViewRef.current) return null
    if (typeof scrollViewRef.current.getScrollResponder === 'function') {
      return scrollViewRef.current.getScrollResponder()
    }
    return scrollViewRef.current
  }, [])

  /** Scrolls to the given x, y coordinates. */
  const scrollToPosition = useCallback(
    (x: number, y: number, animated = true) => {
      const responder = getScrollResponder()
      if (!responder) return

      if (typeof responder.scrollTo === 'function') {
        responder.scrollTo({ x, y, animated })
      }
    },
    [getScrollResponder],
  )

  /** Scrolls to the end of the scrollable content. */
  const scrollToEnd = useCallback(
    (animated = true) => {
      const responder = getScrollResponder()
      if (!responder) return

      if (typeof responder.scrollToEnd === 'function') {
        responder.scrollToEnd({ animated })
      }
    },
    [getScrollResponder],
  )

  /**
   * Measures the focused input and scrolls it above the keyboard.
   * Works without relying on `scrollResponderScrollNativeHandleToKeyboard`.
   */
  const scrollToFocusedInput = useCallback(
    (nodeHandle: number, scrollOptions?: ScrollToInputOptions) => {
      const extraHeight = scrollOptions?.extraHeight ?? opts.extraHeight
      const keyboardOpeningTime =
        scrollOptions?.keyboardOpeningTime ?? opts.keyboardOpeningTime

      if (scrollAnimationTimeout.current) {
        clearTimeout(scrollAnimationTimeout.current)
      }

      scrollAnimationTimeout.current = setTimeout(() => {
        if (!isMounted.current) return

        UIManager.measureInWindow(
          nodeHandle,
          (_x: number, y: number, _width: number, height: number) => {
            if (!isMounted.current || !keyboard.frame) return

            const textInputBottom = y + height
            const keyboardY = keyboard.frame.screenY
            const totalExtra = extraHeight + opts.extraScrollHeight

            if (textInputBottom > keyboardY - totalExtra) {
              const scrollIncrease = textInputBottom - keyboardY + totalExtra
              scrollToPosition(0, position.current.y + scrollIncrease, true)
            }
          },
        )
      }, keyboardOpeningTime)
    },
    [getScrollResponder, scrollToPosition, opts.extraScrollHeight, keyboard.frame],
  )

  /**
   * Measures both the scroll container and the target element, then scrolls
   * so the element becomes visible. A custom `getScrollPosition` can be provided.
   */
  const scrollIntoView = useCallback(
    async (
      element: React.Component<Record<string, unknown>> | null,
      intoViewOptions?: ScrollIntoViewOptions,
    ) => {
      if (!scrollViewRef.current || !element) return

      const [parentLayout, childLayout] = await Promise.all([
        measureElement(scrollViewRef.current),
        measureElement(element),
      ])

      const getScrollPosition =
        intoViewOptions?.getScrollPosition ?? defaultGetScrollPosition
      const { x, y, animated } = getScrollPosition(
        parentLayout,
        childLayout,
        position.current,
      )
      scrollToPosition(x, y, animated)
    },
    [scrollToPosition],
  )

  /** Tracks the current scroll offset from scroll events. */
  const handleScroll = useCallback((event: ScrollEvent) => {
    position.current = event.nativeEvent.contentOffset
  }, [])

  /** Callback ref that captures the ScrollView instance. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRef = useCallback((ref: any) => {
    scrollViewRef.current = ref
  }, [])

  /** Returns the native node handle of the currently focused TextInput. */
  const getCurrentlyFocusedInput = useCallback((): number | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentInput = (TextInput.State as any).currentlyFocusedInput
    if (currentInput) {
      const ref = typeof currentInput === 'function' ? currentInput() : currentInput
      const handle = ref ? findNodeHandle(ref) : null
      if (handle) return handle
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentField = (TextInput.State as any).currentlyFocusedField
    if (currentField) {
      const field = typeof currentField === 'function' ? currentField() : currentField
      if (typeof field === 'number') return field
    }

    return null
  }, [])

  /** Re-triggers the automatic scroll to the currently focused input. */
  const update = useCallback(() => {
    const currentlyFocused = getCurrentlyFocusedInput()
    if (!currentlyFocused) return
    scrollToFocusedInput(currentlyFocused)
  }, [getCurrentlyFocusedInput, scrollToFocusedInput])

  // Automatically scroll when the keyboard appears and a child input is focused.
  useEffect(() => {
    if (!opts.enableAutomaticScroll) return
    if (Platform.OS === 'android' && !opts.enableOnAndroid) return
    if (!keyboard.isVisible) return
    if (!keyboard.frame) return

    let currentlyFocused: number | null = null
    try {
      currentlyFocused = getCurrentlyFocusedInput()
      if (!currentlyFocused) return
    } catch {
      return
    }

    UIManager.measureInWindow(
      currentlyFocused,
      (_x: number, y: number, _width: number, height: number) => {
        if (!isMounted.current || !keyboard.frame) return

        const textInputBottom = y + height
        const keyboardY = keyboard.frame.screenY
        const totalExtra = opts.extraScrollHeight + opts.extraHeight

        if (Platform.OS === 'ios') {
          if (textInputBottom > keyboardY - totalExtra) {
            scrollToFocusedInput(currentlyFocused)
          }
        } else {
          if (textInputBottom > keyboardY) {
            const scrollIncrease = textInputBottom - keyboardY + totalExtra
            scrollToPosition(0, position.current.y + scrollIncrease, true)
          } else if (textInputBottom > keyboardY - totalExtra) {
            const scrollIncrease = totalExtra - (keyboardY - textInputBottom)
            scrollToPosition(0, position.current.y + scrollIncrease, true)
          }
        }
      },
    )

    if (opts.enableResetScrollToCoords && !opts.resetScrollToCoords) {
      if (!defaultResetScrollToCoords.current) {
        defaultResetScrollToCoords.current = { ...position.current }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard.isVisible, keyboard.height])

  // Reset scroll position when the keyboard hides.
  useEffect(() => {
    if (keyboard.isVisible || !isMounted.current) return

    if (!opts.enableResetScrollToCoords) {
      defaultResetScrollToCoords.current = null
      return
    }

    if (opts.resetScrollToCoords) {
      scrollToPosition(opts.resetScrollToCoords.x, opts.resetScrollToCoords.y, true)
    } else if (defaultResetScrollToCoords.current) {
      scrollToPosition(
        defaultResetScrollToCoords.current.x,
        defaultResetScrollToCoords.current.y,
        true,
      )
      defaultResetScrollToCoords.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboard.isVisible])

  const keyboardSpace = keyboard.isVisible
    ? keyboard.height + opts.extraScrollHeight
    : 0

  return {
    handleRef,
    handleScroll,
    keyboardSpace,
    getScrollResponder,
    scrollToPosition,
    scrollToEnd,
    scrollToFocusedInput: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref: React.RefObject<any>,
      scrollOpts?: ScrollToInputOptions,
    ) => {
      const node = ref.current ? findNodeHandle(ref.current) : null
      if (node) scrollToFocusedInput(node, scrollOpts)
    },
    scrollIntoView,
    update,
  }
}

/** Default scroll position calculator for `scrollIntoView`. */
function defaultGetScrollPosition(
  parentLayout: ElementLayout,
  childLayout: ElementLayout,
  contentOffset: ContentOffset,
): ScrollPosition {
  return {
    x: 0,
    y: Math.max(0, childLayout.y - parentLayout.y + contentOffset.y),
    animated: true,
  }
}
