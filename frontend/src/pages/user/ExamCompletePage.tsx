import { useLocation, useNavigate } from 'react-router-dom';
import {
    Award, User, IdCard, Clock, BookOpen,
    Calendar, FileText, Home
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useEffect } from 'react';

interface ExamCompleteState {
    result: {
        id: string;
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        status: string;
        submittedAt?: string;
        leaveScreenCount?: number;
    };
    summary: {
        totalScore: number;
        maxScore: number;
        correctAnswers: number;
        totalQuestions: number;
    };
    examInfo: {
        title: string;
        duration: number;
        courseName?: string;
        courseCode?: string;
    };
    sessionInfo: {
        startTime: string;
        endTime: string;
        shiftName?: string;
    };
}

const ExamCompletePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    const state = location.state as ExamCompleteState;

    useEffect(() => {
        // If no state data, redirect to home
        if (!state) {
            navigate('/');
        }
    }, [state, navigate]);

    if (!state) {
        return null;
    }

    const { result, summary, examInfo, sessionInfo } = state;

    // Calculate time taken
    const startTime = new Date(sessionInfo.startTime);
    const endTime = new Date(sessionInfo.endTime);
    const timeTakenMs = endTime.getTime() - startTime.getTime();
    const timeTakenMinutes = Math.floor(timeTakenMs / 1000 / 60);
    const timeTakenSeconds = Math.floor((timeTakenMs / 1000) % 60);

    // Calculate score on 10-point scale
    const scoreOn10 = summary.maxScore > 0
        ? ((summary.totalScore / summary.maxScore) * 10).toFixed(2)
        : '0.00';



    // Extract student code from email (before @)
    const studentCode = currentUser?.email?.split('@')[0] || 'N/A';

    // Format date/time
    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Chúc mừng! Bạn đã hoàn thành bài thi
                    </h1>
                    <p className="text-lg font-medium text-indigo-600">
                        Kết quả của bạn đã được ghi nhận
                    </p>
                </div>

                {/* Main Result Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
                    {/* Score Section */}
                    <div className="p-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600">
                        <p className="text-white/80 text-sm uppercase tracking-wider mb-2">Điểm số của bạn</p>
                        <div className="text-6xl font-bold text-white mb-2">
                            {scoreOn10}
                            <span className="text-2xl font-normal text-white/70">/10</span>
                        </div>
                        <p className="text-white/90">
                            {summary.correctAnswers}/{summary.totalQuestions} câu đúng
                        </p>
                    </div>

                    {/* Student Information */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Thông tin sinh viên
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Họ và tên</p>
                                    <p className="font-semibold text-gray-800">
                                        {currentUser?.firstName && currentUser?.lastName
                                            ? `${currentUser.lastName} ${currentUser.firstName}`
                                            : currentUser?.name || currentUser?.email?.split('@')[0] || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <IdCard className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Mã số sinh viên</p>
                                    <p className="font-semibold text-gray-800 font-mono">{studentCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exam Information */}
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Thông tin bài thi
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Môn thi</p>
                                    <p className="font-semibold text-gray-800">
                                        {examInfo.courseName || 'N/A'}
                                        {examInfo.courseCode && (
                                            <span className="text-sm text-gray-500 ml-2">({examInfo.courseCode})</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Tên đề thi</p>
                                    <p className="font-semibold text-gray-800">{examInfo.title}</p>
                                </div>
                            </div>
                            {sessionInfo.shiftName && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Ca thi</p>
                                        <p className="font-semibold text-gray-800">{sessionInfo.shiftName}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Giờ bắt đầu</p>
                                    <p className="font-semibold text-gray-800">{formatDateTime(sessionInfo.startTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Result Details */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Chi tiết kết quả
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                                <p className="text-2xl font-bold text-indigo-600">{summary.correctAnswers}</p>
                                <p className="text-xs text-gray-500 mt-1">Số câu đúng</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">{summary.totalQuestions}</p>
                                <p className="text-xs text-gray-500 mt-1">Tổng câu hỏi</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                                <p className="text-2xl font-bold text-amber-600">
                                    {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Thời gian làm bài</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                                <p className="text-2xl font-bold text-teal-600">{examInfo.duration} phút</p>
                                <p className="text-xs text-gray-500 mt-1">Thời gian cho phép</p>
                            </div>
                        </div>

                        {/* Raw Score Info */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Điểm thô:</span>
                                <span className="font-semibold text-gray-800">
                                    {summary.totalScore.toFixed(2)} / {summary.maxScore} điểm
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        <Home className="w-5 h-5" />
                        Về trang chủ
                    </button>
                </div>

                {/* Anti-cheat info if any */}
                {result.leaveScreenCount && result.leaveScreenCount > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Lưu ý: Hệ thống ghi nhận bạn đã rời khỏi cửa sổ thi <strong>{result.leaveScreenCount}</strong> lần trong quá trình làm bài.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamCompletePage;
