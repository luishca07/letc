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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EstoqueScreen() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]);
  
  // Estado para guardar a quantidade digitada em cada item (chave: id do item)
  const [quantidadesSolicitadas, setQuantidadesSolicitadas] = useState({});

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

  // Função para executar a solicitação (retirada) do item
  const handleSolicitar = async (itemId) => {
    const qtdStr = quantidadesSolicitadas[itemId] || '1';
    const qntd = parseInt(qtdStr, 10);

    if (isNaN(qntd) || qntd <= 0) {
      if (Platform.OS === 'web') {
        alert('Insira uma quantidade válida maior que zero.');
      } else {
        Alert.alert('Erro', 'Insira uma quantidade válida maior que zero.');
      }
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/api/estoque/solicitar/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qntd }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        if (Platform.OS === 'web') {
          alert(resultado.mensagem);
        } else {
          Alert.alert('Sucesso', resultado.mensagem);
        }
        setItens(itens.map(item => item.id === itemId ? { ...item, qntd: item.qntd - qntd } : item));
      } else {
        if (Platform.OS === 'web') {
          alert(resultado.erro || 'Erro ao solicitar item');
        } else {
          Alert.alert('Erro', resultado.erro || 'Erro ao solicitar item');
        }
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
      if (Platform.OS === 'web') {
        alert('Não foi possível conectar ao servidor.');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
    }
  };

  // Função para executar a devolução do item
  const handleDevolver = async (itemId) => {
    const qtdStr = quantidadesSolicitadas[itemId] || '1';
    const qntd = parseInt(qtdStr, 10);

    if (isNaN(qntd) || qntd <= 0) {
      if (Platform.OS === 'web') {
        alert('Insira uma quantidade válida maior que zero.');
      } else {
        Alert.alert('Erro', 'Insira uma quantidade válida maior que zero.');
      }
      return;
    }

    try {
      const resposta = await fetch(`${API_URL}/api/estoque/devolver/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qntd }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        if (Platform.OS === 'web') {
          alert(resultado.mensagem);
        } else {
          Alert.alert('Sucesso', resultado.mensagem);
        }
        setItens(itens.map(item => item.id === itemId ? { ...item, qntd: item.qntd + qntd } : item));
      } else {
        if (Platform.OS === 'web') {
          alert(resultado.erro || 'Erro ao devolver item');
        } else {
          Alert.alert('Erro', resultado.erro || 'Erro ao devolver item');
        }
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
      if (Platform.OS === 'web') {
        alert('Não foi possível conectar ao servidor.');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
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

        {/* Lista de Itens do Stock com Solicitar e Devolver */}
        <View style={{ marginTop: 15 }}>
          {itensFiltrados.map((item) => (
            <View 
              key={item.id} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 12, 
                borderWidth: 1, 
                borderColor: '#ddd' 
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={{ uri: `${API_URL}/static/imagens_produtos/${item.imagem}` }}
                  style={{ width: 55, height: 55, borderRadius: 6, marginRight: 15, backgroundColor: '#eee' }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{item.nome}</Text>
                  <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>Tipo: {item.tipo}</Text>
                  <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>Disponível: {item.qntd}</Text>
                </View>
              </View>

              {/* Área dos Botões e Input de Quantidade */}
              <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                <TextInput
                  style={{ 
                    borderWidth: 1, 
                    borderColor: '#ccc', 
                    borderRadius: 5, 
                    paddingHorizontal: 8, 
                    height: 38, 
                    width: '28%', 
                    backgroundColor: '#fafafa',
                    fontSize: 14
                  }}
                  placeholder="Qtd"
                  keyboardType="numeric"
                  value={quantidadesSolicitadas[item.id] || ''}
                  onChangeText={(text) => setQuantidadesSolicitadas({ ...quantidadesSolicitadas, [item.id]: text })}
                />

                <TouchableOpacity 
                  style={{ 
                    backgroundColor: '#FF8C00', 
                    paddingVertical: 9, 
                    paddingHorizontal: 10, 
                    borderRadius: 6, 
                    flex: 1, 
                    marginLeft: 6,
                    alignItems: 'center'
                  }}
                  onPress={() => handleSolicitar(item.id)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Solicitar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ 
                    backgroundColor: '#28a745', 
                    paddingVertical: 9, 
                    paddingHorizontal: 10, 
                    borderRadius: 6, 
                    flex: 1, 
                    marginLeft: 6,
                    alignItems: 'center'
                  }}
                  onPress={() => handleDevolver(item.id)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>Devolver</Text>
                </TouchableOpacity>
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