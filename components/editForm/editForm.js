import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { StyleSheet, Text, View, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CurrencyInput from 'react-native-currency-input';

export default function EditForm({ setModalEditVisible, setData, selectedItem }) {
  const [date, setDate] = useState(dayjs());
  const [calendarModalVisible, setCalendarModelVisible] = useState(false);
  const abrirCalendario = () => setCalendarModelVisible(true);
  const fecharCalendario = () => setCalendarModelVisible(false);

  const handleDateChange = (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setDate(selectedDate);
    setCalendarModelVisible(false);
    formik.setFieldValue('data', formattedDate);
  };

  const formatarDataExtenso = (data) => {
    if (!data || !dayjs(data).isValid()) {
      return '';
    }

    return dayjs(data).format('DD/MM/YYYY');
  };

  const addAlert = () => {
    Alert.alert('Parabéns', 'Produto alterado com sucesso', [
      {
        text: 'OK',
        onPress: setModalEditVisible,
      },
    ]);
  };

  const confirmationRemove = () => {
    Alert.alert('Parabéns', 'Produto excluído com sucesso', [
      {
        text: 'OK',
        onPress: setModalEditVisible,
      },
    ]);
  };

  const removeAlert = () => {
    Alert.alert('Você tem certeza?', 'O processo não poderá ser revertido', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sim',
        onPress: () => deleteItem(),
      },
    ]);
  };

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

  const deleteItem = () => {
    axios
      .delete('http://10.50.184.66:3001/racao', { data: { id: selectedItem._id } })
      .then(() => {
        confirmationRemove();
        fetchData();
      })
      .catch((error) => {
        console.error('Erro ao excluir produto:', error);
        addAlert('Erro ao excluir o produto');
      });
  };

  const formik = useFormik({
    initialValues: {
      marca: selectedItem.marca,
      quantidade: selectedItem.quantidade.toString(),
      valor: selectedItem.valor.toString(),
      data: selectedItem.data,
    },
    validationSchema: Yup.object().shape({
      marca: Yup.string().max(15, 'Digite 15 caracteres ou menos').required('Campo obrigatório'),
      quantidade: Yup.number()
        .max(500, 'Digite um valor abaixo de 500kg')
        .required('Campo obrigatório'),
      valor: Yup.number()
        .max(5000, 'Digite um valor abaixo de R$ 5.000,00')
        .required('Campo obrigatório'),
      data: Yup.date().required('Campo obrigatório'),
    }),
    onSubmit: (values) => {
      const updatedData = {
        marca: values.marca,
        quantidade: parseFloat(values.quantidade),
        data: values.data,
        valor: parseFloat(values.valor),
        id: selectedItem._id,
      };
      axios
        .patch('http://10.50.184.66:3001/racao', updatedData)
        .then(() => {
          addAlert();
          fetchData();
        })
        .catch((error) => {
          console.error('Erro ao atualizar produto:', error);
        });
    },
  });

  return (
    <View style={styles.formContainer}>
      <Text style={styles.textLabel}>Marca</Text>
      <TextInput
        name='marca'
        placeholder='Digite aqui a marca da ração'
        style={styles.textInput}
        onChangeText={formik.handleChange('marca')}
        onBlur={formik.handleBlur('marca')}
        value={formik.values.marca}
        inputMode='text'
      />
      {formik.errors.marca && formik.touched.marca ? (
        <Text style={styles.errorText}>{formik.errors.marca}</Text>
      ) : null}
      <Text style={styles.textLabel}>Quantidade</Text>
      <CurrencyInput
        name='quantidade'
        placeholder='Digite aqui a quantidade de ração'
        style={styles.textInput}
        onChangeValue={(formattedValue) => formik.setFieldValue('quantidade', formattedValue)}
        onBlur={formik.handleBlur('quqntidade')}
        value={formik.values.quantidade}
        inputMode='numeric'
        suffix=' kg'
        delimiter='.'
        separator=','
        precision={2}
        maxLength={9}
      />
      {formik.errors.quantidade && formik.touched.quantidade ? (
        <Text style={styles.errorText}>{formik.errors.quantidade}</Text>
      ) : null}
      <Text style={styles.textLabel}>Valor</Text>
      <CurrencyInput
        name='valor'
        placeholder='Digite aqui o valor da ração'
        style={styles.textInput}
        onChangeValue={(formattedValue) => formik.setFieldValue('valor', formattedValue)}
        onBlur={formik.handleBlur('valor')}
        value={formik.values.valor}
        inputMode='numeric'
        prefix='R$ '
        delimiter='.'
        separator=','
        precision={2}
        maxLength={10}
      />
      {formik.errors.valor && formik.touched.valor ? (
        <Text style={styles.errorText}>{formik.errors.valor}</Text>
      ) : null}
      <Text style={styles.textLabel}>Data</Text>
      <View style={styles.inputDate}>
        <TextInput
          name='data'
          placeholder='Selecione a data'
          editable={false}
          style={styles.inputFieldDate}
          onChange={formik.handleChange('data')}
          onBlur={formik.handleBlur('data')}
          value={formatarDataExtenso(formik.values.data)}
        />
        <TouchableOpacity onPress={abrirCalendario}>
          <Ionicons name='calendar' size={16} color='#3D405B' />
        </TouchableOpacity>
        <Modal
          animationType='slide'
          transparent={true}
          visible={calendarModalVisible}
          onRequestClose={fecharCalendario}
        >
          <View style={styles.modalCalendarView}>
            <View style={styles.modalCalendar}>
              <View style={styles.calendarContent}>
                <DateTimePicker
                  mode='single'
                  date={date}
                  onChange={(params) => handleDateChange(params.date)}
                  style={styles.calendarContent}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {formik.errors.data && formik.touched.data ? (
        <Text style={styles.errorText}>{formik.errors.data}</Text>
      ) : null}
      <View style={styles.formBottom}>
        <TouchableOpacity
          style={[styles.formButtonAdd]}
          onPress={() => {
            const hasChanged =
              formik.values.marca !== selectedItem.marca ||
              formik.values.quantidade !== selectedItem.quantidade.toString() ||
              formik.values.valor !== selectedItem.valor.toString() ||
              formik.values.data !== selectedItem.data;

            if (!hasChanged) {
              setModalEditVisible();
            } else {
              formik.handleSubmit();
            }
          }}
        >
          <Text style={{ textAlign: 'center' }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.formButtonRemove]} onPress={removeAlert}>
          <Text style={{ textAlign: 'center' }}>Excluir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.formButtonCancel]} onPress={setModalEditVisible}>
          <Text style={{ textAlign: 'center' }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
  },
  textLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3D405B',
  },
  textInput: {
    height: 40,
    width: '100%',
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 10,
  },
  inputDate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    width: '100%',
    marginVertical: 10,
    backgroundColor: '#F5F5F5',
    borderColor: 'gray',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 10,
  },
  modalCalendarView: {
    display: 'flex',
    alignSelf: 'center',
    height: '40%',
    width: '90%',
    marginTop: '60%',
  },
  modalCalendar: {
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
  calendarContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  errorText: {
    paddingBottom: 10,
    fontSize: 10,
    fontWeight: '400',
    color: 'red',
  },
  formBottom: {
    display: 'flex',
    height: '10%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  formButtonAdd: {
    width: 80,
    borderRadius: 10,
    paddingVertical: 15,
    elevation: 2,
    backgroundColor: '#DDBEA9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  formButtonCancel: {
    width: 80,
    borderRadius: 10,
    paddingVertical: 15,
    elevation: 2,
    backgroundColor: '#D9D9D9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  formButtonRemove: {
    width: 80,
    borderRadius: 10,
    paddingVertical: 15,
    elevation: 2,
    backgroundColor: '#D99696',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
