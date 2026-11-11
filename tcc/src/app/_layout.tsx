import { Stack } from 'expo-router';
//Stack da biblioteca Expo Router


export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      //telas do app
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="estoque" />
      <Stack.Screen name="cadastrar" />
      <Stack.Screen name="historico" />
      <Stack.Screen name="caduser" />
      <Stack.Screen name="ia" />
    </Stack>
  );
}