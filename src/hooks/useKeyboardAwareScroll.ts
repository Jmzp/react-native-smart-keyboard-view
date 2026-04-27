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

  const getScrollResponder = useCallback(() => {
    if (!scrollViewRef.current) return null
    if (typeof scrollViewRef.current.getScrollResponder === 'function') {
      return scrollViewRef.current.getScrollResponder()
    }
    return scrollViewRef.current
  }, [])

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

  const handleScroll = useCallback((event: ScrollEvent) => {
    position.current = event.nativeEvent.contentOffset
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRef = useCallback((ref: any) => {
    scrollViewRef.current = ref
  }, [])

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

  const scrollForExtraHeightOnAndroid = useCallback(
    (extraHeight: number) => {
      scrollToPosition(0, position.current.y + extraHeight, true)
    },
    [scrollToPosition],
  )

  const update = useCallback(() => {
    const currentlyFocused = getCurrentlyFocusedInput()
    if (!currentlyFocused) return
    scrollToFocusedInput(currentlyFocused)
  }, [getCurrentlyFocusedInput, scrollToFocusedInput])

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
