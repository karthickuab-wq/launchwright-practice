import { Text, type TextProps } from 'react-native';

import { colors, type, type TextStyleName } from '../theme';

type Props = TextProps & {
  // Which text style from the design guide: title, heading, body, small or tag.
  variant?: Exclude<TextStyleName, 'button'>;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...rest }: Props) {
  const t = type[variant];
  return (
    <Text
      accessibilityRole={variant === 'title' || variant === 'heading' ? 'header' : undefined}
      style={[{ color: muted ? colors.muted : colors.ink, fontSize: t.size, fontWeight: t.weight }, style]}
      {...rest}
    />
  );
}
