# react-native-smart-keyboard-view

A modern, TypeScript-native keyboard-aware scroll view for React Native. Built with hooks, `forwardRef`, and full type safety.

A complete rewrite of the popular `react-native-keyboard-aware-scroll-view` (5.4k+ stars), fixing critical bugs and bringing the library up to modern React Native standards.

## Features

- TypeScript native with full type exports
- React Hooks architecture (`useKeyboardAwareScroll`, `useKeyboard`)
- `forwardRef` + `useImperativeHandle` for proper ref handling
- `KeyboardAwareScrollView`, `KeyboardAwareFlatList`, `KeyboardAwareSectionList`
- Fixed: Android 15/16 compatibility
- Fixed: Screen bouncing when focusing inputs
- Fixed: Reset to top when switching TextInputs
- Fixed: Ref methods (`scrollTo`, `scrollToEnd`, etc.) working correctly
- Works with React Native 0.72+

## Installation

```bash
npm install react-native-smart-keyboard-view
# or
yarn add react-native-smart-keyboard-view
```

## Usage

### KeyboardAwareScrollView

```tsx
import { KeyboardAwareScrollView } from 'react-native-smart-keyboard-view'

function MyScreen() {
  return (
    <KeyboardAwareScrollView style={{ flex: 1 }}>
      <TextInput placeholder="First input" />
      <TextInput placeholder="Second input" />
      <TextInput placeholder="Third input" />
    </KeyboardAwareScrollView>
  )
}
```

### With Ref

```tsx
import { useRef } from 'react'
import { KeyboardAwareScrollView, KeyboardAwareScrollRef } from 'react-native-smart-keyboard-view'

function MyScreen() {
  const scrollRef = useRef<KeyboardAwareScrollRef>(null)

  const scrollToTop = () => {
    scrollRef.current?.scrollToPosition(0, 0, true)
  }

  return (
    <KeyboardAwareScrollView ref={scrollRef} style={{ flex: 1 }}>
      {/* ... */}
    </KeyboardAwareScrollView>
  )
}
```

### KeyboardAwareFlatList

```tsx
import { KeyboardAwareFlatList } from 'react-native-smart-keyboard-view'

function MyList() {
  return (
    <KeyboardAwareFlatList
      data={items}
      renderItem={({ item }) => <TextInput value={item.value} />}
      extraHeight={100}
    />
  )
}
```

### useKeyboard Hook

```tsx
import { useKeyboard } from 'react-native-smart-keyboard-view'

function MyComponent() {
  const { isVisible, height } = useKeyboard()

  return (
    <View style={{ paddingBottom: isVisible ? height : 0 }}>
      {/* content */}
    </View>
  )
}
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableAutomaticScroll` | `boolean` | `true` | Auto-scroll to focused TextInput |
| `extraHeight` | `number` | `75` | Extra offset above the keyboard |
| `extraScrollHeight` | `number` | `0` | Extra scroll height |
| `enableResetScrollToCoords` | `boolean` | `true` | Reset scroll position when keyboard hides |
| `resetScrollToCoords` | `{x, y}` | `undefined` | Custom reset coordinates |
| `keyboardOpeningTime` | `number` | `250` | Delay before scrolling (ms) |
| `viewIsInsideTabBar` | `boolean` | `false` | Adjust for TabBar height |
| `enableOnAndroid` | `boolean` | `true` | Enable keyboard handling on Android |
| `onKeyboardWillShow` | `(frame) => void` | - | Keyboard will show callback |
| `onKeyboardWillHide` | `(frame) => void` | - | Keyboard will hide callback |
| `onKeyboardDidShow` | `(frame) => void` | - | Keyboard did show callback |
| `onKeyboardDidHide` | `(frame) => void` | - | Keyboard did hide callback |

### Ref Methods

| Method | Description |
|--------|-------------|
| `scrollToPosition(x, y, animated?)` | Scroll to specific position |
| `scrollToEnd(animated?)` | Scroll to end of content |
| `scrollToFocusedInput(ref, options?)` | Scroll to a specific TextInput |
| `scrollIntoView(ref, options?)` | Scroll to make an element visible |
| `getScrollResponder()` | Get the underlying ScrollView responder |
| `update()` | Re-trigger scroll to current focused input |

### Hooks

#### `useKeyboardAwareScroll(options?)`

Low-level hook for custom implementations. Returns all scroll handlers and keyboard state.

#### `useKeyboard(options?)`

Standalone hook for keyboard state. Returns `{ isVisible, height, frame }`.

## Migration from `react-native-keyboard-aware-scroll-view`

| Old | New | Notes |
|-----|-----|-------|
| `innerRef` | `ref` | Use standard `ref` prop |
| `listenToKeyboardEvents` HOC | `useKeyboardAwareScroll` hook | Hooks instead of HOC |
| `enableOnAndroid` default `false` | default `true` | Now enabled by default |
| All other props | Same | Backward compatible |

## Testing

The library includes a comprehensive test suite built with Jest and React Native Testing Library.

### Run tests

```bash
yarn test --coverage
```

### Current coverage

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Overall** | **89.5%** | **75.9%** | **87%** | **90.3%** |
| `platform.ts` | 100% | 100% | 100% | 100% |
| `useKeyboard` | 100% | 100% | 100% | 100% |
| `useKeyboardAwareScroll` | 94.2% | 84.8% | 100% | 97.1% |
| `measureElement` | 100% | 100% | 100% | 100% |
| `KeyboardAwareScrollView` | 76.9% | 78.6% | 66.7% | 76.9% |
| `KeyboardAwareFlatList` | 75% | 42.9% | 66.7% | 75% |
| `KeyboardAwareSectionList` | 75% | 42.9% | 66.7% | 75% |

### Test structure

```
__tests__/
├── helpers/
│   ├── mockRN.ts          # React Native mock helpers (jest.spyOn based)
│   └── mockScroll.ts      # ScrollView responder mocks
├── hooks/
│   ├── useKeyboard.test.ts                  # 18 tests
│   └── useKeyboardAwareScroll.test.ts       # 37 tests
├── components/
│   ├── KeyboardAwareScrollView.test.tsx      # 7 tests
│   ├── KeyboardAwareFlatList.test.tsx        # 4 tests
│   └── KeyboardAwareSectionList.test.tsx     # 4 tests
├── utils/
│   ├── platform.test.ts                      # 9 tests
│   └── measureElement.test.ts                # 4 tests
└── index.test.ts                             # 5 tests
```

### Key test scenarios covered

- **Platform detection**: iOS/Android/unknown platform handling
- **Keyboard events**: `keyboardWillShow/Hide` (iOS), `keyboardDidShow/Hide` (Android)
- **Automatic scroll**: scroll to focused input when keyboard appears
- **Scroll reset**: reset position when keyboard hides with `enableResetScrollToCoords`
- **Ref forwarding**: `forwardRef` + `useImperativeHandle` API
- **Android-specific**: `enableOnAndroid`, extra padding, `scrollForExtraHeightOnAndroid`
- **Edge cases**: null refs, unmounted components, missing scroll responders
- **Component props**: `contentInset`, `keyboardDismissMode`, `onScroll` merge

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT
