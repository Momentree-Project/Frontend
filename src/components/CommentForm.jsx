import React, { useState, useEffect } from 'react';
import { usePost } from '../pages/post/hooks/usePost';

const CommentForm = ({ postId, level = 0, parentId = null, parentAuthor = null, onCommentSubmit, onCancelReply, isReplyMode }) => {
  const [content, setContent] = useState('');
  const { createComment } = usePost();

  useEffect(() => {
    setContent(''); // 답글 모드 전환 시 입력창 초기화
  }, [postId, level, parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const response = await createComment({
        content,
        postId,
        level,
        parentId
      });
      setContent('');
      if (onCommentSubmit && response) {
        onCommentSubmit();
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const isReply = isReplyMode && parentId;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white rounded-xl shadow-sm p-4 font-noto"
    >
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-point text-[15px] placeholder:text-gray-400 resize-none transition-all"
          placeholder={isReply ? `${parentAuthor ? parentAuthor + '님에게 ' : ''}답글을 입력하세요...` : '댓글을 입력하세요...'}
          rows={2}
        />
      </div>
      <div className="flex justify-end mt-2 gap-2">
        {isReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="px-4 py-2 rounded-lg text-[15px] font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim()}
          className={`px-5 py-2 rounded-lg text-[15px] font-medium transition-colors duration-150 shadow-sm
            ${content.trim() ? 'bg-point text-white hover:bg-point/90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {isReply ? '답글 작성' : '댓글 작성'}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 