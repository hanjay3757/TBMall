import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const WishlistScreen = ({ navigation }) => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>찜한 상품이 없습니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={wishlist}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => navigation.navigate('상품상세', { product: item })}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => addToCart(item)}
              >
                <Text style={styles.cartButtonText}>장바구니 담기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.wishButton}
                onPress={() => toggleWishlist(item)}
              >
                <Text style={styles.wishButtonText}>찜 삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#5f0080',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  wishButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  wishButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default WishlistScreen; 