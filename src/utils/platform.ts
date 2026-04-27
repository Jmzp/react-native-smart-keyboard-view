import { Platform } from 'react-native'

export function isIOS(): boolean {
  return Platform.OS === 'ios'
}

export function isAndroid(): boolean {
  return Platform.OS === 'android'
}

export const DEFAULT_EXTRA_HEIGHT = 75
export const DEFAULT_KEYBOARD_OPENING_TIME = 250
export const DEFAULT_TAB_BAR_HEIGHT = 49
