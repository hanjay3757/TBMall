package com.spring.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.ibatis.annotations.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.spring.config.GlobalConfig;
import com.spring.dto.BoardDto;
import com.spring.dto.CommentDto;
import com.spring.dto.ReviewPointDto;
import com.spring.dto.StaffDto;
import com.spring.dto.StuffDto;
import com.spring.service.BoardService;
import com.spring.service.StuffService;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@RequestMapping("/board/*")
@RestController
@CrossOrigin(origins = GlobalConfig.ALLOWED_ORIGIN, allowedHeaders = "*", methods = { RequestMethod.GET,
		RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH,
		RequestMethod.OPTIONS }, allowCredentials = "true")
@AllArgsConstructor
public class BoardController {
	private BoardService service;

	private StuffService stuffservice;
	


	@GetMapping("/list")
	public ResponseEntity<Map<String, Object>> getBoardList(@RequestParam(defaultValue = "1") int currentPage,
			@RequestParam(defaultValue = "5") int pageSize) {
		// 1. 전체 게시글 수 가져오기
		int totalCount = service.getPostCount();

		// 3. 총 페이지 수 계산
		int totalPages = (int) Math.ceil((double) totalCount / pageSize);

		// 4. 현재 페이지에 해당하는 게시글 가져오기
		ArrayList<BoardDto> boards = service.getBoardlist(currentPage, pageSize);

		// 5. 클라이언트로 반환할 데이터를 Map에 담기
		Map<String, Object> response = new HashMap<>();
		response.put("boards", boards); // 현재 페이지 게시글 목록
		response.put("totalPages", totalPages); // 전체 페이지 수
		response.put("currentPage", currentPage); // 요청한 현재 페이지 번호

		// 6. 응답 반환
		return ResponseEntity.ok(response);
	}

	// 게시판 내 글 내용 보기
	@GetMapping("/read")
	public BoardDto readContent(@RequestParam("board_no") Long board_no, HttpSession session) {
		BoardDto board = service.readContent(board_no);
		session.setAttribute("currentBoard", board);
		return board;
	}

	// 게시판 글 작성 페이지(Getmapping)
	@GetMapping("/write")
	public String writeForm(HttpSession session) {
		return "board/write";
	}

