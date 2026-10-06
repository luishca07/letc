import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

interface ItemHistorico {
  nome_produto?: string;
  quantidade?: number;
  tipo_movimentacao?: string;
  data_hora?: string;
}

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const router = useRouter();
  const API_URL = 'http://10.154.20.63:5000';

  const carregarHistorico = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/api/historico`);
      const data = await response.json();
      setHistorico(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const handleVoltar = () => {
    if (Platform.OS === 'web') {
      window.location.href = '/estoque';
    } else {
      router.replace('/estoque');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar}>
          <Text style={styles.voltarText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Movimentações</Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#FF8C00" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma movimentação registrada.</Text>
          }
          renderItem={({ item }) => {
            const isRetirada = item.tipo_movimentacao === 'RETIRADA';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.produtoNome}>
                    {item.nome_produto || 'Produto Indefinido'}
                  </Text>
                  <Text
                    style={[
                      styles.tagBadge,
                      { backgroundColor: isRetirada ? '#DC2626' : '#16A34A' },
                    ]}
                  >
                    {item.tipo_movimentacao || 'MOVIMENTAÇÃO'}
                  </Text>
                </View>

                <View style={styles.cardDetails}>
                  <Text style={styles.detailText}>
                    Quantidade: <Text style={styles.boldText}>{item.quantidade}</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Data: {item.data_hora ? item.data_hora.toString() : 'N/D'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3F8',
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A1B43',
  },
  tagBadge: {
    color: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    color: '#555',
    fontSize: 13,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0A1B43',
  },
});