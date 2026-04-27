import { useRef, useCallback, useEffect } from 'react'
import { TextInput, findNodeHandle, UIManager } from 'react-native'
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
import {
  isIOS,
  isAndroid,
  DEFAULT_EXTRA_HEIGHT,
  DEFAULT_KEYBOARD_OPENING_TIME,
} from '../utils/platform'

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
  const opts = { ...DEFAULT_OPTIONS, ...options }

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
   * Scrolls to bring the native node corresponding to a focused input into view.
   * Uses the native `scrollResponderScrollNativeHandleToKeyboard` method.
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

        const responder = getScrollResponder()
        if (
          !responder ||
          typeof responder.scrollResponderScrollNativeHandleToKeyboard !== 'function'
        ) {
          return
        }

        responder.scrollResponderScrollNativeHandleToKeyboard(
          nodeHandle,
          extraHeight + opts.extraScrollHeight,
          true,
        )
      }, keyboardOpeningTime)
    },
    [getScrollResponder, opts.extraHeight, opts.extraScrollHeight, opts.keyboardOpeningTime],
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
    const focusedInput = TextInput.State.currentlyFocusedInput
      ? findNodeHandle(TextInput.State.currentlyFocusedInput())
      : null

    if (focusedInput) return focusedInput

    const focusedField = TextInput.State.currentlyFocusedField
      ? TextInput.State.currentlyFocusedField()
      : null

    return focusedField
  }, [])

  /** Scrolls down by `extraHeight` — used on Android to reveal inputs behind the keyboard. */
  const scrollForExtraHeightOnAndroid = useCallback(
    (extraHeight: number) => {
      scrollToPosition(0, position.current.y + extraHeight, true)
    },
    [scrollToPosition],
  )

  /** Re-triggers the automatic scroll to the currently focused input. */
  const update = useCallback(() => {
    const currentlyFocused = getCurrentlyFocusedInput()
    if (!currentlyFocused) return
    scrollToFocusedInput(currentlyFocused)
  }, [getCurrentlyFocusedInput, scrollToFocusedInput])

  // Automatically scroll when the keyboard appears and a child input is focused.
  useEffect(() => {
    if (!opts.enableAutomaticScroll) return
    if (isAndroid() && !opts.enableOnAndroid) return
    if (!keyboard.isVisible || !keyboard.frame) return

    const currentlyFocused = getCurrentlyFocusedInput()
    const responder = getScrollResponder()
    if (!currentlyFocused || !responder) return

    const innerViewNode =
      typeof responder.getInnerViewNode === 'function'
        ? responder.getInnerViewNode()
        : null

    if (!innerViewNode) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uiManager = UIManager as any
    if (typeof uiManager.viewIsDescendantOf !== 'function') return

    uiManager.viewIsDescendantOf(
      currentlyFocused,
      innerViewNode,
      (isAncestor: boolean) => {
        if (!isAncestor || !isMounted.current) return

        UIManager.measureInWindow(
          currentlyFocused,
          (_x: number, y: number, _width: number, height: number) => {
            if (!isMounted.current) return

            const textInputBottom = y + height
            const keyboardY = keyboard.frame!.screenY
            const totalExtra = opts.extraScrollHeight + opts.extraHeight

            if (isIOS()) {
              if (textInputBottom > keyboardY - totalExtra) {
                scrollToFocusedInput(currentlyFocused)
              }
            } else {
              if (textInputBottom > keyboardY) {
                scrollForExtraHeightOnAndroid(totalExtra)
              } else if (textInputBottom > keyboardY - totalExtra) {
                scrollForExtraHeightOnAndroid(
                  totalExtra - (keyboardY - textInputBottom),
                )
              }
            }
          },
        )
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
