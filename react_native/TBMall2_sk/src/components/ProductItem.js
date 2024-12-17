import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { useCart } from '../context/CartContext';

const ProductItem = ({ product, navigation }) => {
  const { addToCart } = useCart();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('상품상세', { product })}
    >
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
        {product.discount && (
          <Text style={styles.discount}>{product.discount}% 할인</Text>
        )}
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(product)}
        >
          <Text style={styles.addToCartText}>장바구니 담기</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  discount: {
    color: '#5f0080',
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#5f0080',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProductItem; 