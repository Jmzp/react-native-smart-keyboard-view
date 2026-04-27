import { Platform } from 'react-native'

/** Returns `true` when running on iOS. */
export function isIOS(): boolean {
  return Platform.OS === 'ios'
}

/** Returns `true` when running on Android. */
export function isAndroid(): boolean {
  return Platform.OS === 'android'
}

/** Default extra height added above the keyboard (75 px). */
export const DEFAULT_EXTRA_HEIGHT = 75

/** Default delay before scrolling to the focused input (250 ms). */
export const DEFAULT_KEYBOARD_OPENING_TIME = 250

/** Default tab bar height used when `viewIsInsideTabBar` is `true`. */
export const DEFAULT_TAB_BAR_HEIGHT = 49
