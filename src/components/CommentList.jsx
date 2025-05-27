import React, { useState } from 'react';
import CommentForm from './CommentForm';

const CommentList = ({ comments = [], onReplyClick, replyMode, renderReplyForm }) => {
  // 답글 입력창이 열려있는 댓글의 ID
  const [replyTo, setReplyTo] = useState(null);

  // 댓글을 level=0, 답글을 level=1로 구분
  const topLevelComments = comments.filter(c => c.level === 0);
  const replies = comments.filter(c => c.level === 1);

  // 특정 댓글의 답글만 반환
  const getReplies = (parentId) => replies.filter(r => r.parentId === parentId);

  // 답글 작성 후 콜백
  const handleReplySubmit = (parentComment) => async (replyData) => {
    if (onReplySubmit) {
      await onReplySubmit(replyData);
    }
    setReplyTo(null); // 답글 작성 후 입력창 닫기
  };

  // 시간 포맷팅 함수
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4 mt-6">
      {topLevelComments.map((comment) => {
        const isMyComment = comment.authorId === comment.loginUserId;
        const childReplies = replies.filter(r => r.parentId === comment.commentId);
        return (
          <div key={comment.commentId}>
            <div
              className={`p-4 rounded-lg bg-white`}
            >
              <div className="flex items-start gap-3">
                {/* 프로필 이미지 */}
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {comment.authorProfileImageUrl ? (
                    <img
                      src={comment.authorProfileImageUrl}
                      alt={`${comment.author}의 프로필`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-point/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-point">
                        {comment.author[0]}
                      </span>
                    </div>
                  )}
                </div>
                {/* 댓글 내용 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[14px] text-gray-800">
                      {comment.author}
                      {isMyComment && (
                        <span className="ml-1 text-[12px] font-normal text-gray-500">
                          (나)
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] text-gray-500">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-600 break-words">
                    {comment.content}
                  </p>
                  <button
                    type="button"
                    className="text-point text-xs mt-1 ml-1 hover:underline focus:outline-none"
                    onClick={() => onReplyClick && onReplyClick(comment.commentId, comment.author)}
                    disabled={replyMode && replyMode.parentId === comment.commentId}
                  >
                    답글 달기
                  </button>
                  {/* 답글 입력창 렌더링 */}
                  {renderReplyForm && renderReplyForm(comment.commentId, comment.author)}
                </div>
              </div>
            </div>
            {/* 답글 목록 */}
            {childReplies.length > 0 && (
              <div className="space-y-2 mt-2 ml-8">
                {childReplies.map((reply) => {
                  const isMyReply = reply.authorId === reply.loginUserId;
                  return (
                    <div
                      key={reply.commentId}
                      className="p-4 rounded-lg bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {reply.authorProfileImageUrl ? (
                            <img
                              src={reply.authorProfileImageUrl}
                              alt={`${reply.author}의 프로필`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-point/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-point">
                                {reply.author[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[14px] text-gray-800">
                              {reply.author}
                              {isMyReply && (
                                <span className="ml-1 text-[12px] font-normal text-gray-500">
                                  (나)
                                </span>
                              )}
                            </span>
                            <span className="text-[12px] text-gray-500">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-[14px] text-gray-600 break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CommentList; 