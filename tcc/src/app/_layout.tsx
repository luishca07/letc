import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Desativa barras e cabeçalhos automáticos do Expo
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="estoque" />
      <Stack.Screen name="cadastrar" />
      <Stack.Screen name="historico" />
      <Stack.Screen name="caduser" />
    </Stack>
  );
}