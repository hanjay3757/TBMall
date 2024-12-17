import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const categories = [
  { id: '1', title: '채소', icon: '🥬' },
  { id: '2', title: '과일·견과·쌀', icon: '🍎' },
  { id: '3', title: '수산·해산·건어물', icon: '🐟' },
  { id: '4', title: '정육·계란', icon: '🥩' },
  // 추가 카테고리...
];

const CategoryScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
  },
});

export default CategoryScreen; 