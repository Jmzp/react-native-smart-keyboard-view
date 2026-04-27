import React, { useRef } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native'
import { KeyboardAwareScrollView, KeyboardAwareScrollRef } from 'react-native-smart-keyboard-view'

export function ScrollViewExample() {
  const scrollRef = useRef<KeyboardAwareScrollRef>(null)

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        extraHeight={100}
      >
        <Text style={styles.title}>KeyboardAwareScrollView</Text>
        <Text style={styles.subtitle}>
          Tap any input to see it auto-scroll into view
        </Text>

        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.inputGroup}>
            <Text style={styles.label}>Field {i + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Type something in field ${i + 1}`}
              placeholderTextColor="#999"
            />
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => scrollRef.current?.scrollToPosition(0, 0, true)}
          >
            <Text style={styles.buttonText}>Scroll to Top</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => scrollRef.current?.scrollToEnd(true)}
          >
            <Text style={styles.buttonText}>Scroll to End</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => {
            scrollRef.current?.update()
            Alert.alert('Update', 'Re-scrolled to focused input')
          }}
        >
          <Text style={styles.buttonText}>Update (re-scroll)</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButton: {
    marginTop: 12,
    backgroundColor: '#764ba2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
})
