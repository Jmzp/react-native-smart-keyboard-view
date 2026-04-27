import React from 'react'
import { StyleSheet, Text, TextInput, View, SafeAreaView } from 'react-native'
import { KeyboardAwareSectionList } from 'react-native-smart-keyboard-view'

interface Contact {
  id: string
  name: string
}

interface ContactSection {
  title: string
  data: Contact[]
}

const SECTIONS: ContactSection[] = [
  {
    title: 'Team A',
    data: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ],
  },
  {
    title: 'Team B',
    data: [
      { id: '4', name: 'Diana' },
      { id: '5', name: 'Eve' },
      { id: '6', name: 'Frank' },
    ],
  },
  {
    title: 'Team C',
    data: [
      { id: '7', name: 'Grace' },
      { id: '8', name: 'Hank' },
      { id: '9', name: 'Ivy' },
      { id: '10', name: 'Jack' },
      { id: '11', name: 'Kate' },
      { id: '12', name: 'Leo' },
    ],
  },
]

export function SectionListExample() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KeyboardAwareSectionList</Text>
        <Text style={styles.subtitle}>
          Grouped contacts with editable notes
        </Text>
      </View>

      <KeyboardAwareSectionList
        sections={SECTIONS}
        keyExtractor={(item) => item.id}
        extraHeight={100}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.contactName}>{item.name}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Add a note for ${item.name}...`}
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
  sectionHeader: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
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
