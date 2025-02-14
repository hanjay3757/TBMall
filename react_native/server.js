const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL 연결 설정
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // MySQL 비밀번호 입력
  database: "my_cat",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 오류:", err);
  } else {
    console.log("MySQL 연결 성공");
  }
});

// 기본 라우트
app.get("/", (req, res) => {
  res.send({ message: "Server is running" });
});

// 실시간 인기 검색어 가져오기
app.get("/trending", (req, res) => {
  const query = "SELECT keyword, count FROM TrendingKeywords ORDER BY count DESC LIMIT 10";

  db.query(query, (err, results) => {
    if (err) {
      console.error("트렌딩 키워드 가져오기 오류:", err);
      res.status(500).json({ message: "트렌딩 키워드 가져오기 실패" });
    } else {
      res.json(results); // MySQL에서 가져온 데이터를 반환
    }
  });
});

// 검색 요청 처리 및 저장
app.post("/search", (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ message: "검색어를 입력하세요." });
  }

  // `SearchLogs` 테이블에 검색 기록 삽입
  const insertLogQuery = "INSERT INTO SearchLogs (keyword) VALUES (?)";
  db.query(insertLogQuery, [keyword], (err) => {
    if (err) {
      console.error("검색 기록 저장 중 오류:", err);
      return res.status(500).json({ message: "검색 기록 저장 실패" });
    }

    console.log("검색 기록 저장 성공:", keyword);

    // `TrendingKeywords` 테이블 업데이트
    const updateTrendingQuery = `
      INSERT INTO TrendingKeywords (keyword, count)
      VALUES (?, 1)
      ON DUPLICATE KEY UPDATE count = count + 1
    `;
    db.query(updateTrendingQuery, [keyword], (err) => {
      if (err) {
        console.error("트렌딩 키워드 업데이트 중 오류:", err);
        return res.status(500).json({ message: "트렌딩 키워드 업데이트 실패" });
      }

      console.log("트렌딩 키워드 업데이트 성공:", keyword);
      res.json({ message: "검색어 처리 완료" });
    });
  });
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
