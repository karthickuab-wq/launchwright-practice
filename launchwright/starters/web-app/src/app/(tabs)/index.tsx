import { router } from 'expo-router';

import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { appName } from '../../config';

// The starter's home screen. The build replaces it with the app's main screen from the mockup.
export default function Home() {
  return (
    <Screen>
      <AppText variant="title">{appName}</AppText>
      <AppText muted>Your app starts here.</AppText>
      <Card>
        <AppText variant="heading">Starter screen</AppText>
        <AppText muted>This screen is replaced with your app's main screen.</AppText>
      </Card>
      <Button label="Open More" onPress={() => router.navigate('/more')} />
    </Screen>
  );
}
