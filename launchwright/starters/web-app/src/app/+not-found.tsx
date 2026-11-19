import { router } from 'expo-router';

import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';

export default function NotFound() {
  return (
    <Screen>
      <AppText variant="title">This page isn't here</AppText>
      <AppText muted>The link may be old. Go back to the start and try again.</AppText>
      <Button label="Go to Home" onPress={() => router.replace('/')} />
    </Screen>
  );
}
