use my_cat;
create table tbl_guest(		
	bno int auto_increment primary key,	
	btext text	
    
);		
insert into tbl_guest (btext,password) values('test',1234);
insert into tbl_guest (btext) values('고양이');
INSERT INTO tbl_guest (btext, admins) VALUES ('도베르만', 1);

select * from tbl_guest;
select * from staff;
drop table tbl_guest;
CREATE TABLE tbl_guest (		
    bno INT AUTO_INCREMENT PRIMARY KEY,	
    btext VARCHAR(50) NOT NULL UNIQUE COMMENT '아이디로 사용됨',
    password VARCHAR(100) NOT NULL DEFAULT '1234',
    admins TINYINT(1) DEFAULT 0 COMMENT '관리자 여부 (0: 직원, 1: 관리자)',
    deleted TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (0: 활성, 1: 삭제)'
);

-- 관리자 계정 생성
INSERT INTO tbl_guest (btext, password, admins) 
VALUES ('admin', '1234', 1);




ALTER TABLE tbl_guest 
ADD COLUMN admins TINYINT(1) DEFAULT 0 COMMENT '관리자 여부 (0: 직원, 1: 관리자)';
ALTER TABLE tbl_guest 
DROP COLUMN admins;
UPDATE tbl_guest
SET deleted = 0;


-- 5. 관리자 권한 부여 (예: btext가 '관리자'인 계정을 관리자로 설정)
UPDATE tbl_guest SET admins = 1 WHERE btext LIKE '%관리자%';

INSERT INTO tbl_guest btext, password VALUES 
'staff3', '1234';    -- 일반 직원 계정

-- 물건 테이블
CREATE TABLE tbl_stuff (
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    deleted TINYINT DEFAULT 0,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 장바구니 테이블
-- 기존 테이블 삭제
DROP TABLE IF EXISTS tbl_cart;
select * from tbl_cart;
-- 새로운 테이블 생성
CREATE TABLE tbl_cart (
    cart_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_item_user (item_id, user_id)
);
select * from tbl_cart;
DESC tbl_stuff;
DESC tbl_guest;
DROP TABLE IF EXISTS tbl_orders;
CREATE TABLE tbl_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                    -- tbl_guest.bno와 동일 타입(INT)
    item_id BIGINT,                 -- tbl_stuff.item_id와 동일 타입으로 수정 필요
    quantity INT,
    price INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbl_guest(bno) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES tbl_stuff(item_id) ON DELETE CASCADE
);
ALTER TABLE tbl_cart 
ADD UNIQUE KEY uk_item_user (item_id, user_id);
ALTER TABLE tbl_stuff ADD COLUMN image_url VARCHAR(255);
select* from tbl_stuff; 
INSERT INTO tbl_stuff (item_name, price, stock, description,deleted) VALUES 
('4', 30000, 30, '테스트 상품 3 설명',0);
SELECT * FROM tbl_stuff;