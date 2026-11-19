import { View, type ViewProps } from 'react-native';

import { colors, radius, space } from '../theme';

// A card is set apart by its tint, not by a line.
export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[{ backgroundColor: colors.surface, borderRadius: radius, padding: space(4), gap: space(2) }, style]}
      {...rest}
    />
  );
}
