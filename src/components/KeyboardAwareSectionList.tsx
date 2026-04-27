import React, { forwardRef, useImperativeHandle, useCallback } from 'react'
import { SectionList, Platform } from 'react-native'
import { useKeyboardAwareScroll } from '../hooks/useKeyboardAwareScroll'
import type {
  KeyboardAwareSectionListProps,
  KeyboardAwareScrollRef,
  ScrollEvent,
} from '../types'

const KeyboardAwareSectionListInner = forwardRef<
  KeyboardAwareScrollRef,
  KeyboardAwareSectionListProps<unknown>
>((props, ref) => {
  const {
    enableAutomaticScroll,
    extraScrollHeight,
    extraHeight,
    enableResetScrollToCoords,
    resetScrollToCoords,
    keyboardOpeningTime,
    viewIsInsideTabBar,
    enableOnAndroid,
    onKeyboardWillShow,
    onKeyboardWillHide,
    onKeyboardDidShow,
    onKeyboardDidHide,
    onScroll: propsOnScroll,
    contentContainerStyle,
    ...rest
  } = props

  const keyboardAware = useKeyboardAwareScroll({
    enableAutomaticScroll,
    extraScrollHeight,
    extraHeight,
    enableResetScrollToCoords,
    resetScrollToCoords,
    keyboardOpeningTime,
    viewIsInsideTabBar,
    enableOnAndroid,
    onKeyboardWillShow,
    onKeyboardWillHide,
    onKeyboardDidShow,
    onKeyboardDidHide,
  })

  useImperativeHandle(
    ref,
    () => ({
      getScrollResponder: keyboardAware.getScrollResponder,
      scrollToPosition: keyboardAware.scrollToPosition,
      scrollToEnd: keyboardAware.scrollToEnd,
      scrollToFocusedInput: keyboardAware.scrollToFocusedInput,
      scrollIntoView: keyboardAware.scrollIntoView,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyboardAware.getScrollResponder, keyboardAware.scrollToPosition],
  )

  const handleScroll = useCallback(
    (event: ScrollEvent) => {
      keyboardAware.handleScroll(event)
      if (typeof propsOnScroll === 'function') {
        ;(propsOnScroll as (event: ScrollEvent) => void)(event)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [propsOnScroll, keyboardAware.handleScroll],
  )

  const isAndroidEnabled = Platform.OS === 'android' && enableOnAndroid !== false

  const androidContentContainerStyle = isAndroidEnabled
    ? [
        contentContainerStyle,
        {
          paddingBottom:
            ((contentContainerStyle as Record<string, number>)?.paddingBottom || 0) +
            keyboardAware.keyboardSpace,
        },
      ]
      : contentContainerStyle

  return (
    <SectionList
      {...rest}
      ref={keyboardAware.handleRef}
      keyboardDismissMode="interactive"
      contentInset={{ bottom: Platform.OS === 'ios' ? keyboardAware.keyboardSpace : 0 }}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator
      scrollEventThrottle={1}
      onScroll={typeof propsOnScroll === 'function' ? handleScroll : keyboardAware.handleScroll}
      contentContainerStyle={androidContentContainerStyle ?? contentContainerStyle}
    />
  )
})

KeyboardAwareSectionListInner.displayName = 'KeyboardAwareSectionList'

export const KeyboardAwareSectionList = forwardRef<
  KeyboardAwareScrollRef,
  KeyboardAwareSectionListProps<unknown>
>(function KeyboardAwareSectionList(props, ref) {
  return <KeyboardAwareSectionListInner {...props} ref={ref} />
}) as <ItemT>(
  props: KeyboardAwareSectionListProps<ItemT> & { ref?: React.Ref<KeyboardAwareScrollRef> },
) => React.ReactElement | null
