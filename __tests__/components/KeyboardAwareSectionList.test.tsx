import React from 'react'
import { render } from '@testing-library/react-native'
import { KeyboardAwareSectionList } from '../../src/components/KeyboardAwareSectionList'
import { Text } from 'react-native'
import { setupKeyboardMock, setPlatform } from '../helpers/mockRN'

describe('KeyboardAwareSectionList', () => {
  beforeEach(() => {
    setupKeyboardMock()
    setPlatform('ios')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const sections = [
    {
      title: 'Section A',
      data: [{ id: '1', title: 'Item A1' }, { id: '2', title: 'Item A2' }],
    },
    {
      title: 'Section B',
      data: [{ id: '3', title: 'Item B1' }],
    },
  ]

  it('renders SectionList items', () => {
    const { getByText } = render(
      <KeyboardAwareSectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        renderSectionHeader={({ section }) => <Text>{section.title}</Text>}
      />,
    )
    expect(getByText('Section A')).toBeTruthy()
    expect(getByText('Section B')).toBeTruthy()
    expect(getByText('Item A1')).toBeTruthy()
    expect(getByText('Item B1')).toBeTruthy()
  })

  it('passes extra props to SectionList', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareSectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
        testID="sectionlist"
      />,
    )
    expect(UNSAFE_root.props.testID).toBe('sectionlist')
  })

  it('exposes ref methods via forwardRef', () => {
    const ref = React.createRef<any>()
    render(
      <KeyboardAwareSectionList
        ref={ref}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />,
    )
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current.scrollToPosition).toBe('function')
    expect(typeof ref.current.scrollToEnd).toBe('function')
    expect(typeof ref.current.getScrollResponder).toBe('function')
  })
})
