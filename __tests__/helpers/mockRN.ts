export const mockKeyboardListeners: Record<string, Array<(event: any) => void>> =
  global.__MOCK_SETUP__.mockKeyboardListeners

export const mockUIManager = global.__MOCK_SETUP__.mockUIManager
export const mockTextInputState = global.__MOCK_SETUP__.mockTextInputState
export const mockKeyboard = global.__MOCK_SETUP__.mockKeyboard

export function setPlatform(os: string) {
  global.__MOCK_SETUP__.setPlatformOS(os)
}

export function resetMocks() {
  global.__MOCK_SETUP__.resetMocks()
}

export function fireKeyboardEvent(eventName: string, coordinates: any = {}) {
  const event = {
    endCoordinates: {
      height: 336,
      screenY: 500,
      duration: 250,
      easing: 'keyboard',
      ...coordinates,
    },
    duration: 250,
    easing: 'keyboard',
  }
  const listeners = mockKeyboardListeners[eventName] || []
  listeners.forEach((cb) => cb(event))
  return event
}
