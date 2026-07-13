export const REPORT_TARGETS = {
  STORY: 'STORY',
  CHAPTER: 'CHAPTER',
  COMMENT: 'COMMENT',
};

export const REPORT_REASONS_BY_TARGET = {
  [REPORT_TARGETS.STORY]: {
    COPYRIGHT_VIOLATION: 'Vi phạm bản quyền hoặc đăng lại trái phép',
    MISLEADING_INFORMATION: 'Thông tin truyện sai lệch hoặc gây hiểu nhầm',
    INAPPROPRIATE_CONTENT: 'Nội dung phản cảm, vi phạm chính sách',
    IMPERSONATION: 'Mạo danh tác giả hoặc tác phẩm khác',
    OTHER: 'Lý do khác',
  },
  [REPORT_TARGETS.CHAPTER]: {
    BROKEN_IMAGE: 'Ảnh chương bị lỗi hoặc không hiển thị',
    INCORRECT_CONTENT: 'Nội dung sai chương, thiếu hoặc trùng lặp',
    INAPPROPRIATE_CONTENT: 'Nội dung phản cảm, vi phạm chính sách',
    COPYRIGHT_VIOLATION: 'Vi phạm bản quyền',
    OTHER: 'Lý do khác',
  },
  [REPORT_TARGETS.COMMENT]: {
    COMMENT_SPAM: 'Spam, quảng cáo hoặc nội dung lặp lại',
    COMMENT_HARASSMENT: 'Quấy rối, xúc phạm hoặc công kích cá nhân',
    COMMENT_HATE_SPEECH: 'Ngôn từ thù ghét hoặc phân biệt đối xử',
    COMMENT_PERSONAL_INFO: 'Tiết lộ thông tin cá nhân',
    COMMENT_INAPPROPRIATE: 'Nội dung phản cảm hoặc không phù hợp',
    OTHER: 'Lý do khác',
  },
};

export const REPORT_REASON_LABELS = Object.values(REPORT_REASONS_BY_TARGET)
  .reduce((labels, reasons) => ({ ...labels, ...reasons }), {});

export const REPORT_TARGET_LABELS = {
  [REPORT_TARGETS.STORY]: 'truyện',
  [REPORT_TARGETS.CHAPTER]: 'chương',
  [REPORT_TARGETS.COMMENT]: 'bình luận',
};

export const REPORT_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
};

export const REPORT_STATUS_LABELS = {
  NEW: 'Mới',
  IN_PROGRESS: 'Đang xem xét',
  RESOLVED: 'Đã xử lý',
  DISMISSED: 'Đã bác bỏ',
};

export const REPORT_ACTION_LABELS = {
  START_REVIEW: 'Chuyển sang đang xem xét',
  RESOLVE_NO_ACTION: 'Hoàn tất, không gỡ nội dung',
  DISMISS: 'Bác bỏ báo cáo',
  REJECT_COMMENT: 'Ẩn bình luận vi phạm',
  FLAG_COMMENT_SPAM: 'Gắn cờ bình luận là spam',
  UNPUBLISH_CHAPTER: 'Ẩn chương khỏi hệ thống',
  HIDE_STORY: 'Ẩn truyện khỏi hệ thống',
};

export const getReportTargetType = ({ commentId, chapterId }) => {
  if (commentId) return REPORT_TARGETS.COMMENT;
  if (chapterId) return REPORT_TARGETS.CHAPTER;
  return REPORT_TARGETS.STORY;
};

export const getReportActions = (report) => {
  const actions = ['START_REVIEW', 'RESOLVE_NO_ACTION', 'DISMISS'];
  if (report.comment_id) actions.splice(1, 0, 'REJECT_COMMENT', 'FLAG_COMMENT_SPAM');
  else if (report.chapter_id) actions.splice(1, 0, 'UNPUBLISH_CHAPTER');
  else if (report.story_id) actions.splice(1, 0, 'HIDE_STORY');
  return actions;
};

export const REPORT_THRESHOLD = 10;
