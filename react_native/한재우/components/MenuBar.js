import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function MenuBar({ navigation }) {
  return (
    <View style={styles.menuBar}>
      <View style={styles.menuLeft}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.buttonText}>검색</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('ItemList')}
        >
          <Text style={styles.buttonText}>상품 목록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuRight}>
        <TouchableOpacity 
          style={[styles.button, styles.cartButton]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.buttonText}>장바구니</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  menuLeft: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  menuRight: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center'
  },
  button: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#007bff'
  },
  buttonText: {
    color: 'white'
  },
  cartButton: {
    backgroundColor: '#28a745'
  }
});

export default MenuBar; 