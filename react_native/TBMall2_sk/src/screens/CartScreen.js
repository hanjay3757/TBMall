import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.selectedOptions && Object.entries(item.selectedOptions).length > 0 && (
          <Text style={styles.optionsText}>
            {Object.entries(item.selectedOptions)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}
          </Text>
        )}
        <Text style={styles.productPrice}>
          {item.price.toLocaleString()}원
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            style={styles.quantityButton}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleClearCart = () => {
    Alert.alert(
      '장바구니 비우기',
      '장바구니를 비우시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => clearCart(),
        },
      ],
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장바구니</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>비우기</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        )}
        keyExtractor={item => item.id}
      />
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>총 금액</Text>
          <Text style={styles.totalPrice}>
            {calculateTotal().toLocaleString()}원
          </Text>
        </View>
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText}>주문하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 'auto',
  },
  removeButtonText: {
    color: '#666',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#5f0080',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#666',
    fontSize: 14,
  },
  optionsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});

export default CartScreen; 