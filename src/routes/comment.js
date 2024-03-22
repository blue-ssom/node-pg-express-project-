// 댓글과 관련된 API

const router = require("express").Router() // express 안에 있는 Router만 import
const client = require("../../database/db");
const utils = require('../utils');


// 댓글 보기
router.get('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 보기 세션: ", sessionUserIdx)

    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
   try {

        // 예외처리
        // if (!sessionUserIdx) {
        //   throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
        // } 

        // DB통신: 해당 게시글의 댓글 조회
        const sql = `SELECT * FROM scheduler.comment WHERE post_idx = $1`;
        const data = await pool.query(sql, [postIdx]);

         // DB 후처리
         const row = data.rows

        if (row.length === 0) {
            throw new Error("댓글이 존재하지 않습니다.");
        }

        // 결과 설정
        result.success = true;
        result.message = "댓글 조회 성공";
        result.data = data.rows;

    } catch (e) {
    result.message = e.message;
    } finally {
    res.send(result);
    }

});

// 댓글 추가
router.post('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; // 사용자가 입력한 PostIdx
    const sessionUserIdx = req.session.userIdx; // 세션에 저장된 사용자 idx
    console.log("댓글 추가하기 세션: ", sessionUserIdx)
    
    const { content } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        // 예외처리
        // if (!sessionUserIdx) {
        //   throw new Error("잘못된 접근입니다.")   // 세션이 없는 경우
        // } 

        checkContent(content);

        // DB통신: 댓글 추가
        const insertCommentSQL = `
            INSERT INTO scheduler.comment (post_idx, user_idx, content, creationdate, updationdate)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        const insertCommentResult = await pool.query(insertCommentSQL, [postIdx, sessionUserIdx, content]);

        // 결과 설정
        result.success = true;
        result.message = "댓글 추가 성공";
        result.data = insertCommentResult.rows[0];
        
    } catch(e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }

});

// 댓글 수정
router.put('/:postIdx/:commentIdx', async (req, res) => {
    const postIdx = req.params.postIdx; // 게시글 ID
    const commentIdx = req.params.commentIdx; // 댓글 ID
    const { content } = req.body; // 수정된 댓글 내용

    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        // DB통신: 댓글 수정
        const updateCommentSQL = `
            UPDATE scheduler.comment
            SET content = $1,
                updationdate = CURRENT_TIMESTAMP
            WHERE comment_idx = $2 AND post_idx = $3;
        `;
        const updateCommentResult = await pool.query(updateCommentSQL, [content, commentIdx, postIdx]);

        // DB 후처리
        const row = updateCommentResult.rows;

        if (row.length === 0) {
            throw new Error("댓글 수정에 실패하였습니다.");
        }

        // 결과 설정
        result.success = true;
        result.message = "댓글 수정 성공";
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

// 댓글 삭제하기
// 댓글 좋아요
// 댓글 좋아요 취소

// export 작업
module.exports = router