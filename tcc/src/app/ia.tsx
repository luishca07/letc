import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function IAScreen() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  // Endereço do backend atualizado com a porta 5001 e o teu IP local
  const API_URL = 'http://10.154.20.134:5001';

  const enviarMensagem = async () => {
    if (!input) {
      Alert.alert('Aviso', 'Escreve uma mensagem para a IA.');
      return;
    }

    setCarregando(true);
    setResposta('');

    try {
      const urlAlvo = `${API_URL}/api/chat`;
      console.log('A tentar ligar a: ', urlAlvo);

      const res = await fetch(urlAlvo, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      // Lê como texto primeiro para validar se o servidor mandou JSON ou HTML de erro
      const textoResposta = await res.text();

      try {
        const data = JSON.parse(textoResposta);
        if (res.ok) {
          setResposta(data.response || '');
        } else {
          Alert.alert('Erro', data.error || 'Falha ao consultar a IA.');
        }
      } catch (e) {
        // Se cair aqui, o servidor respondeu com HTML (ex: erro de rede/porta)
        console.error('Resposta não-JSON recebida:', textoResposta);
        Alert.alert('Erro de Conexão', 'O servidor não retornou um JSON válido. Verifique se o backend está ativo.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Erro ao conectar com o servidor da IA.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assistente VampetinhIA</Text>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          placeholder="Escreve a tua pergunta..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.button} onPress={enviarMensagem}>
          <Text style={styles.buttonText}>Perguntar</Text>
        </TouchableOpacity>

        {carregando && (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FF8C00" />
        )}

        {resposta ? (
          <View style={styles.respostaBox}>
            <Text style={styles.respostaTitulo}>Resposta:</Text>
            <Text style={styles.respostaTexto}>{resposta}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A1B43', 
    padding: 20, 
    paddingTop: 60 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFF', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  formGroup: { 
    gap: 15 
  },
  input: { 
    backgroundColor: '#FFF', 
    padding: 14, 
    borderRadius: 8, 
    fontSize: 16 
  },
  button: { 
    backgroundColor: '#FF8C00', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  respostaBox: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#FFF', 
    borderRadius: 8 
  },
  respostaTitulo: { 
    fontWeight: 'bold', 
    color: '#0A1B43', 
    marginBottom: 5, 
    fontSize: 16 
  },
  respostaTexto: { 
    fontSize: 15, 
    color: '#333' 
  },
  backButton: { 
    alignItems: 'center', 
    marginTop: 20, 
    marginBottom: 40 
  },
  backText: { 
    color: '#AAA', 
    fontSize: 16 
  },
});