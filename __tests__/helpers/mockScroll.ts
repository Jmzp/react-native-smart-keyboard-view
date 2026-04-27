export const DEFAULT_SCROLL_RESPONDER = {
  scrollTo: jest.fn(),
  scrollToEnd: jest.fn(),
  getScrollResponder: jest.fn(function (this: any) {
    return this
  }),
  getInnerViewNode: jest.fn(() => 'inner-view-node'),
  scrollResponderScrollNativeHandleToKeyboard: jest.fn(),
}

export function createMockRef(responder: any = { ...DEFAULT_SCROLL_RESPONDER }) {
  const ref = {
    ...responder,
    getScrollResponder: jest.fn(() => ref),
  }
  return ref
}
