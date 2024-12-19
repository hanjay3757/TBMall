import React, { useState, useEffect } from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, View, FlatList } from "react-native";

const App = () => {
  const [searchWord, setSearchWord] = useState("");
  const [results, setResults] = useState([]);
  const [trending, setTrending] = useState([]); // 실시간 인기 검색어 상태 추가
  const [previousSearches, setPreviousSearches] = useState([]); // 이전 검색어 상태 추가
  const [error, setError] = useState(null);

  // 실시간 인기 검색어 가져오기
  const fetchTrendingKeywords = async () => {
    try {
      const response = await fetch("http://192.168.0.177:3000/trending"); // API URL 수정
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
      setError("검색어를 입력해주세요.");
      return;
    }

    // 이전 검색어 목록에 추가 (최신 10개 유지, 중복 제거)
    setPreviousSearches((prev) => {
      const updatedSearches = [searchWord, ...prev.filter((item) => item !== searchWord)];
      return updatedSearches.slice(0, 5);
    });
    setError(null);

    try {
      const response = await fetch("http://192.168.0.177:3000/search", { // API URL 수정
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchWord }),
      });
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        fetchTrendingKeywords(); // 실시간 인기 검색어 갱신
      } else {
        setError(data.message || "검색 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const removePreviousSearch = (itemToRemove) => {
    setPreviousSearches((prev) => prev.filter((item) => item !== itemToRemove));
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

{/* 실시간 인기 검색어 리스트 */}
<View style={styles.trendingWrapper}>
  <Text style={styles.sectionTitle}>🔥 실시간 인기 검색어</Text>
  <View style={styles.trendingContainer}>
    {/* 왼쪽 1~5위 */}
    <FlatList
      data={trending.slice(0, 5)} // 상위 5개
      keyExtractor={(item, index) => `left-${index}`}
      renderItem={({ item, index }) => (
        <View style={styles.trendingItem}>
          <Text style={styles.trendingText}>{index + 1}. {item.keyword} ({item.count}회)</Text>
        </View>
      )}
      style={styles.trendingListLeft}
    />
    {/* 오른쪽 6~10위 */}
    <FlatList
      data={trending.slice(5, 10)} // 6~10위
      keyExtractor={(item, index) => `right-${index}`}
      renderItem={({ item, index }) => (
        <View style={styles.trendingItem}>
          <Text style={styles.trendingText}>{index + 6}. {item.keyword} ({item.count}회)</Text>
        </View>
      )}
      style={styles.trendingListRight}
    />
  </View>
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
  trendingWrapper: {
    marginTop: 16,
  },
  trendingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendingListLeft: {
    flex: 1,
    marginRight: 8,
  },
  trendingListRight: {
    flex: 1,
    marginLeft: 8,
  },
  trendingItem: {
    marginBottom: 8,
  },
  trendingText: {
    fontSize: 14,
    color: "#333",
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
  },
  resultText: {
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginVertical: 8,
  },
});

export default App;
