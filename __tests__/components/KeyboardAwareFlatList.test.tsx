import React from 'react'
import { render } from '@testing-library/react-native'
import { KeyboardAwareFlatList } from '../../src/components/KeyboardAwareFlatList'
import { Text } from 'react-native'
import { setupKeyboardMock, setPlatform } from '../helpers/mockRN'

describe('KeyboardAwareFlatList', () => {
  beforeEach(() => {
    setupKeyboardMock()
    setPlatform('ios')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const data = [
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' },
  ]

  it('renders FlatList items', () => {
    const { getByText } = render(
      <KeyboardAwareFlatList
        data={data}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
      />,
    )
    expect(getByText('Item 1')).toBeTruthy()
    expect(getByText('Item 2')).toBeTruthy()
    expect(getByText('Item 3')).toBeTruthy()
  })

  it('passes extra props to FlatList', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareFlatList
        data={data}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
        testID="flatlist"
      />,
    )
    expect(UNSAFE_root.props.testID).toBe('flatlist')
  })

  it('exposes ref methods via forwardRef', () => {
    const ref = React.createRef<any>()
    render(
      <KeyboardAwareFlatList
        ref={ref}
        data={data}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        keyExtractor={(item) => item.id}
      />,
    )
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current.scrollToPosition).toBe('function')
    expect(typeof ref.current.scrollToEnd).toBe('function')
    expect(typeof ref.current.getScrollResponder).toBe('function')
  })
})
