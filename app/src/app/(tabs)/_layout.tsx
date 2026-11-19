import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, tapTarget, type } from '../../theme';

// The tab bar. Add a screen by adding a file next to this one and a Tabs.Screen line below.
// Icons are line icons from Ionicons, coloured by the theme.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.line, minHeight: tapTarget + 12 },
        tabBarLabelStyle: { fontSize: type.tag.size, fontWeight: type.tag.weight },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={String(color)} />,
        }}
      />
    </Tabs>
  );
}
