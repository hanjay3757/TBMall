USE my_cat;
Show TABLES;
CREATE TABLE SearchLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TrendingKeywords (
    keyword VARCHAR(255) PRIMARY KEY,
    count INT DEFAULT 1
);
select * from SearchLogs;
select * from TrendingKeywords;

SELECT * FROM TrendingKeywords ORDER BY count DESC;
