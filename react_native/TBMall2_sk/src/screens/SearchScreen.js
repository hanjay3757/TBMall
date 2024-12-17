import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  FlatList,
  Text,
  TouchableOpacity 
} from 'react-native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 9)]);
      // 검색 로직 구현
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력해주세요"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      
      <View style={styles.recentSearches}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <FlatList
          data={recentSearches}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchItem}>
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    height: 40,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  recentSearches: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default SearchScreen; 