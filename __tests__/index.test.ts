import * as exports from '../src/index'

describe('index exports', () => {
  it('exports KeyboardAwareScrollView', () => {
    expect(exports.KeyboardAwareScrollView).toBeDefined()
  })

  it('exports KeyboardAwareFlatList', () => {
    expect(exports.KeyboardAwareFlatList).toBeDefined()
  })

  it('exports KeyboardAwareSectionList', () => {
    expect(exports.KeyboardAwareSectionList).toBeDefined()
  })

  it('exports useKeyboardAwareScroll', () => {
    expect(exports.useKeyboardAwareScroll).toBeDefined()
  })

  it('exports useKeyboard', () => {
    expect(exports.useKeyboard).toBeDefined()
  })
})
