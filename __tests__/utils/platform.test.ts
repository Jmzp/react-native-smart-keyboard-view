import { isIOS, isAndroid, DEFAULT_EXTRA_HEIGHT, DEFAULT_KEYBOARD_OPENING_TIME, DEFAULT_TAB_BAR_HEIGHT } from '../../src/utils/platform'
import { setPlatform } from '../helpers/mockRN'

describe('platform utils', () => {
  describe('isIOS', () => {
    it('returns true on iOS', () => {
      setPlatform('ios')
      expect(isIOS()).toBe(true)
    })

    it('returns false on Android', () => {
      setPlatform('android')
      expect(isIOS()).toBe(false)
    })

    it('returns false on unknown platform', () => {
      setPlatform('web')
      expect(isIOS()).toBe(false)
    })
  })

  describe('isAndroid', () => {
    it('returns true on Android', () => {
      setPlatform('android')
      expect(isAndroid()).toBe(true)
    })

    it('returns false on iOS', () => {
      setPlatform('ios')
      expect(isAndroid()).toBe(false)
    })

    it('returns false on unknown platform', () => {
      setPlatform('web')
      expect(isAndroid()).toBe(false)
    })
  })

  describe('constants', () => {
    it('has correct DEFAULT_EXTRA_HEIGHT', () => {
      expect(DEFAULT_EXTRA_HEIGHT).toBe(75)
    })

    it('has correct DEFAULT_KEYBOARD_OPENING_TIME', () => {
      expect(DEFAULT_KEYBOARD_OPENING_TIME).toBe(250)
    })

    it('has correct DEFAULT_TAB_BAR_HEIGHT', () => {
      expect(DEFAULT_TAB_BAR_HEIGHT).toBe(49)
    })
  })
})
