import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

const AddProductScreen = () => {
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    discount: '',
  });

  const handleAddProduct = () => {
    if (!productData.name || !productData.price) {
      Alert.alert('알림', '상품명과 가격은 필수 입력사항입니다.');
      return;
    }

    // 여기에 상품 추가 API 호출 로직 구현
    Alert.alert('성공', '상품이 추가되었습니다.');
    setProductData({
      name: '',
      price: '',
      description: '',
      category: '',
      image: '',
      discount: '',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>상품 등록</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>상품명 *</Text>
          <TextInput
            style={styles.input}
            value={productData.name}
            onChangeText={(text) => setProductData({...productData, name: text})}
            placeholder="상품명을 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>가격 *</Text>
          <TextInput
            style={styles.input}
            value={productData.price}
            onChangeText={(text) => setProductData({...productData, price: text})}
            placeholder="가격을 입력하세요"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>카테고리</Text>
          <TextInput
            style={styles.input}
            value={productData.category}
            onChangeText={(text) => setProductData({...productData, category: text})}
            placeholder="카테고리를 입력하세요"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>할인율</Text>
          <TextInput
            style={styles.input}
            value={productData.discount}
            onChangeText={(text) => setProductData({...productData, discount: text})}
            placeholder="할인율을 입력하세요 (예: 10)"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>상품 설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={productData.description}
            onChangeText={(text) => setProductData({...productData, description: text})}
            placeholder="상품 설명을 입력하세요"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>상품 등록</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen; 