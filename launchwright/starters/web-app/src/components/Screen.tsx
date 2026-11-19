import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '../theme';

// Every screen sits in this: the background colour and the guide's side space. On a wide window the
// content stays a readable column in the middle instead of stretching across the screen.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: space(5), gap: space(4), width: '100%', maxWidth: 720, alignSelf: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
