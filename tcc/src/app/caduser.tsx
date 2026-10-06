import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CadUserScreen() {
  const [novoUsuario, setNovoUsuario] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const router = useRouter();
  const API_URL = 'http://10.154.20.63:5000';

  const handleCadastrarUsuario = async () => {
    if (!novoUsuario.trim() || !novaSenha.trim()) {
      Alert.alert('Aviso', 'Preencha o nome de usuário e a senha.');
      return;
    }

    setCarregando(true);

    try {
      // Envia os dados no formato form-data conforme configurado na API Flask
      const formData = new FormData();
      formData.append('usuario', novoUsuario);
      formData.append('senha', novaSenha);

      const response = await fetch(`${API_URL}/caduser`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Novo usuário cadastrado com sucesso!');
        setNovoUsuario('');
        setNovaSenha('');
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o usuário.');
      }
    } catch {
      Alert.alert('Erro de Conexão', 'Falha ao comunicar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  const handleVoltar = () => {
    if (Platform.OS === 'web') {
      window.location.href = '/estoque';
    } else {
      router.replace('/estoque');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleVoltar}>
            <Text style={styles.voltarText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Novo Usuário</Text>
        </View>

        {/* Formulário */}
        <View style={styles.card}>
          <Text style={styles.label}>Usuário</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome de usuário"
            placeholderTextColor="#888"
            value={novoUsuario}
            onChangeText={setNovoUsuario}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={novaSenha}
            onChangeText={setNovaSenha}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleCadastrarUsuario}
            disabled={carregando}
            activeOpacity={0.8}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>CADASTRAR USUÁRIO</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F8',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#0A1B43',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  voltarText: {
    color: '#FF8C00',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A1B43',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF8C00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});