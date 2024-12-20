// localhost 대신 실제 IP 주소 사용
const API_BASE_URL = "http://192.168.0.177:8080/mvc";

const onPressSearch = async () => {
    if (searchWord.trim().length === 0) {
        setError("검색어를 입력해주세요.");
        return;
    }

    try {
        console.log('검색 요청 URL:', `${API_BASE_URL}/search/items?keyword=${encodeURIComponent(searchWord)}`);
        const response = await fetch(`${API_BASE_URL}/search/items?keyword=${encodeURIComponent(searchWord)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('검색 결과:', data);
        
        setResults(data.items || []);
        setError(null);
    } catch (err) {
        console.error("검색 중 오류가 발생했습니다:", err);
        setError("검색 중 오류가 발생했습니다. 서버 연결을 확인해주세요.");
    }
}; 