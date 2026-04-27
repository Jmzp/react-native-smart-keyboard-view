import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, Text } from 'react-native'
import { ScrollViewExample } from './src/screens/ScrollViewExample'
import { FlatListExample } from './src/screens/FlatListExample'
import { SectionListExample } from './src/screens/SectionListExample'
import { KeyboardHookExample } from './src/screens/KeyboardHookExample'

const Tab = createBottomTabNavigator()

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  )
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#667eea',
        }}
      >
        <Tab.Screen
          name="ScrollView"
          component={ScrollViewExample}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Scroll" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="FlatList"
          component={FlatListExample}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Flat" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="SectionList"
          component={SectionListExample}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Section" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Hook"
          component={KeyboardHookExample}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon label="Hook" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#667eea',
  },
})

export default App