	// 게시판 글 작성 처리(Postmapping)
	@PostMapping("/write")
	@ResponseBody
	public Map<String, Object> writeProcess(@ModelAttribute BoardDto dto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		try {
			dto.setMember_no(loginStaff.getMember_no());
//			System.out.println("받아온 commentDto:" + dto);// 디버깅용
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

	// 게시글 삭제 Get ->Post 변경 필요
	@RequestMapping(value = "/deleteOneContent", method = { RequestMethod.GET, RequestMethod.POST })
	public Map<String, Object> deleteOneContent(@RequestBody Map<String, Long> params, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		try {
			StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
			Long board_no = params.get("board_no");

			if (board_no == null) {
				response.put("success", false);
				response.put("message", "게시글 번호가 필요합니다.");
				return response;
			}

			if (loginStaff == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return response;
			}

			if (loginStaff.getAdmins() != 1) {
				response.put("success", false);
				response.put("message", "관리자 권한이 필요합니다.");
				return response;
			}

			// 게시글 삭제 처리
			int result = service.deleteOneContent(board_no);
			if (result > 0) {
				response.put("success", true);
				response.put("message", "게시글이 성공적으로 삭제되었습니다.");
			} else {
				response.put("success", false);
				response.put("message", "게시글 삭제에 실패했습니다.");
			}
		} catch (Exception e) {
			log.error("게시글 삭제 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", "게시글 삭제 중 오류가 발생했습니다.");
		}
		return response;
	}

	// 글 수정
	@GetMapping("/editContent")
	public String editContentForm(@RequestParam("boardNo") Long board_no, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		if (loginStaff == null) {
			// 로그인 페이지로 리다이렉트
			return "redirect:/staff/login";
		}

		// 수정하려는 게시글 데이터 가져오기
		BoardDto board = service.readContent(board_no);
		if (board == null) {
			model.addAttribute("error", "게시글이 존재하지 않습니다.");
			return "error";
		}

		// 권한 확인: 작성자이거나 관리자인 경우에 접근 가능
		if (!board.getMember_no().equals(loginStaff.getMember_no()) && loginStaff.getAdmins() != 1) {
			model.addAttribute("error", "권한이 없습니다.");
			return "error";
		}

		// 수정 폼에 데이터 전달
		model.addAttribute("board", board);
		return "board/edit";
	}

	@PostMapping("board/editContent")
	public Map<String, Object> editContent(@RequestBody BoardDto board, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");

		if (loginStaff == null
				|| (!board.getMember_no().equals(loginStaff.getMember_no()) && loginStaff.getAdmins() != 1)) {
			response.put("success", false);
			response.put("message", "권한이 없습니다.");
			return response;
		}

		try {
			service.editContent(board); // 수정 로직
			response.put("success", true);
			response.put("message", "정보가 수정되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			response.put("success", false);
			response.put("message", "수정 중 오류가 발생했습니다.");
		}

		return response;
	}

	// 읽고 있는 글에 달린 댓글 모두 가져오기
	@GetMapping("/commentlist")
	public ResponseEntity<Map<String, Object>> getCommentList(@RequestParam("item_id") Long item_id,
			@RequestParam(defaultValue = "1") int currentComment, @RequestParam(defaultValue = "5") int cpageSize) {
		// 전체 댓글 수 가져오기
		int totalCount = service.getCommentCount(item_id);

		// 총 페이지 수 계산
		int totalComment = (int) Math.ceil((double) totalCount / cpageSize);

		// 현재 페이지에 해당하는 댓글 가져오기
		List<CommentDto> comments = service.getCommentList(item_id, currentComment, cpageSize);

		// 클라이언트로 반환할 데이터를 Map 에 담기
		Map<String, Object> response = new HashMap<>();
		response.put("comments", comments);
		response.put("totalComment", totalComment);
		response.put("currentComment", currentComment);

		return ResponseEntity.ok(response);
	}

	// 댓글 달기
	@GetMapping("/comment")
	public String writeComment(@RequestParam("item_id") Long item_id, Model model, HttpSession session) {
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		if (loginStaff == null) {
			// 로그인 페이지로 리다이렉트
			return "redirect:/staff/login";
		}

		// 댓글 쓰려는 게시글 데이터 가져오기
		StuffDto itemStuff = stuffservice.getItem(item_id);

		model.addAttribute("itemStuff", itemStuff);

		// 세션에 댓글 쓰려는 게시글 데이터 저장
		session.setAttribute("currentStuff", itemStuff);

		return "stuff/comment";
	}

	@PostMapping("/comment")
	public Map<String, Object> commentProcess(@RequestBody CommentDto dto, HttpSession session) {
		Map<String, Object> response = new HashMap<>();
		StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
		StuffDto currentStuff = (StuffDto) session.getAttribute("currentStuff");

		log.info("loginStaff: " + session.getAttribute("loginStaff"));
		log.info("currentStuff: " + session.getAttribute("currentStuff"));

		if (loginStaff == null || currentStuff == null) {
			response.put("success", false);
			response.put("message", "세션이 초기화되었거나 데이터가 누락되었습니다. 다시 시도해주세요.");
			return response;
		}

		try {
			dto.setItem_id(currentStuff.getItem_id());
			dto.setMember_no(loginStaff.getMember_no());
			service.writeComment(dto);
			
			// 생성된 댓글의 ID를 가져오기
			Long commentNo = dto.getComment_no();
		
			//세션에서 별점 데이터를 가져오기
			Integer reviewpointAmount = dto.getReviewpoint_amount();
			
			if(reviewpointAmount != null && reviewpointAmount >0) {
				ReviewPointDto reviewpointdto = new ReviewPointDto();
				reviewpointdto.setComment_no(commentNo);
				reviewpointdto.setItem_id(currentStuff.getItem_id());
				reviewpointdto.setMember_no(loginStaff.getMember_no());
				reviewpointdto.setReviewpoint_amount(reviewpointAmount);
				reviewpointdto.setReviewpoint_writedate(new Date());
			
				service.insertReviewPoint(reviewpointdto);
			}
			
			response.put("success", true);
			response.put("message", "댓글이 작성되었습니다.");
			response.put("member_no", loginStaff.getMember_no());
			response.put("reviewpointAmount",dto.getReviewpoint_amount());
			response.put("comment_content", dto.getComment_content());
			response.put("comment_writedate", new Date());

		} catch (Exception e) {
			log.error("댓글 등록 실패:" + e.getMessage());
			response.put("success", false);
			response.put("message", e.getMessage());
		}

		return response;
	}

	// 댓글 삭제
	@PostMapping("/deleteComment")
	public Map<String, Object> deleteComment(
			@Param("comment_no") Long comment_no,
			HttpSession session
	) {
		Map<String, Object> response = new HashMap<>();
		
		try {
			// 로그인 체크
			StaffDto loginStaff = (StaffDto) session.getAttribute("loginStaff");
			log.info("현재 로그인 정보: " + loginStaff);
			
			if (loginStaff == null) {
				response.put("success", false);
				response.put("message", "로그인이 필요합니다.");
				return response;
			}

			// 관리자 권한 체크
			if (loginStaff.getAdmins() != 1) {
				response.put("success", false);
				response.put("message", "관리자 권한이 필요합니다.");
				return response;
			}

			// 댓글 삭제 실행
			service.deleteComment(comment_no);
			
			response.put("success", true);
			response.put("message", "댓글이 삭제되었습니다.");
			
		} catch (Exception e) {
			log.error("댓글 삭제 실패: " + e.getMessage());
			response.put("success", false);
			response.put("message", "댓글 삭제에 실패했습니다: " + e.getMessage());
		}

		return response;
	}
	
	
	
	
	
	

}