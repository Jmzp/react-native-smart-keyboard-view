import type {
  ScrollView,
  ScrollViewProps,
  FlatListProps,
  SectionListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'

/** Keyboard frame information from native events. */
export interface KeyboardFrame {
  height: number
  screenY: number
  duration: number
  easing: string
}

/** Options shared by all keyboard-aware components and the `useKeyboardAwareScroll` hook. */
export interface KeyboardAwareOptions {
  /** Auto-scroll to the focused TextInput when the keyboard appears. @default true */
  enableAutomaticScroll?: boolean
  /** Extra scroll height added below the focused input. @default 0 */
  extraScrollHeight?: number
  /** Extra height offset above the keyboard. @default 75 */
  extraHeight?: number
  /** Reset scroll position when the keyboard hides. @default true */
  enableResetScrollToCoords?: boolean
  /** Custom coordinates to reset to when the keyboard hides. */
  resetScrollToCoords?: { x: number; y: number }
  /** Delay in ms before scrolling to the focused input. @default 250 */
  keyboardOpeningTime?: number
  /** Whether the view is rendered inside a TabBar. @default false */
  viewIsInsideTabBar?: boolean
  /** Enable keyboard handling on Android. @default true */
  enableOnAndroid?: boolean
  /** Called right before the keyboard shows (iOS only). */
  onKeyboardWillShow?: (frames: KeyboardFrame) => void
  /** Called right before the keyboard hides (iOS only). */
  onKeyboardWillHide?: (frames: KeyboardFrame) => void
  /** Called after the keyboard has shown. */
  onKeyboardDidShow?: (frames: KeyboardFrame) => void
  /** Called after the keyboard has hidden. */
  onKeyboardDidHide?: (frames: KeyboardFrame) => void
}

/** Options for `scrollToFocusedInput`. */
export interface ScrollToInputOptions {
  extraHeight?: number
  keyboardOpeningTime?: number
  animated?: boolean
}

/** Options for `scrollIntoView`. */
export interface ScrollIntoViewOptions {
  /** Custom function to compute the target scroll position. */
  getScrollPosition?: (
    parentLayout: ElementLayout,
    childLayout: ElementLayout,
    contentOffset: ContentOffset,
  ) => ScrollPosition
  animated?: boolean
}

/** Measured layout of a React element. */
export interface ElementLayout {
  x: number
  y: number
  width: number
  height: number
}

/** Content offset of a scroll view. */
export interface ContentOffset {
  x: number
  y: number
}

/** Target scroll position with animation flag. */
export interface ScrollPosition {
  x: number
  y: number
  animated: boolean
}

/** Imperative handle exposed by keyboard-aware components via `ref`. */
export interface KeyboardAwareScrollRef {
  /** Returns the underlying ScrollView responder, or null. */
  getScrollResponder: () => ScrollView | null
  /** Scrolls to the given x, y coordinates. */
  scrollToPosition: (x: number, y: number, animated?: boolean) => void
  /** Scrolls to the end of the content. */
  scrollToEnd: (animated?: boolean) => void
  /** Scrolls to bring a specific TextInput into view. */
  scrollToFocusedInput: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.RefObject<any>,
    options?: ScrollToInputOptions,
  ) => void
  /** Scrolls to make an arbitrary element visible. */
  scrollIntoView: (
    element: React.Component<Record<string, unknown>> | null,
    options?: ScrollIntoViewOptions,
  ) => void
  /** Re-triggers scroll to the currently focused input. */
  update: () => void
}

export type KeyboardAwareScrollViewProps = ScrollViewProps & KeyboardAwareOptions
export type KeyboardAwareFlatListProps<ItemT> = FlatListProps<ItemT> & KeyboardAwareOptions
export type KeyboardAwareSectionListProps<ItemT> = SectionListProps<ItemT> & KeyboardAwareOptions

export type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>
