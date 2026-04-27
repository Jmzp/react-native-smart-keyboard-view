import { Keyboard, Platform, UIManager, TextInput } from 'react-native'

export let mockKeyboardListeners: Record<string, Array<(event: any) => void>> = {}

export function setupKeyboardMock() {
  mockKeyboardListeners = {}
  jest.spyOn(Keyboard, 'addListener').mockImplementation(
    ((eventName: string, callback: (e: any) => void) => {
      if (!mockKeyboardListeners[eventName]) {
        mockKeyboardListeners[eventName] = []
      }
      mockKeyboardListeners[eventName].push(callback)
      return { remove: jest.fn() }
    }) as any,
  )
}

export function fireKeyboardEvent(eventName: string, coordinates: Record<string, any> = {}) {
  const { duration, easing, ...endCoords } = coordinates
  const event = {
    endCoordinates: {
      height: 336,
      screenY: 500,
      ...endCoords,
    },
    duration: duration ?? 250,
    easing: easing ?? 'keyboard',
  }
  const listeners = mockKeyboardListeners[eventName] || []
  listeners.forEach((cb) => cb(event))
  return event
}

let originalPlatformDescriptor: PropertyDescriptor | undefined

export function setPlatform(os: string) {
  originalPlatformDescriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')
  Object.defineProperty(Platform, 'OS', {
    get: () => os,
    configurable: true,
  })
}

export function restorePlatform() {
  if (originalPlatformDescriptor) {
    Object.defineProperty(Platform, 'OS', originalPlatformDescriptor)
  }
}

export function setupUIManagerMock() {
  ;(UIManager as any).measureInWindow = jest.fn()
  ;(UIManager as any).viewIsDescendantOf = jest.fn()
}

export function clearUIManagerMocks() {
  if (typeof (UIManager as any).measureInWindow?.mockClear === 'function') {
    ;(UIManager as any).measureInWindow.mockClear()
  }
  if (typeof (UIManager as any).viewIsDescendantOf?.mockClear === 'function') {
    ;(UIManager as any).viewIsDescendantOf.mockClear()
  }
}

export function setupTextInputStateMock() {
  jest.spyOn(TextInput.State, 'currentlyFocusedField').mockReturnValue(null as any)
  Object.defineProperty(TextInput.State, 'currentlyFocusedInput', {
    get: () => (() => null),
    configurable: true,
  })
}

export function setFocusedInput(input: any) {
  const mockFn = typeof input === 'function' ? input : () => input
  Object.defineProperty(TextInput.State, 'currentlyFocusedInput', {
    get: () => mockFn,
    configurable: true,
  })
}

export function mockFindNodeHandle(...returnValues: any[]) {
  const spy = jest.spyOn(require('react-native'), 'findNodeHandle')
  if (returnValues.length === 1) {
    spy.mockReturnValue(returnValues[0])
  } else {
    returnValues.forEach((val) => {
      spy.mockReturnValueOnce(val)
    })
  }
  return spy
}
