import type {
  ScrollView,
  ScrollViewProps,
  FlatListProps,
  SectionListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'

export interface KeyboardFrame {
  height: number
  screenY: number
  duration: number
  easing: string
}

export interface KeyboardAwareOptions {
  enableAutomaticScroll?: boolean
  extraScrollHeight?: number
  extraHeight?: number
  enableResetScrollToCoords?: boolean
  resetScrollToCoords?: { x: number; y: number }
  keyboardOpeningTime?: number
  viewIsInsideTabBar?: boolean
  enableOnAndroid?: boolean
  onKeyboardWillShow?: (frames: KeyboardFrame) => void
  onKeyboardWillHide?: (frames: KeyboardFrame) => void
  onKeyboardDidShow?: (frames: KeyboardFrame) => void
  onKeyboardDidHide?: (frames: KeyboardFrame) => void
}

export interface ScrollToInputOptions {
  extraHeight?: number
  keyboardOpeningTime?: number
  animated?: boolean
}

export interface ScrollIntoViewOptions {
  getScrollPosition?: (
    parentLayout: ElementLayout,
    childLayout: ElementLayout,
    contentOffset: ContentOffset,
  ) => ScrollPosition
  animated?: boolean
}

export interface ElementLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface ContentOffset {
  x: number
  y: number
}

export interface ScrollPosition {
  x: number
  y: number
  animated: boolean
}

export interface KeyboardAwareScrollRef {
  getScrollResponder: () => ScrollView | null
  scrollToPosition: (x: number, y: number, animated?: boolean) => void
  scrollToEnd: (animated?: boolean) => void
  scrollToFocusedInput: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.RefObject<any>,
    options?: ScrollToInputOptions,
  ) => void
  scrollIntoView: (
    element: React.Component<Record<string, unknown>> | null,
    options?: ScrollIntoViewOptions,
  ) => void
}

export type KeyboardAwareScrollViewProps = ScrollViewProps & KeyboardAwareOptions
export type KeyboardAwareFlatListProps<ItemT> = FlatListProps<ItemT> & KeyboardAwareOptions
export type KeyboardAwareSectionListProps<ItemT> = SectionListProps<ItemT> & KeyboardAwareOptions

export type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>
