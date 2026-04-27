import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import { useKeyboard } from 'react-native-smart-keyboard-view'

export function KeyboardHookExample() {
  const { isVisible, height } = useKeyboard()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>useKeyboard Hook</Text>
        <Text style={styles.subtitle}>
          Real-time keyboard state tracking
        </Text>

        <View style={styles.statusCard}>
          <View style={[styles.indicator, isVisible && styles.indicatorActive]} />
          <Text style={styles.statusText}>
            Keyboard is {isVisible ? 'VISIBLE' : 'HIDDEN'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Keyboard Height</Text>
          <Text style={styles.metricValue}>{height}px</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This screen uses the standalone useKeyboard hook to track the
            keyboard state. Open/close the keyboard by tapping an input in
            another tab.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
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
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  indicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ccc',
    marginRight: 14,
  },
  indicatorActive: {
    backgroundColor: '#4caf50',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  metricCard: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  infoText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
  },
})
