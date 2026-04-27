import React from 'react'
import { StyleSheet, Text, TextInput, View, SafeAreaView } from 'react-native'
import { KeyboardAwareFlatList } from 'react-native-smart-keyboard-view'

interface ListItem {
  id: string
  title: string
}

const DATA: ListItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}))

export function FlatListExample() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KeyboardAwareFlatList</Text>
        <Text style={styles.subtitle}>
          Each row has an input — tap to scroll it into view
        </Text>
      </View>

      <KeyboardAwareFlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        extraHeight={100}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Input for ${item.title}`}
              placeholderTextColor="#999"
            />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
})
