// backend/src/common/constants/messages.constants.ts

export const ERROR_MESSAGES = {
  // Auth errors - Lỗi xác thực
  EMAIL_ALREADY_EXISTS: 'Email này đã được sử dụng',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  TOKEN_INVALID: 'Token không hợp lệ hoặc đã hết hạn',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Truy cập bị từ chối',

  // Exam errors - Lỗi đề thi
  EXAM_NOT_FOUND: 'Không tìm thấy đề thi',
  EXAM_NOT_OPEN: 'Đề thi chưa mở',
  EXAM_CLOSED: 'Đề thi đã đóng',
  EXAM_HAS_SESSIONS: 'Không thể xóa đề thi đã có người thi',
  MAX_RETAKE_REACHED: 'Bạn đã hết số lần thi',

  // Course errors - Lỗi môn học
  COURSE_NOT_FOUND: 'Không tìm thấy môn học',
  COURSE_CODE_EXISTS: 'Mã môn học này đã tồn tại',
  COURSE_HAS_DATA: 'Không thể xóa môn học đã có dữ liệu',

  // Question errors - Lỗi câu hỏi
  QUESTION_NOT_FOUND: 'Không tìm thấy câu hỏi',
  QUESTION_BANK_NOT_FOUND: 'Không tìm thấy ngân hàng câu hỏi',
  INVALID_QUESTION_TYPE: 'Loại câu hỏi không hợp lệ',
  MISSING_OPTIONS: 'Câu hỏi phải có ít nhất 2 đáp án',
  MISSING_CORRECT_ANSWER: 'Phải có ít nhất 1 đáp án đúng',

  // Session errors - Lỗi phiên thi
  SESSION_NOT_FOUND: 'Không tìm thấy phiên thi',
  SESSION_ALREADY_SUBMITTED: 'Bài thi đã được nộp',
  SESSION_EXPIRED: 'Phiên thi đã hết hạn',
  SESSION_NOT_YOURS: 'Bạn không có quyền xem phiên thi này',

  // Result errors - Lỗi kết quả
  RESULT_NOT_FOUND: 'Không tìm thấy kết quả thi',
  RESULT_DETAIL_NOT_FOUND: 'Không tìm thấy chi tiết kết quả',
  INVALID_SCORE: 'Điểm không hợp lệ',
  SCORE_EXCEEDS_MAX: 'Điểm vượt quá điểm tối đa',

  // Notification errors - Lỗi thông báo
  NOTIFICATION_NOT_FOUND: 'Không tìm thấy thông báo',
  NOTIFICATION_NOT_YOURS: 'Bạn không có quyền truy cập thông báo này',

  // Validation errors - Lỗi xác thực dữ liệu
  INVALID_EMAIL: 'Địa chỉ email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số',
  INVALID_DATE_RANGE: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
  DUPLICATE_QUESTIONS: 'Không được có câu hỏi trùng lặp trong đề thi',
  NO_CORRECT_ANSWER: 'Phải có ít nhất 1 đáp án đúng',
  INVALID_TRUE_FALSE_ANSWERS: 'Câu hỏi Đúng/Sai phải có đúng 2 đáp án',

  // Part errors - Lỗi phần thi
  PART_NOT_FOUND: 'Không tìm thấy phần thi',
  QUESTION_BANK_NOT_BELONG_COURSE: 'Ngân hàng câu hỏi không thuộc môn học này',
  INVALID_TIME_RANGE: 'Thời gian mở phải trước thời gian đóng',
  INVALID_UUID: 'ID không hợp lệ',
  INVALID_DATE: 'Ngày tháng không hợp lệ',

  // Generic errors - Lỗi chung
  INTERNAL_SERVER_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
};

export const SUCCESS_MESSAGES = {
  // Auth - Xác thực
  REGISTER_SUCCESS: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  EMAIL_VERIFIED: 'Xác thực email thành công',
  PASSWORD_RESET_EMAIL_SENT: 'Email đặt lại mật khẩu đã được gửi',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',

  // CRUD - Thao tác dữ liệu
  CREATED: 'Tạo mới thành công',
  UPDATED: 'Cập nhật thành công',
  DELETED: 'Xóa thành công',

  // Exam - Bài thi
  EXAM_STARTED: 'Bắt đầu làm bài thành công',
  EXAM_SUBMITTED: 'Nộp bài thành công',
  ANSWERS_SAVED: 'Lưu đáp án thành công',

  // Grading - Chấm điểm
  ESSAY_GRADED: 'Đã chấm điểm câu tự luận',

  // Notification - Thông báo
  NOTIFICATION_SENT: 'Gửi thông báo thành công',
  NOTIFICATION_MARKED_READ: 'Đánh dấu đã đọc thành công',
  NOTIFICATION_DELETED: 'Xóa thông báo thành công',
};
