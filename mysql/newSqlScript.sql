use my_cat;
drop table tbmall_stuff;
show tables;
drop table tbmall_board ;
drop table tbmall_review;
drop table tbmall_member;
drop table tblmall_admin;
drop table tbmall_admin_account;
drop table tbmall_orders;
drop table tbmall_stuff;
drop table tbl_member;
DROP database my_cat; 
create database my_cat;
ALTER TABLE tbmall_orders DROP FOREIGN KEY tbmall_orders_ibfk_2;
create table tbmall_board(		
	board_no int auto_increment primary key,
	member_no int not null,
	board_title varchar(400) not null,
    board_content text not null,
	board_readcount int not null default 0,
    board_writdate date not null,
    foreign key (member_no) references tbmall_member(member_no) on delete cascade
    );		
ALTER TABLE tbmall_board 
ADD COLUMN board_delete TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (0: 활성, 1: 삭제됨)',
ADD COLUMN board_delete_at TIMESTAMP NULL DEFAULT NULL COMMENT '삭제된 일시';

DELIMITER $$

CREATE TRIGGER update_board_delete_at
BEFORE UPDATE ON tbmall_board
FOR EACH ROW
BEGIN
    IF NEW.board_delete = 1 AND OLD.board_delete = 0 THEN
        SET NEW.board_delete_at = CURRENT_TIMESTAMP;
    END IF;
END $$

DELIMITER ;


select * from tbmall_board;
select * from tbmall_member;

CREATE TABLE tbmall_member (		
    member_no INT AUTO_INCREMENT PRIMARY KEY,	
    member_id VARCHAR(50) NOT NULL UNIQUE COMMENT '아이디로 사용됨',
    member_pw VARCHAR(100) NOT NULL DEFAULT '1234',
    member_nick varchar(20) not null,
    member_gender varchar(5) not null,
    member_birth date not null,
    member_phone varchar(20),
    member_email varchar(40) not null,
    member_joindate date not null
       );
insert into tbmall_member (member_id,member_pw,member_nick,member_gender,member_birth,member_phone,member_email,member_joindate) values('abbcccddd',1234,'testtest1','m','1996-06-14','010-0000-0000','adfad@adfa.com',sysdate());
select * from tbmall_member;
rename table tbl_member to tbmall_member;

UPDATE tbmall_member 
	SET member_delete = 1
	WHERE member_no = 2;
ALTER TABLE tbmall_member 
ADD COLUMN member_delete TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (0: 활성, 1: 삭제됨)',
ADD COLUMN member_delete_at TIMESTAMP NULL DEFAULT NULL COMMENT '삭제된 일시';

DELIMITER $$

CREATE TRIGGER update_member_delete_at
BEFORE UPDATE ON tbmall_member
FOR EACH ROW
BEGIN
    IF NEW.member_delete = 1 AND OLD.member_delete = 0 THEN
        SET NEW.member_delete_at = CURRENT_TIMESTAMP;
    END IF;
END $$

DELIMITER ;
ALTER TABLE tbmall_member 
DROP COLUMN member_delete_at;
ALTER TABLE tbmall_member 
DROP COLUMN member_delete;

-- 관리자 권한 
create table tbmall_admin(
	admin_no int primary key auto_increment,
    member_no int not null,
    delete_right_no int not null,
    foreign key (member_no) references tbmall_member(member_no) on delete cascade
);

insert into tbmall_admin (member_no,delete_right_no) values('1','1');
delete tbmall_member  member_no=2;
select * from tbmall_admin;
drop table tbmall_admin;
select * from tbmall_member a inner join tbmall_admin b on a.member_no = b.member_no;
-- 관리자 권한이 있는 사용자 확인
SELECT m.*, a.admin_no, a.delete_right_no
FROM tbmall_member m
INNER JOIN tbmall_admin a ON m.member_no = a.member_no
WHERE a.delete_right_no = 1;
-- 삭제 권한 가진 관리자 호출(회원번호, 아이디 )
select tbmall_admin.admin_no,tbmall_member.member_no, tbmall_member.member_nick from tbmall_admin join tbmall_member on tbmall_admin.member_no= tbmall_member.member_no where tbmall_admin.delete_right_no =1;

