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

## License

MIT
