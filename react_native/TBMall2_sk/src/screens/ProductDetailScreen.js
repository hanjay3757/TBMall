import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ReviewList from '../components/ReviewList';
import ProductOptions from '../components/ProductOptions';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWished = isInWishlist(product.id);

  const handleSelectOption = (type, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddToCart = () => {
    const requiredOptions = product.options?.filter(opt => opt.required);
    const missingOptions = requiredOptions?.filter(
      opt => !selectedOptions[opt.type]
    );

    if (missingOptions?.length > 0) {
      Alert.alert('알림', `${missingOptions[0].type}을(를) 선택해주세요.`);
      return;
    }

    addToCart({
      ...product,
      selectedOptions,
      quantity,
    });
    navigation.navigate('장바구니');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* 상품 이미지 */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.wishButton}
            onPress={() => toggleWishlist(product)}
          >
            <Icon 
              name={isWished ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isWished ? '#5f0080' : '#666'} 
            />
          </TouchableOpacity>
        </View>

        {/* 상품 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
          
          <View style={styles.priceContainer}>
            {product.discount ? (
              <>
                <Text style={styles.discountRate}>{product.discount}%</Text>
                <Text style={styles.discountedPrice}>
                  {Math.floor(product.price * (1 - product.discount / 100)).toLocaleString()}원
                </Text>
                <Text style={styles.originalPrice}>
                  {product.price.toLocaleString()}원
                </Text>
              </>
            ) : (
              <Text style={styles.price}>{product.price.toLocaleString()}원</Text>
            )}
          </View>

          {/* 배송 정보 */}
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>배송</Text>
            <View style={styles.deliveryDetail}>
              <Text>컬리 배송</Text>
              <Text>23시 전 주문 시 내일 아침 7시 전 도착</Text>
              <Text>(대구·부산·울산 샛별배송 운영시간 별도 확인)</Text>
            </View>
          </View>

          {/* 판매자 정보 */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>판매자</Text>
            <Text>{product.seller || '컬리'}</Text>
          </View>

          {/* 리뷰 섹션 */}
          <ReviewList productId={product.id} navigation={navigation} />

          {product.options && (
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsTitle}>상품 옵션</Text>
              <ProductOptions
                options={product.options}
                selectedOptions={selectedOptions}
                onSelectOption={handleSelectOption}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* 하단 구매 버튼 */}
      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Icon name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Icon name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>장바구니 담기</Text>
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
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: width,
  },
  infoContainer: {
    padding: 20,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  discountRate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5f0080',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deliveryInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 20,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deliveryDetail: {
    gap: 6,
  },
  sellerInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 20,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginRight: 16,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 5,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#5f0080',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wishButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  optionsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ProductDetailScreen; 