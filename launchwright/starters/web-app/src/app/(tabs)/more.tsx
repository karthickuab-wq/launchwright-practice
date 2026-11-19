import { useState } from 'react';

import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';

// The starter's second screen: it shows that a tap changes what's on screen.
export default function More() {
  const [tapped, setTapped] = useState(false);
  return (
    <Screen>
      <AppText variant="title">More</AppText>
      <Card>
        <AppText variant="heading">Try a tap</AppText>
        <AppText muted>{tapped ? 'Tap received.' : 'Nothing tapped yet.'}</AppText>
      </Card>
      <Button label="Tap here" kind="secondary" onPress={() => setTapped(true)} />
    </Screen>
  );
}
