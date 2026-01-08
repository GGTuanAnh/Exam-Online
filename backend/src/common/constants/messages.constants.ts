// backend/src/common/constants/messages.constants.ts

export const ERROR_MESSAGES = {
  // Auth errors
  EMAIL_ALREADY_EXISTS: 'Email nay da duoc su dung',
  INVALID_CREDENTIALS: 'Email hoac mat khau khong dung',
  USER_NOT_FOUND: 'Nguoi dung khong ton tai',
  TOKEN_INVALID: 'Token khong hop le hoac da het han',
  TOKEN_EXPIRED: 'Token da het han',
  UNAUTHORIZED: 'Ban khong co quyen truy cap',
  FORBIDDEN: 'Truy cap bi tu choi',
  
  // Exam errors
  EXAM_NOT_FOUND: 'Không tìm thấy đề thi',
  EXAM_NOT_OPEN: 'Đề thi chưa mở',
  EXAM_CLOSED: 'Đề thi đã đóng',
  EXAM_HAS_SESSIONS: 'Không thể xóa đề thi đã có người thi',
  MAX_RETAKE_REACHED: 'Bạn đã hết số lần thi',
  
  // Course errors
  COURSE_NOT_FOUND: 'Khong tim thay mon hoc',
  COURSE_CODE_EXISTS: 'Ma mon hoc nay da ton tai',
  COURSE_HAS_DATA: 'Khong the xoa mon hoc da co du lieu',
  
  // Question errors
  QUESTION_NOT_FOUND: 'Khong tim thay cau hoi',
  QUESTION_BANK_NOT_FOUND: 'Khong tim thay ngan hang cau hoi',
  INVALID_QUESTION_TYPE: 'Loai cau hoi khong hop le',
  MISSING_OPTIONS: 'Cau hoi phai co it nhat 2 dap an',
  MISSING_CORRECT_ANSWER: 'Phai co it nhat 1 dap an dung',
  
  // Session errors
  SESSION_NOT_FOUND: 'Khong tim thay phien thi',
  SESSION_ALREADY_SUBMITTED: 'Bai thi da duoc nop',
  SESSION_EXPIRED: 'Phien thi da het han',
  SESSION_NOT_YOURS: 'Ban khong co quyen xem phien thi nay',
  
  // Result errors
  RESULT_NOT_FOUND: 'Khong tim thay ket qua thi',
  RESULT_DETAIL_NOT_FOUND: 'Khong tim thay chi tiet ket qua',
  INVALID_SCORE: 'Diem khong hop le',
  SCORE_EXCEEDS_MAX: 'Diem vuot qua diem toi da',
  
  // Notification errors
  NOTIFICATION_NOT_FOUND: 'Khong tim thay thong bao',
  NOTIFICATION_NOT_YOURS: 'Ban khong co quyen truy cap thong bao nay',
  
  // Validation errors
  INVALID_EMAIL: 'Dia chi email khong hop le',
  INVALID_PASSWORD: 'Mat khau phai co it nhat 8 ky tu, bao gom chu hoa, chu thuong va so',
  INVALID_DATE_RANGE: 'Thoi gian bat dau phai nho hon thoi gian ket thuc',
  DUPLICATE_QUESTIONS: 'Khong duoc co cau hoi trung lap trong de thi',
  NO_CORRECT_ANSWER: 'Phai co it nhat 1 dap an dung',
  INVALID_TRUE_FALSE_ANSWERS: 'Cau hoi Dung/Sai phai co dung 2 dap an',
  
  // Part errors
  PART_NOT_FOUND: 'Khong tim thay phan thi',
  QUESTION_BANK_NOT_BELONG_COURSE: 'Ngan hang cau hoi khong thuoc mon hoc nay',
  INVALID_TIME_RANGE: 'Thoi gian mo phai truoc thoi gian dong',
  INVALID_UUID: 'ID khong hop le',
  INVALID_DATE: 'Ngay thang khong hop le',
  
  // Generic errors
  INTERNAL_SERVER_ERROR: 'Loi he thong, vui long thu lai sau',
  BAD_REQUEST: 'Yeu cau khong hop le',
  NOT_FOUND: 'Khong tim thay du lieu',
};

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Dang ky thanh cong! Vui long kiem tra email de xac thuc tai khoan',
  LOGIN_SUCCESS: 'Dang nhap thanh cong',
  LOGOUT_SUCCESS: 'Dang xuat thanh cong',
  EMAIL_VERIFIED: 'Xac thuc email thanh cong',
  PASSWORD_RESET_EMAIL_SENT: 'Email dat lai mat khau da duoc gui',
  PASSWORD_CHANGED: 'Doi mat khau thanh cong',
  
  // CRUD
  CREATED: 'Tao moi thanh cong',
  UPDATED: 'Cap nhat thanh cong',
  DELETED: 'Xoa thanh cong',
  
  // Exam
  EXAM_STARTED: 'Bat dau lam bai thanh cong',
  EXAM_SUBMITTED: 'Nop bai thanh cong',
  ANSWERS_SAVED: 'Luu dap an thanh cong',
  
  // Grading
  ESSAY_GRADED: 'Da cham diem cau tu luan',
  
  // Notification
  NOTIFICATION_SENT: 'Gui thong bao thanh cong',
  NOTIFICATION_MARKED_READ: 'Danh dau da doc thanh cong',
  NOTIFICATION_DELETED: 'Xoa thong bao thanh cong',
};
