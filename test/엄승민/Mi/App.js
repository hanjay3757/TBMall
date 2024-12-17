import React, { useState, useEffect } from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, View, FlatList } from "react-native";

const App = () => {
  const [searchWord, setSearchWord] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]); // 실시간 인기 검색어 상태 추가
  const [error, setError] = useState(null);

  // 실시간 인기 검색어 가져오기
  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch("https://your-api-url.com/trending?limit=10");
      const data = await response.json();
      if (response.ok) {
        setTrending(data);
      } else {
        console.error("인기 검색어 API 에러: ", data.message);
      }
    } catch (err) {
      console.error("네트워크 오류: ", err);
    }
  };

  useEffect(() => {
    fetchTrendingKeywords();
  }, []); // 앱 시작 시 인기 검색어 가져오기

  const onPressSearch = async () => {
    if (searchWord.trim().length === 0) {
      console.log("검색어가 비어있습니다.");
      setError("검색어를 입력해주세요.");
      return;
    }

    setError(null);
    try {
      console.log("검색 중: ", searchWord);
      const response = await fetch(`https://your-api-url.com/search?query=${searchWord}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error("API 에러: ", data.message);
        setError(data.message || "검색 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("네트워크 에러: ", err);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const renderResult = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultText}>{item.name}</Text>
    </View>
  );

  const renderTrending = ({ item, index }) => (
    <View style={styles.trendingItem}>
      <Text style={styles.trendingText}>{index + 1}. {item.keyword} ({item.count}회)</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            value={searchWord}
            onChangeText={setSearchWord}
            onSubmitEditing={onPressSearch}
            placeholder="검색어를 입력하세요"
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.button} onPress={onPressSearch}>
            <Text style={styles.buttonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 실시간 인기 검색어 리스트 */}
      <View style={styles.trendingWrapper}>
        <Text style={styles.sectionTitle}>🔥 실시간 인기 검색어</Text>
        <FlatList
          data={trending}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTrending}
          style={styles.trendingList}
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
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    marginVertical: 8,
  },
  resultList: {
    marginTop: 16,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  resultText: {
    fontSize: 16,
  },
  trendingWrapper: {
    marginTop: 16,
  },
  trendingList: {
    marginBottom: 16,
  },
  trendingItem: {
    paddingVertical: 6,
  },
  trendingText: {
    fontSize: 14,
    color: "#333",
  },
});

export default App;
