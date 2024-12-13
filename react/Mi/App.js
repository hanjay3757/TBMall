import React, { useState, useEffect } from "react";
import { TextInput, TouchableOpacity, Text, StyleSheet, View, FlatList } from "react-native";

const App = () => {
  const [searchWord, setSearchWord] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

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
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    flex: 0.1,
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
});

export default App;