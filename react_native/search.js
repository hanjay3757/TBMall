import React, { useState, useCallback } from "react";

export const useSearch = () => {
  const [searchWord, setSearchWord] = useState("");
  const [results, setResults] = useState([]);
  const [previousSearches, setPreviousSearches] = useState([]);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(true);

  const handleImageError = useCallback(() => {
    console.log('이미지 로드 실패, 대체 이미지 사용');
    setImageLoaded(false);
  }, []);

  const getSecureImageUrl = (url) => {
    if (!url) return null;
    return 'https://images.weserv.nl/?url=' + encodeURIComponent(url);
  };

  const onPressSearch = async () => {
    if (searchWord.trim().length === 0) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setPreviousSearches((prev) => {
      const updatedSearches = [searchWord, ...prev.filter((item) => item !== searchWord)];
      return updatedSearches.slice(0, 5);
    });
    setError(null);

    try {
      const encodedKeyword = encodeURIComponent(searchWord);
      console.log('검색 요청 URL:', `http://192.168.0.141:8080/mvc/search/items?keyword=${encodedKeyword}`);
      
      const response = await fetch(
        `http://192.168.0.141:8080/mvc/search/items?keyword=${encodedKeyword}`,
        {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      const data = await response.json();
      
      // 서버 응답 데이터 확인
      console.log('서버 응답 데이터:', data);
      console.log('검색 결과 개수:', data.items ? data.items.length : 0);
      
      if (response.ok) {
        if (data.items && data.items.length > 0) {
          console.log('첫 번째 아이템:', data.items[0]);
        }
        setResults(data.items || []);
      } else {
        console.error('서버 에러:', data.message);
        setError(data.message || "검색 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("검색 중 오류가 발생했습니다:", err);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const removePreviousSearch = (itemToRemove) => {
    setPreviousSearches((prev) => prev.filter((item) => item !== itemToRemove));
  };

  return {
    searchWord,
    setSearchWord,
    results,
    previousSearches,
    error,
    onPressSearch,
    removePreviousSearch,
    imageLoaded,
    handleImageError,
    getSecureImageUrl
  };
}; 