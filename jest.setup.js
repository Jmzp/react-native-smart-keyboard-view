const mockKeyboardListeners = {}

const mockKeyboard = {
  addListener: jest.fn((eventName, callback) => {
    if (!mockKeyboardListeners[eventName]) {
      mockKeyboardListeners[eventName] = []
    }
    mockKeyboardListeners[eventName].push(callback)
    return { remove: jest.fn() }
  }),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
}

const mockUIManager = {
  measureInWindow: jest.fn(),
  viewIsDescendantOf: jest.fn(),
}

const mockTextInputState = {
  currentlyFocusedInput: null,
  currentlyFocusedField: jest.fn(() => null),
}

let mockPlatformOS = 'ios'

global.__mockPlatformOS = mockPlatformOS

Object.defineProperty(global, '__MOCK_SETUP__', {
  value: {
    mockKeyboard,
    mockKeyboardListeners,
    mockUIManager,
    mockTextInputState,
    getPlatformOS: () => mockPlatformOS,
    setPlatformOS: (os) => { mockPlatformOS = os },
    resetMocks: () => {
      Object.keys(mockKeyboardListeners).forEach((key) => {
        mockKeyboardListeners[key].length = 0
      })
      mockTextInputState.currentlyFocusedInput = null
      mockTextInputState.currentlyFocusedField.mockReturnValue(null)
      mockUIManager.measureInWindow.mockReset()
      mockUIManager.viewIsDescendantOf.mockReset()
      mockPlatformOS = 'ios'
    },
  },
})

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native')

  ReactNative.Keyboard = global.__MOCK_SETUP__.mockKeyboard
  ReactNative.UIManager = {
    ...ReactNative.UIManager,
    ...global.__MOCK_SETUP__.mockUIManager,
  }
  ReactNative.TextInput.State = global.__MOCK_SETUP__.mockTextInputState

  Object.defineProperty(ReactNative.Platform, 'OS', {
    get: () => global.__MOCK_SETUP__.getPlatformOS(),
    configurable: true,
  })

  return ReactNative
})
