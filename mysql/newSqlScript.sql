use my_cat;
show tables;
drop table tbmall_board ;
drop table tbmall_review;
drop table tbmall_member;
drop table tblmall_admin;
drop table tbmall_admin_account;
drop table tbmall_orders;
drop table tbmall_stuff;
drop table tbl_member;

create table tbmall_board(		
	board_no int auto_increment primary key,
	member_no int not null,
	board_title varchar(400) not null,
    board_content text not null,
	board_readcount int not null default 0,
    board_writdate date not null,
    foreign key (member_no) references tbmall_member(member_no) on delete cascade
    );		



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
    member_joindate date not null,
    member_delete
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

insert into tbmall_admin (member_no,delete_right_no) values('2','0');
delete tbmall_member  member_no=2;
select * from tbmall_admin;

select * from tbmall_member a inner join tbmall_admin b on a.member_no = b.member_no;

-- 삭제 권한 가진 관리자 호출(회원번호, 아이디 )
select tbmall_admin.admin_no,tbmall_member.member_no, tbmall_member.member_nick from tbmall_admin join tbmall_member on tbmall_admin.member_no= tbmall_member.member_no where tbmall_admin.delete_right_no =1;









-- 물건 테이블
CREATE TABLE tbmall_stuff (
    item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    item_price INT NOT NULL,
    item_stock INT NOT NULL DEFAULT 0,
    item_description TEXT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_no int not null,
    foreign key (admin_no) references tbmall_admin(admin_no) on delete cascade
);

select * from tbmall_stuff;

DESC tblmall_member;
DROP TABLE IF EXISTS tbl_orders;
CREATE TABLE tbmall_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    member_no INT not null,                    -- tbl_guest.bno와 동일 타입(INT)
    item_id BIGINT not null, -- tbl_stuff.item_id와 동일 타입으로 수정 필요
    board_no int not null,
    order_quantity INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_no) REFERENCES tbmall_member(member_no) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES tbmall_stuff(item_id) ON DELETE CASCADE,
    foreign key (board_no) references tbmall_board(board_no) on delete cascade
);

select * from tbmall_orders;



ALTER TABLE tbl_cart 
ADD UNIQUE KEY uk_item_user (item_id, user_id);
ALTER TABLE tbl_stuff ADD COLUMN image_url VARCHAR(255);
select* from tbl_stuff; 
INSERT INTO tbl_stuff (item_name, price, stock, description,deleted) VALUES 
('4', 30000, 30, '테스트 상품 3 설명',0);
SELECT * FROM tbl_stuff;