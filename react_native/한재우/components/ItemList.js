import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView 
} from 'react-native';

function ItemList() {
  return (
    <ScrollView style={styles.container}>
      {/* 로딩 스피너 */}
      <View style={styles.loadingSpinner}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>

      {/* 아이템 목록 */}
      <View style={styles.itemsContainer}>
        <View style={styles.itemCard}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>상품명</Text>
            <Text style={styles.itemPrice}>가격: ₩10,000</Text>

            {/* 장바구니 컨트롤 */}
            <View style={styles.cartControls}>
              <TextInput 
                style={styles.quantityInput}
                keyboardType="numeric"
                placeholder="수량"
              />
              <TouchableOpacity style={styles.addToCartButton}>
                <Text style={styles.buttonText}>장바구니 담기</Text>
              </TouchableOpacity>
            </View>

            {/* 관리자 컨트롤 */}
            <View style={styles.adminControls}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.buttonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.buttonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  },
  itemsContainer: {
    padding: 20
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  itemContent: {
    gap: 10
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  itemPrice: {
    fontSize: 16,
    color: '#666'
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10
  },
  quantityInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 6
  },
  addToCartButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4
  },
  adminControls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4
  },
  buttonText: {
    color: 'white'
  }
});

export default ItemList;