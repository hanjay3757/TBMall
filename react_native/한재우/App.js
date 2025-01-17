import React from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, View, FlatList, Image } from "react-native";
import { useSearch } from "./search";

// ResultItem을 별도의 컴포넌트로 분리
const ResultItem = React.memo(({ item }) => {
  const { imageLoaded, handleImageError, getSecureImageUrl } = useSearch();

  return (
    <View style={styles.resultItem}>
      {item.imageUrl && imageLoaded ? (
        <Image 
          source={{ 
            uri: getSecureImageUrl(item.imageUrl),
            headers: {
              'Accept': '*/*',
              'User-Agent': 'Mozilla/5.0'
            }
          }}
          style={[
            styles.itemImage,
            { backgroundColor: '#f0f0f0' }
          ]}
          resizeMode="contain"
          onError={handleImageError}
        />
      ) : (
        <View style={[styles.itemImage, styles.placeholderContainer]}>
          <Text style={styles.placeholderText}>이미지를 불러올 수 없습니다</Text>
        </View>
      )}

      <View style={styles.itemContent}>
        <Text style={styles.resultText}>{item.itemName}</Text>
        <Text style={styles.resultPrice}>₩{item.itemPrice?.toLocaleString()}</Text>
        <Text style={styles.resultDescription}>{item.itemDescription}</Text>
        <Text style={styles.stockText}>재고: {item.itemStock}개</Text>
        
        <View style={styles.cartControls}>
          <TextInput 
            style={styles.quantityInput}
            keyboardType="numeric"
            placeholder="수량"
            defaultValue="1"
          />
          
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.buttonText}>장바구니 담기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const App = () => {
  const {
    searchWord,
    setSearchWord,
    results,
    previousSearches,
    error,
    onPressSearch,
    removePreviousSearch
  } = useSearch();

  const renderResult = React.useCallback(({ item }) => (
    <ResultItem item={item} />
  ), []);

  const renderPreviousSearch = ({ item }) => (
    <View style={styles.previousSearchItem}>
      <Text style={styles.previousSearchText}>{item}</Text>
      <TouchableOpacity onPress={() => removePreviousSearch(item)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✖</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.input}
          value={searchWord}
          onChangeText={setSearchWord}
          placeholder="검색어를 입력하세요"
        />
        <TouchableOpacity style={styles.button} onPress={onPressSearch}>
          <Text style={styles.buttonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* 이전 검색어 목록 */}
      <View style={styles.previousSearchWrapper}>
        <Text style={styles.sectionTitle}>최근 검색어</Text>
        <FlatList
          data={previousSearches}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderPreviousSearch}
          style={styles.previousSearchList}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* 검색 결과 */}
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderResult}
        style={styles.resultList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop:20
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  previousSearchWrapper: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  previousSearchList: {
    maxHeight: 150,
  },
  previousSearchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  previousSearchText: {
    fontSize: 16,
    color: "#555",
  },
  deleteButton: {
    padding: 4,
    backgroundColor: "#ff4d4d",
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  resultList: {
    marginTop: 16,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  itemContent: {
    gap: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 14,
    color: '#28a745',
  },
  cartControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  quantityInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 6,
  },
  addToCartButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  errorText: {
    color: "red",
    marginVertical: 8,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
});

export default App;
