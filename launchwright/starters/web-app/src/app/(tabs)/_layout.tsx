import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';

import { tabBarPositionFor } from '../../layout';
import { colors, tapTarget, type } from '../../theme';

// The tabs sit down the left side in a wide window and along the bottom in a narrow one (src/layout.ts).
// Add a screen by adding a file next to this one and a Tabs.Screen line.
export default function TabsLayout() {
  const position = tabBarPositionFor(useWindowDimensions().width);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: position,
        // Down the left side the roomier "material" look is used: the plain one's tabs are 42 tall, under the 44 minimum.
        tabBarVariant: position === 'left' ? 'material' : 'uikit',
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderColor: colors.line, minHeight: tapTarget + 12 },
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
