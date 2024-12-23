import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

function Cart() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.itemsContainer}>
        {/* 아이템 카드 */}
        <View style={styles.itemCard}>
          <View style={styles.itemContent}>
            <View style={styles.imageContainer}>
              <Image 
                style={styles.itemImage}
                source={{ uri: 'item_image_url' }}
                resizeMode="cover"
              />
            </View>
            
            {/* 수량 컨트롤 */}
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>1</Text>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* 삭제 버튼 */}
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
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
  imageContainer: {
    height: 200,
    borderRadius: 4,
    overflow: 'hidden'
  },
  itemImage: {
    width: '100%',
    height: '100%'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  controlButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  },
  quantityText: {
    fontSize: 16
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4
  }
});

export default Cart;  