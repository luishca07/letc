import { Stack } from 'expo-router';
// Definir a estrutura principal de navegação em pilha Stack do aplicativo mobile
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Desativa barras e cabeçalhos automáticos do Expo
      }}
    >     
      <Stack.Screen name="index" /> {/* Registrar a tela inicial index no sistema de rotas */}
      <Stack.Screen name="estoque" /> {/* Registrar a tela de gerenciamento/consulta do estoque */}
      <Stack.Screen name="cadastrar" /> {/* Registrar a tela de cadastro de novos itens */}
      <Stack.Screen name="historico" /> {/* Registrar a tela de histórico de movimentações */}
      <Stack.Screen name="caduser" /> {/* Registrar a tela de cadastro de novos usuários */}
      <Stack.Screen name="ia" /> {/* Registrar a tela da inteligência artificial */}
    </Stack>
  );
}