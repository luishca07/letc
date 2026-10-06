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
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [isAdmMode, setIsAdmMode] = useState(false);

  const router = useRouter();
  
  // Substitua pelo endereço IP real do seu computador (obtido via ipconfig)
  const API_URL = 'http://10.154.20.63:5000';

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert('Aviso', 'Por favor, preencha o usuário e a senha.');
      return;
    }

    setCarregando(true);

    try {
      const endpoint = isAdmMode ? `${API_URL}/api/adm` : `${API_URL}/api/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        const ehAdminValor = isAdmMode || data.eh_admin;

        // Guarda o estado de administrador consoante a plataforma
        if (Platform.OS === 'web') {
          localStorage.setItem('eh_admin', JSON.stringify(ehAdminValor));
          window.location.href = '/estoque';
        } else {
          await AsyncStorage.setItem('eh_admin', JSON.stringify(ehAdminValor));
          router.replace('/estoque');
        }
      } else {
        Alert.alert('Erro no Login', data.erro || 'Usuário ou senha inválidos.');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique o IP e a rede.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {isAdmMode ? (
            <Text style={styles.admTitle}>Entrar como ADM</Text>
          ) : (
            <>
              <Text style={styles.logoText}>SENAI</Text>
              <Text style={styles.subTitle}>Almoxarifado</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            placeholderTextColor="#888"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={carregando}
            activeOpacity={0.8}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isAdmMode ? 'ACESSAR PAINEL' : 'ENTRAR'}
              </Text>
            )}
          </TouchableOpacity>

          {isAdmMode ? (
            <TouchableOpacity
              style={styles.voltarBtn}
              onPress={() => {
                setIsAdmMode(false);
                setUsuario('');
                setSenha('');
              }}
            >
              <Text style={styles.voltarText}>Voltar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.admBtn}
              onPress={() => {
                setIsAdmMode(true);
                setUsuario('');
                setSenha('');
              }}
            >
              <Text style={styles.admText}>Login ADM</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1B43' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoText: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4 },
  subTitle: { fontSize: 18, color: '#FF8C00', fontWeight: 'bold', marginTop: -5 },
  admTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', fontStyle: 'italic' },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  input: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, fontSize: 16, color: '#333333', marginBottom: 16 },
  button: { backgroundColor: '#FF8C00', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  admBtn: { marginTop: 18, alignItems: 'center' },
  admText: { color: '#CCCCCC', fontSize: 13, textDecorationLine: 'underline' },
  voltarBtn: { backgroundColor: '#FF8C00', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, marginTop: 20, alignSelf: 'flex-start' },
  voltarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});