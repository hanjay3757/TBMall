package com.spring.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.mysql.cj.Session;
import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
import com.spring.dto.StaffDto;
import com.spring.service.BoardService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@RequestMapping("/board/*")
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
		RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS }, allowCredentials = "true")
@AllArgsConstructor
public class BoardController {
	private BoardService service;

	@GetMapping("/list")
	public List<BoardDto> getBoardlist() {
		return service.getBoardlist();
	}

	// 게시판 내 글 내용 보기
	@GetMapping("/read")
	public BoardDto readContent(@RequestParam("board_no") Long board_no , HttpSession session) {
		BoardDto board = service.readContent(board_no);
		session.setAttribute("currentBoard", board);
		return board;
	
	}

	// 게시판 글 작성 페이지(Getmapping)
	@GetMapping("/write")
	public String writeForm(HttpSession session) {

		return "board/wirte";
	}

	// 게시판 글 작성 처리(Postmapping)
	@PostMapping("/write")
	@ResponseBody
	public Map<String, Object> writeProcess(@ModelAttribute BoardDto dto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		try {
			dto.setMember_no(loginStaff.getMember_no());
			System.out.println("받아온 boardDto:" + dto);// 디버깅용
			service.writeContent(dto);
			response.put("success", true);
			response.put("message", "글이 작성되었습니다.");
		} catch (Exception e) {
			log.error("글 등록 실패:" + e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
		}

		return response;
	}


//
	// 게시글 삭제 Get ->Post 변경 필요
	@PostMapping("/deleteOneContent")
	public Map<String, Object> deleteOneContent(@RequestParam("board_no") Long board_no,
//			@RequestParam("member_no") Long member_no, 
			HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null) {
			response.put("success", false);
			response.put("message", "로그인이 필요합니다.");
			return response;
		}
//
//		if (loginStaff.getMember_no() != member_no) {
//			response.put("success", false);
//			response.put("message", "해당글 삭제에 관한 권한이 없습니다.");
//			return response;
//		}
//
//		try {
//			if (loginStaff.getMember_no().equals(member_no)) {
//				response.put("success", false);
//				response.put("message", "자신의 계정은 삭제할 수 없습니다.");
//				return response;
//			}

		service.deleteOneContent(board_no);
		response.put("success", true);
		response.put("message", "게시글이 성공적으로 삭제되었습니다.");
//		} catch (RuntimeException e) {
//			response.put("success", false);
//			response.put("message", e.getMessage());
//		}

		return response;
	}


	//글 수정
	@GetMapping("/editContent")
	public String editContentForm(@RequestParam("boardNo") Long board_no, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		if (loginStaff == null) {
			//로그인 페이지로 리다이렉트
			return "redirect:/staff/login";
		}
		
		//수정하려는 게시글 데이터 가져오기
		BoardDto board = service.readContent(board_no);
		if(board == null) {
			model.addAttribute("error", "게시글이 존재하지 않습니다.");
			return "error";
		}
		
		//권한 확인: 작성자이거나 관리자인 경우에 접근 가능
		if (!board.getMember_no().equals(loginStaff.getMember_no()) && loginStaff.getAdmins() != 1) {
			model.addAttribute("error", "권한이 없습니다.");
			return "error";
		}

		//수정 폼에 데이터 전달
		model.addAttribute("board", board);
		return "board/edit";
	}
	
//
//	@PostMapping("/editContent")
//	public Map<String, Object> editContent(
////			@RequestBody BoardDto boardDto,
//			@RequestParam("boardNo") Long board_no,
//			@RequestParam("memberNo") Long member_no,
//			@RequestParam("board_title") String board_title,
//			@RequestParam("board_content") String board_content,
//			HttpSession session) {
//
//		Map<String, Object> response = new HashMap<>();
//		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
//		
//		BoardDto boardDto = new BoardDto();
//		
//
////		StaffDto currentStaff = service.read(member_no);
////		if (!currentStaff.getMember_pw().equals(currentPassword)) {
////			response.put("success", false);
////			response.put("message", "현재 비밀번호가 올바르지 않습니다.");
////			return response;
////		}
//		if (loginStaff == null || (!boardDto.getMember_no().equals(loginStaff.getMember_no()) && loginStaff.getAdmins() != 1)) {
//	        response.put("success", false);
//	        response.put("message", "권한이 없습니다.");
//	        return response;
//	    }
//
//	    try {
//	        service.editContent(boardDto); // 수정 로직
//	        response.put("success", true);
//	        response.put("message", "정보가 수정되었습니다.");
//	    } catch (Exception e) {
//	        e.printStackTrace();
//	        response.put("success", false);
//	        response.put("message", "수정 중 오류가 발생했습니다.");
//	    }
//
//	    return response;
//	}
	@PostMapping("board/editContent")
	public Map<String, Object> editContent(@RequestBody BoardDto boardDto, HttpSession session) {
	    Map<String, Object> response = new HashMap<>();
	    StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

	    if (loginStaff == null || (!boardDto.getMember_no().equals(loginStaff.getMember_no()) && loginStaff.getAdmins() != 1)) {
	        response.put("success", false);
	        response.put("message", "권한이 없습니다.");
	        return response;
	    }

	    try {
	        service.editContent(boardDto); // 수정 로직 
	        response.put("success", true);
	        response.put("message", "정보가 수정되었습니다.");
	    } catch (Exception e) {
	        e.printStackTrace();
	        response.put("success", false);
	        response.put("message", "수정 중 오류가 발생했습니다.");
	    }

	    return response;
	}
	
//
	//읽고 있는 글에 달린 댓글 모두 가져오기
	@GetMapping("/commentlist")
	public List<CommentDto> getCommentList(@RequestParam("board_no") Long board_no){
		
		return service.getCommentList(board_no);
	}
	
	//댓글 달기
	@GetMapping("/comment")
	public String writeComment(@RequestParam("board_no") Long board_no, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto)session.getAttribute("loginStaff");
		if(loginStaff == null) {
			//로그인 페이지로 리다이렉트
			return "redirect:/staff/login";
		}
		
		//댓글 쓰려는 게시글 데이터 가져오기
		BoardDto board = service.readContent(board_no);
		
		model.addAttribute("board", board);
		
		//세션에 댓글 쓰려는 게시글 데이터 저장
		session.setAttribute("currentboard", board);
		
		return "board/comment";
	}
	
	@PostMapping("/board/comment")
	public Map<String, Object> commentProcess(@RequestBody CommentDto dto , HttpSession session){
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		BoardDto currentBoard = (BoardDto) session.getAttribute("currentBoard");
		
		log.info("loginStaff: " + session.getAttribute("loginStaff"));
		log.info("currentBoard: " + session.getAttribute("currentBoard"));
		
		 if (loginStaff == null || currentBoard == null) {
		        response.put("success", false);
		        response.put("message", "세션이 초기화되었거나 데이터가 누락되었습니다. 다시 시도해주세요.");
		        return response;
		    }
		
		try {
			dto.setBoard_no(currentBoard.getBoard_no());
			dto.setMember_no(loginStaff.getMember_no());
			service.writeComment(dto);
			response.put("success", true);
			response.put("message", "댓글이 작성되었습니다.");
			response.put("member_no", loginStaff.getMember_no());
			response.put("comment_content", dto.getComment_content()); // 댓글 내용
	        response.put("comment_writedate", new Date()); // 작성 날짜
			
		}catch (Exception e) {
			log.error("댓글 등록 실패:"+ e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
		}
		
		
		return response;
	}
	

}