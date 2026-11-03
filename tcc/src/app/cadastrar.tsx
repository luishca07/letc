import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function CadastrarScreen() {
// Criar os estados que armazenam o que o usuário digita nos inputs
  const [nome, setNome] = useState('');
  const [qntd, setQntd] = useState('');
  const [tipo, setTipo] = useState('');
// Controlar a navegação entre as telas do aplicativo 
  const router = useRouter();

  const API_URL = 'http://10.154.20.134:5000';
// Validar os campos e enviar os dados preenchidos para a API cadastrar o item
  const handleCadastrar = async () => {
    if (!nome || !qntd || !tipo) {
      Alert.alert('Aviso', 'Preencha todos os campos obrigatórios.');
      return;
    }
// Criar um pacote de dados FormData para enviar ao backend
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('qntd', qntd);
    formData.append('tipo', tipo);

    try {
// Fazer a requisição HTTP POST para a API salvando o item no banco
      const response = await fetch(`${API_URL}/api/cadastrar`, {
        method: 'POST',
        body: formData,
      });
// Verificar se o cadastro deu certo ou se falhou
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Item cadastrado com sucesso!');
        router.back();
      } else {
        Alert.alert('Erro', 'Falha ao cadastrar item.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao conectar com a API.');
    }
  };

  return (
// Criar um container com rolagem para a tela de formulário
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro de Novos Itens</Text>

      <View style={styles.formGroup}>
        <TextInput style={styles.input} placeholder="Nome do item" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Quantidade do item" keyboardType="numeric" value={qntd} onChangeText={setQntd} />
        <TextInput style={styles.input} placeholder="Tipo do item" value={tipo} onChangeText={setTipo} />

        <TouchableOpacity style={styles.button} onPress={handleCadastrar}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
// Definir a estilo
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1B43', padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 30 },
  formGroup: { gap: 15 },
  input: { backgroundColor: '#FFF', padding: 14, borderRadius: 8, fontSize: 16 },
  button: { backgroundColor: '#FF8C00', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backButton: { alignItems: 'center', marginTop: 10 },
  backText: { color: '#AAA' },
});