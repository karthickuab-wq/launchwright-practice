import { Pressable, Text } from 'react-native';

import { colors, radius, space, tapTarget, type } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  // The one main button on a screen is "primary"; any other is "secondary".
  kind?: 'primary' | 'secondary';
};

export function Button({ label, onPress, kind = 'primary' }: Props) {
  const primary = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: Math.max(tapTarget, 52),
        borderRadius: radius,
        paddingHorizontal: space(5),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? colors.accent : colors.accentSoft,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: primary ? colors.accentInk : colors.accent,
          fontSize: type.button.size,
          fontWeight: type.button.weight,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
