import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EstoqueScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]);

  // Endereço do servidor Flask
  const API_URL = 'http://10.154.20.134:5000';

  useEffect(() => {
    async function verificarPermissaoAdmin() {
      try {
        if (Platform.OS === 'web') {
          const valorWeb = localStorage.getItem('eh_admin');
          setIsAdmin(valorWeb === 'true' || valorWeb === '1');
        } else {
          const valorMobile = await AsyncStorage.getItem('eh_admin');
          setIsAdmin(valorMobile === 'true' || valorMobile === '1');
        }
      } catch (error) {
        console.log('Erro ao verificar permissão:', error);
      }
    }

    async function buscarEstoque() {
      try {
        const resposta = await fetch(`${API_URL}/api/estoque`);
        const dados = await resposta.json();
        if (resposta.ok) {
          setItens(dados);
        }
      } catch (error) {
        console.log('Erro ao buscar stock:', error);
      }
    }

    verificarPermissaoAdmin();
    buscarEstoque();
  }, []);

  const handleSair = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('eh_admin');
      window.location.href = '/';
    } else {
      await AsyncStorage.removeItem('eh_admin');
      router.replace('/');
    }
  };

  const itensFiltrados = itens.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Almoxarifado SENAI</Text>
        <TouchableOpacity onPress={handleSair} style={styles.sairBtn}>
          <Text style={styles.sairText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* BOTÕES LARANJAS: Renderizados apenas se o utilizador for Administrador */}
        {isAdmin && (
          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={styles.botaoLaranja}
              onPress={() => router.push('/cadastrar')}
            >
              <Text style={styles.botaoLaranjaText}>+ Cadastrar Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoLaranja}
              onPress={() => router.push('/caduser')}
            >
              <Text style={styles.botaoLaranjaText}>+ Novo Usuário</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoBranco}
              onPress={() => router.push('/historico')}
            >
              <Text style={styles.botaoBrancoText}>Histórico</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar item..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Lista de Itens do Stock */}
        <View style={{ marginTop: 15 }}>
          {itensFiltrados.map((item) => (
            <View 
              key={item.id} 
              style={{ 
                flexDirection: 'row', 
                backgroundColor: '#FFFFFF', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 10, 
                alignItems: 'center', 
                borderWidth: 1, 
                borderColor: '#ddd' 
              }}
            >
              <Image
                source={{ uri: `${API_URL}/static/imagens_produtos/${item.imagem}` }}
                style={{ width: 55, height: 55, borderRadius: 6, marginRight: 15, backgroundColor: '#eee' }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{item.nome}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>Tipo: {item.tipo}</Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>Quantidade: {item.qntd}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  header: {
    backgroundColor: '#0A1B43',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  sairBtn: { padding: 5 },
  sairText: { color: '#FF8C00', fontWeight: 'bold', fontSize: 16 },
  content: { padding: 15 },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  botaoLaranja: {
    flex: 1,
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 10,
    minWidth: '30%',
  },
  botaoLaranjaText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  botaoBranco: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: '30%',
  },
  botaoBrancoText: { color: '#333333', fontWeight: 'bold', fontSize: 14 },
  searchContainer: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10 },
  searchInput: { height: 45, fontSize: 16, color: '#333' },
});