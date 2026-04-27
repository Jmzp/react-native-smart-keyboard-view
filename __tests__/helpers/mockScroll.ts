export function createMockScrollResponder() {
  return {
    scrollResponderScrollTo: jest.fn(),
    scrollResponderScrollToEnd: jest.fn(),
    scrollResponderScrollNativeHandleToKeyboard: jest.fn(),
    scrollResponderGetScrollableNode: jest.fn(() => ({})),
    scrollResponderGetInnerViewNode: jest.fn(() => 'innerViewNode'),
    scrollResponderGetScrollRef: jest.fn(() => ({})),
    scrollTo: jest.fn(),
    scrollToEnd: jest.fn(),
    getScrollResponder: jest.fn(),
    getInnerViewNode: jest.fn(() => 'innerViewNode'),
  }
}

export function setupScrollResponder(
  handleRef: (ref: any) => void,
) {
  const responder = createMockScrollResponder()
  const ref = {
    ...responder,
    getScrollResponder: jest.fn(() => responder),
  }
  handleRef(ref)
  return { ref, responder }
}

export const DEFAULT_SCROLL_RESPONDER = createMockScrollResponder()
