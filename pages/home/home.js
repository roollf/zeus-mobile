import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { AddForm } from '../../components/addForm';
import { EditForm } from '../../components/editForm';

export default function HomePage() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filtroMes, setFiltroMes] = useState(null);
  const [modalMesVisivel, setModalMesVisivel] = useState(false);
  const [modalFormVisivel, setModalFormVisivel] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const scrollViewRef = useRef(null);

  // ip casa: 192.168.1.42
  // ip vortex: 10.50.184.66

  const fetchData = () => {
    axios
      .get('http://10.50.184.66:3001/racao')
      .then((response) => {
        const sortedData = response.data.sort((a, b) => {
          return new Date(b.data) - new Date(a.data);
        });
        setData(sortedData);
      })
      .catch((error) => console.error('Erro ao buscar dados:', error));
  };

  useEffect(() => {
    fetchData();
    scrollToTop();
  }, []);

  const filtrarPorMes = (mes) => {
    if (mes === 'Exibir todos') {
      setFiltroMes(null);
    } else {
      setFiltroMes(mes);
    }
  };

  const mesesDisponiveis = [
    'Exibir todos',
    ...new Set(
      data.map((item) => {
        const date = new Date(item.data);
        const month = date.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
        return month.charAt(0).toUpperCase() + month.slice(1);
      }),
    ),
  ];

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setModalEditVisible(true);
  };

  const formatarValor = (value) => {
    const valor = parseFloat(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
    return formatted;
  };

  const formatarQuantidade = (value) => {
    const quantidade = parseFloat(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'unit',
      unit: 'kilogram',
    }).format(quantidade);
    return formatted;
  };

  const formatarData = (value) => {
    const dateString = value;
    const [year, month, day] = dateString.split('-');
    const data = new Date(year, month - 1, day);
    const formatted = data.toLocaleDateString('pt-BR');
    return formatted;
  };

  const calcularTotal = () => {
    const dadosFiltrados = data.filter((item) => {
      if (!filtroMes) return true;
      const date = new Date(item.data);
      const mesAno = date.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
      return mesAno.charAt(0).toUpperCase() + mesAno.slice(1) === filtroMes;
    });

    const total = dadosFiltrados.reduce(
      (accumulator, currentValue) => accumulator + parseFloat(currentValue.valor),
      0,
    );

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(total);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <View style={styles.containerView}>
      <View style={styles.headerView} />
      <View style={styles.containerValor}>
        <Text style={styles.valorContent}>{calcularTotal()}</Text>
        <Text style={styles.valorContentDescription}>valor total gasto</Text>
      </View>
      <View style={styles.buttonView}>
        <TouchableOpacity onPress={() => setModalMesVisivel(true)} style={styles.buttonMes}>
          <Ionicons name='calendar-outline' size={40} color='#3D405B' />
        </TouchableOpacity>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalMesVisivel}
        onRequestClose={() => setModalMesVisivel(false)}
      >
        <View style={styles.modalMesContainer}>
          <View style={styles.modalMesContent}>
            <View style={styles.modalMesWithin}>
              <View
                style={{
                  display: 'flex',
                  width: '100%',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  marginBottom: 10,
                }}
              >
                <Text style={styles.modalMesTitle}>Selecionar Mês</Text>
              </View>
              <ScrollView style={{ width: '100%' }}>
                {mesesDisponiveis.map((mes, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      filtrarPorMes(mes);
                      setModalMesVisivel(false);
                    }}
                  >
                    <Text style={styles.modalMesText}>{mes}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View
                style={{
                  display: 'flex',
                  width: '100%',
                  borderTopWidth: StyleSheet.hairlineWidth,
                  marginTop: 10,
                }}
              ></View>
              <TouchableOpacity onPress={() => setModalMesVisivel(false)}>
                <Text style={styles.modalMesCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.buttonView}>
        <TouchableOpacity style={styles.buttonCompra} onPress={() => setModalFormVisivel(true)}>
          <Ionicons name='bag-add-outline' size={40} color='#3D405B' />
        </TouchableOpacity>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalFormVisivel}
        onRequestClose={() => setModalFormVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.formModal}>
            <View style={styles.modalContent}>
              <AddForm setModalFormVisivel={() => setModalFormVisivel(false)} setData={setData} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={styles.scrollViewExpenses}>
        <View style={styles.shadowTop} />
        <ScrollView ref={scrollViewRef} onContentSizeChange={scrollToTop}>
          <View style={styles.withinScrollView}>
            {data
              .filter((item) => {
                if (!filtroMes) return true;
                const date = new Date(item.data);
                const mesAno = date.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
                return mesAno.charAt(0).toUpperCase() + mesAno.slice(1) === filtroMes;
              })
              .map((item, index) => (
                <TouchableOpacity
                  style={styles.expenseCard}
                  key={index}
                  onPress={() => handleSelectItem(item)}
                >
                  <View style={styles.expenseCardContentIcon}>
                    <Ionicons name='bag-check-outline' size={50} color='#3D405B' />
                  </View>
                  <View style={styles.expenseCardContentMain}>
                    <Text style={styles.mainText}>{item.marca}</Text>
                    <Text style={styles.secondaryText}>{`${formatarQuantidade(
                      item.quantidade,
                    )} | ${formatarData(item.data)}`}</Text>
                  </View>
                  <View style={styles.expenseCardContentSecondary}>
                    <Text style={styles.secondaryText}>BRL</Text>
                    <Text style={styles.vlaueText}>{formatarValor(item.valor)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            <Modal
              animationType='slide'
              transparent={true}
              visible={modalEditVisible}
              onRequestClose={() => setModalEditVisible(false)}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.formModal}>
                  <View style={styles.modalContent}>
                    <EditForm
                      setModalEditVisible={() => setModalEditVisible(false)}
                      setData={setData}
                      selectedItem={selectedItem}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </ScrollView>
        <View style={styles.shadowBottom} />
      </View>
      <View style={styles.bottomView} />
    </View>
  );
}

const styles = StyleSheet.create({
  containerView: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#9FB3C8',
  },
  headerView: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#334E68',
  },
  containerValor: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valorContent: {
    fontSize: 40,
    fontWeight: '600',
    color: '#3D405B',
  },
  valorContentDescription: {
    fontSize: 15,
    fontWeight: '200',
    color: '#3D405B',
  },
  buttonView: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonMes: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    height: '80%',
    backgroundColor: '#DDBEA9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonCompra: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '30%',
    height: '80%',
    backgroundColor: '#DDBEA9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  modalMesTitle: {
    fontSize: 30,
    fontWeight: '600',
  },
  modalMesText: {
    fontSize: 20,
    fontWeight: '300',
    marginBottom: 1,
  },
  modalMesCloseText: {
    fontSize: 25,
    fontWeight: '600',
  },
  scrollViewExpenses: {
    display: 'flex',
    flex: 5,
    backgroundColor: '#7A9EAD',
  },
  withinScrollView: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 20,
  },
  expenseCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    width: '90%',
    gap: 20,
    backgroundColor: '#DDBEA9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  expenseCardContentIcon: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCardContentMain: {
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  expenseCardContentSecondary: {
    display: 'flex',
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mainText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3D405B',
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: '200',
    color: '#3D405B',
  },
  vlaueText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3D405B',
  },
  bottomView: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#334E68',
  },
  shadowTop: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  shadowBottom: {
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  formModal: {
    display: 'flex',
    alignSelf: 'center',
    height: '60%',
    width: '80%',
    marginTop: '40%',
  },
  modalContent: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalMesContainer: {
    dislpay: 'flex',
    alignSelf: 'center',
    height: '30%',
    width: '70%',
    marginTop: '70%',
  },
  modalMesContent: {
    display: 'flex',
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalMesWithin: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
});
