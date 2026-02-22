import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mom-profile" />
      <Stack.Screen name="baby-profile" />
      <Stack.Screen name="baby-details" />
      <Stack.Screen name="baby-intake" />
    </Stack>
  );
}