UPDATE tbmall_admin
SET admin_no = 1, delete_right_no = 1
WHERE member_no = 1;









drop table tbmall_stuff;
-- 물건 테이블
CREATE TABLE tbmall_stuff (
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    item_price INT NOT NULL,
    item_stock INT NOT NULL DEFAULT 0,
    item_description TEXT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_no INT NOT NULL,
    FOREIGN KEY (admin_no) REFERENCES tbmall_admin(admin_no) ON DELETE CASCADE,
    item_delete TINYINT DEFAULT 0,
    delete_date TIMESTAMP NULL,
    image_url VARCHAR(255) NULL  -- 추가된 부분
);
ALTER TABLE tbmall_stuff 
ADD COLUMN item_delete TINYINT DEFAULT 0,
ADD COLUMN delete_date TIMESTAMP NULL;
select * from tbmall_stuff;
SELECT item_id, item_name, image_url FROM tbmall_stuff WHERE item_delete = 0;
INSERT INTO tbmall_stuff (
    item_name, 
    item_price, 
    item_stock, 
    item_description, 
    admin_no
) 
VALUES 
    ('아이폰 15', 1200000, 50, 'Apple 최신 모델, 고급 스마트폰', 1),
    ('갤럭시 S24', 1100000, 30, 'Samsung 최신 모델, 성능 좋은 스마트폰', 1),
    ('에어팟 프로 2', 250000, 100, 'Apple 무선 이어폰, 고음질', 1),
    ('삼성 65인치 TV', 1500000, 20, '4K 해상도, 스마트 TV', 1);
ALTER TABLE tbmall_stuff ADD COLUMN image_url VARCHAR(255);

select * from tbmall_orders;
DESC tblmall_member;
DROP TABLE tbmall_orders;
CREATE TABLE tbmall_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    member_no INT NOT NULL,
    item_id BIGINT NOT NULL,
    board_no INT NOT NULL,
    order_quantity INT NOT NULL DEFAULT 1, -- 기본값 설정
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_no) REFERENCES tbmall_member(member_no) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES tbmall_stuff(item_id) ON DELETE CASCADE,
    FOREIGN KEY (board_no) REFERENCES tbmall_board(board_no) ON DELETE CASCADE,
    INDEX idx_member_no (member_no), -- 인덱스 추가
    INDEX idx_item_id (item_id), -- 인덱스 추가
    imageurl VARCHAR(255) NULL  
);
ALTER TABLE tbmall_orders
CHANGE COLUMN image_url imageurl VARCHAR(255) NULL;
-- //하셔야 합니다 
ALTER TABLE tbmall_orders 
DROP FOREIGN KEY tbmall_orders_ibfk_4;

-- 2. board_no 컬럼을 NULL 허용으로 변경
ALTER TABLE tbmall_orders 
MODIFY COLUMN board_no INT NULL;
 ALTER TABLE tbmall_orders MODIFY board_no INT DEFAULT 0; -- 기본값 설정 예시
-- 3. 새로운 외래 키 제약조건 추가 (NULL 허용 및 ON DELETE SET NULL)
ALTER TABLE tbmall_orders 
ADD CONSTRAINT fk_orders_board
FOREIGN KEY (board_no) 
REFERENCES tbmall_board(board_no) 
ON DELETE SET NULL;
-- 요기 까지
select * from tbmall_orders;
SELECT item_id, image_url FROM tbmall_stuff WHERE item_id IN (SELECT item_id FROM tbmall_orders);
SELECT item_id, image_url FROM tbmall_stuff WHERE item_id = 1;
SELECT * FROM tbmall_orders;
ALTER TABLE tbl_cart 
ADD UNIQUE KEY uk_item_user (item_id, user_id);
ALTER TABLE tbl_stuff ADD COLUMN image_url VARCHAR(255);
select* from tbl_stuff; 
INSERT INTO tbmall_stuff (item_name, price, stock, description,deleted) VALUES 
('4', 30000, 30, '테스트 상품 3 설명',0);
SELECT * FROM tbl_stuff;