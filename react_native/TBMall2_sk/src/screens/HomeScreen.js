import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList 
} from 'react-native';
import ProductItem from '../components/ProductItem';

const dummyProducts = [
  {
    id: '1',
    name: '[KF365] 양파 1.5kg',
    price: 4280,
    image: 'https://placeholder.com/product1',
    discount: 10,
  },
  {
    id: '2',
    name: '[홍대한우] 1++ 등심 200g',
    price: 28900,
    image: 'https://placeholder.com/product2',
  },
  // 추가 상품...
];

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <Image 
          source={{ uri: 'https://placeholder.com/banner' }}
          style={styles.bannerImage}
        />
      </View>

      <View style={styles.categoryMenu}>
        <Text style={styles.sectionTitle}>카테고리</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['채소', '과일', '정육', '수산', '간식'].map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <Text>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.specialProducts}>
        <Text style={styles.sectionTitle}>특가/혜택</Text>
        <View style={styles.productGrid}>
          {dummyProducts.map(product => (
            <ProductItem 
              key={product.id} 
              product={product}
              navigation={navigation}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  banner: {
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  categoryMenu: {
    padding: 15,
  },
  categoryItem: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  specialProducts: {
    padding: 15,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default HomeScreen; 