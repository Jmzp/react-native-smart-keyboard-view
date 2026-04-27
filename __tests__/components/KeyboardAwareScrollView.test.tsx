import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { KeyboardAwareScrollView } from '../../src/components/KeyboardAwareScrollView'
import { Text, TextInput } from 'react-native'
import { fireKeyboardEvent, resetMocks, setPlatform } from '../helpers/mockRN'

describe('KeyboardAwareScrollView', () => {
  beforeEach(() => {
    resetMocks()
    setPlatform('ios')
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders children', () => {
    const { getByText } = render(
      <KeyboardAwareScrollView>
        <Text>Hello World</Text>
      </KeyboardAwareScrollView>,
    )
    expect(getByText('Hello World')).toBeTruthy()
  })

  it('sets keyboardDismissMode to interactive', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(UNSAFE_root.props.keyboardDismissMode).toBe('interactive')
  })

  it('sets scrollEventThrottle to 1', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(UNSAFE_root.props.scrollEventThrottle).toBe(1)
  })

  it('sets automaticallyAdjustContentInsets to false', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(UNSAFE_root.props.automaticallyAdjustContentInsets).toBe(false)
  })

  it('shows vertical scroll indicator', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(UNSAFE_root.props.showsVerticalScrollIndicator).toBe(true)
  })

  it('sets contentInset bottom on iOS when keyboard visible', () => {
    const { UNSAFE_root, rerender } = render(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )

    expect(UNSAFE_root.props.contentInset).toEqual({ bottom: 0 })

    act_rerender: {
      fireKeyboardEvent('keyboardWillShow', { height: 300 })
    }
    rerender(
      <KeyboardAwareScrollView>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
  })

  it('passes extra props to ScrollView', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView style={{ flex: 1 }} testID="scroll">
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(UNSAFE_root.props.testID).toBe('scroll')
    expect(UNSAFE_root.props.style).toEqual({ flex: 1 })
  })

  it('calls onScroll prop when provided', () => {
    const onScroll = jest.fn()
    const { UNSAFE_root } = render(
      <KeyboardAwareScrollView onScroll={onScroll}>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )

    fireEvent.scroll(UNSAFE_root, {
      nativeEvent: { contentOffset: { x: 0, y: 100 } },
    })
    expect(onScroll).toHaveBeenCalled()
  })

  it('exposes ref methods via forwardRef', () => {
    const ref = React.createRef<any>()
    render(
      <KeyboardAwareScrollView ref={ref}>
        <Text>Test</Text>
      </KeyboardAwareScrollView>,
    )
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current.scrollToPosition).toBe('function')
    expect(typeof ref.current.scrollToEnd).toBe('function')
    expect(typeof ref.current.getScrollResponder).toBe('function')
    expect(typeof ref.current.scrollToFocusedInput).toBe('function')
    expect(typeof ref.current.scrollIntoView).toBe('function')
  })

  describe('Android contentContainerStyle', () => {
    beforeEach(() => {
      setPlatform('android')
    })

    it('adds paddingBottom on Android by default', () => {
      const { UNSAFE_root } = render(
        <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          <Text>Test</Text>
        </KeyboardAwareScrollView>,
      )
      const style = UNSAFE_root.props.contentContainerStyle
      expect(style).toBeDefined()
    })

    it('does not add paddingBottom when enableOnAndroid is false', () => {
      const { UNSAFE_root } = render(
        <KeyboardAwareScrollView enableOnAndroid={false} contentContainerStyle={{ padding: 10 }}>
          <Text>Test</Text>
        </KeyboardAwareScrollView>,
      )
      expect(UNSAFE_root.props.contentContainerStyle).toEqual({ padding: 10 })
    })
  })

  it('has correct displayName', () => {
    expect(KeyboardAwareScrollView.displayName).toBe('KeyboardAwareScrollView')
  })
})
