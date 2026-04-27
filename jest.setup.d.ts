declare global {
  var __MOCK_SETUP__: {
    mockKeyboard: any
    mockKeyboardListeners: Record<string, Array<(event: any) => void>>
    mockUIManager: any
    mockTextInputState: any
    getPlatformOS: () => string
    setPlatformOS: (os: string) => void
    resetMocks: () => void
  }
}

export {}
