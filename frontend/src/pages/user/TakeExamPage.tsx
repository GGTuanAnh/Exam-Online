import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import { showToast } from '../../lib/toast';
import { examService } from '../../services/exam.service';
import type { ExamSession } from '../../types/exam';
import ConfirmModal from '../../components/ConfirmModal';
import { AUTO_SAVE_INTERVAL_MS } from '../../constants/app.constants';

// Constants for localStorage backup
const TIMER_SYNC_INTERVAL_MS = 60000; // Sync with server every 60 seconds
const getLocalStorageKey = (sessionId: string) => `exam_answers_${sessionId}`;

const TakeExamPage = () => {
  const { examId, sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-cheat states
  const [leaveScreenCount, setLeaveScreenCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  useEffect(() => {
    if (sessionId) {
      resumeExamSession();
    } else if (examId) {
      startExamSession();
    }
  }, [examId, sessionId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save answers every 30 seconds (to server and localStorage)
  useEffect(() => {
    if (!session?.id || Object.keys(answers).length === 0) return;

    // Immediate backup to localStorage
    const storageKey = getLocalStorageKey(session.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch (e) {
      console.warn('LocalStorage backup failed:', e);
    }

    const autoSaveInterval = setInterval(async () => {
      try {
        // Backup to localStorage first (instant)
        localStorage.setItem(storageKey, JSON.stringify(answers));
        // Then save to server
        await examService.saveAnswer(session.id, answers);
        console.log('Auto-saved answers to server and localStorage');
      } catch (error) {
        console.error('Auto-save to server failed, localStorage backup exists:', error);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(autoSaveInterval);
  }, [session?.id, answers]);

  // Timer sync with server (every 60 seconds)
  useEffect(() => {
    if (!session?.id || timeRemaining <= 0) return;

    const syncTimer = setInterval(async () => {
      try {
        const serverTime = await examService.getSessionTime(session.id);
        if (serverTime.status !== 'IN_PROGRESS') {
          // Session ended on server, auto-submit
          showToast.error('Phiên thi đã kết thúc');
          handleSubmit();
          return;
        }
        // Sync with server time (use server as source of truth)
        setTimeRemaining(serverTime.remainingSeconds);
        console.log('Timer synced with server:', serverTime.remainingSeconds, 'seconds');
      } catch (error) {
        console.warn('Timer sync failed, continuing with local timer:', error);
      }
    }, TIMER_SYNC_INTERVAL_MS);

    return () => clearInterval(syncTimer);
  }, [session?.id, timeRemaining > 0]);

  // Anti-cheat: Detect tab/window switch
  useEffect(() => {
    if (!session?.exam.enableAntiCheat) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLeaveScreenCount(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.exam.enableAntiCheat]);

  // Anti-cheat: Prevent copy/paste and right-click
  useEffect(() => {
    if (!session?.exam.enableAntiCheat) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast.error('Không được phép sao chép nội dung trong khi thi');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast.error('Không được phép dán nội dung trong khi thi');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast.error('Chuột phải đã bị vô hiệu hóa');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [session?.exam.enableAntiCheat]);

  // Anti-cheat: Fullscreen mode (optional but recommended)
  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  }, []);

  useEffect(() => {
    if (!session?.exam.enableAntiCheat) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement && session?.exam.enableAntiCheat) {
        showToast.error('⚠️ Vui lòng quay lại chế độ toàn màn hình!');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Auto enter fullscreen when anti-cheat is enabled
    if (session?.exam.enableAntiCheat && !loading) {
      enterFullscreen();
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      exitFullscreen();
    };
  }, [session?.exam.enableAntiCheat, loading, enterFullscreen, exitFullscreen]);

  const startExamSession = async () => {
    try {
      if (!examId) return;
      const data = await examService.startExam(examId);
      setSession(data);

      // Try to restore answers from localStorage (in case of page refresh)
      const storageKey = getLocalStorageKey(data.id);
      try {
        const savedAnswers = localStorage.getItem(storageKey);
        if (savedAnswers) {
          const parsed = JSON.parse(savedAnswers);
          // Merge: server data takes priority, localStorage as fallback
          const merged = { ...parsed, ...(data.currentAnswers || {}) };
          setAnswers(merged);
          console.log('Restored answers from localStorage');
        }
      } catch (e) {
        console.warn('Failed to restore from localStorage:', e);
      }

      // Use dynamic remaining time (minutes -> seconds)
      const remainingMinutes = data.remainingTime ?? data.exam.duration;
      setTimeRemaining(Math.floor(remainingMinutes * 60));
      setLoading(false);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Không thể bắt đầu bài thi');
      navigate('/');
    }
  };

  const resumeExamSession = async () => {
    try {
      if (!sessionId) return;
      const data = await examService.resumeSession(sessionId);
      setSession(data);

      // Merge server answers with localStorage backup
      const storageKey = getLocalStorageKey(data.id);
      let mergedAnswers = {};

      try {
        const savedAnswers = localStorage.getItem(storageKey);
        if (savedAnswers) {
          mergedAnswers = JSON.parse(savedAnswers);
          console.log('Found localStorage backup');
        }
      } catch (e) {
        console.warn('Failed to parse localStorage:', e);
      }

      // Server data takes priority over localStorage
      if (data.currentAnswers) {
        mergedAnswers = { ...mergedAnswers, ...(data.currentAnswers as any) };
      }

      setAnswers(mergedAnswers);

      // Use dynamic remaining time
      const remainingMinutes = data.remainingTime ?? data.exam.duration;
      setTimeRemaining(Math.floor(remainingMinutes * 60));
      setLoading(false);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Không thể tiếp tục bài thi');
      navigate('/');
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      let newAnswers;
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          newAnswers = {
            ...prev,
            [questionId]: current.filter((i) => i !== optionId),
          };
        } else {
          newAnswers = {
            ...prev,
            [questionId]: [...current, optionId],
          };
        }
      } else {
        newAnswers = {
          ...prev,
          [questionId]: [optionId],
        };
      }

      // Auto save answer (optional debouncing could be added)
      // For now we just update local state
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || !session) return;

    const unanswered = session.questions.filter(
      (q) => !answers[q.question.id] || answers[q.question.id].length === 0
    ).length;

    if (unanswered > 0 && timeRemaining > 0) {
      // Show soft warning toast, then confirm modal
      showToast.error(`Bạn còn ${unanswered} câu chưa hoàn thành`);
      setUnansweredCount(unanswered);
      setShowSubmitConfirm(true);
      return;
    }

    // If all answered or time's up, submit directly
    await submitExam();
  };

  const submitExam = async () => {

    setShowSubmitConfirm(false);
    setIsSubmitting(true);
    try {
      const response = await examService.submitExam(session!.id, answers, leaveScreenCount);

      // Exit fullscreen before navigate
      if (isFullscreen) {
        exitFullscreen();
      }

      showToast.success('Nộp bài thành công!');

      // Navigate to ExamCompletePage with result data
      navigate('/exam-complete', {
        state: {
          result: response.result,
          summary: response.summary,
          examInfo: {
            title: session!.exam.title,
            duration: session!.exam.duration,
            courseName: (session as any)?.exam?.course?.name || 'N/A',
            courseCode: (session as any)?.exam?.course?.code || '',
          },
          sessionInfo: {
            startTime: session!.startTime || new Date().toISOString(),
            endTime: new Date().toISOString(),
            shiftName: (session as any)?.examShift?.name || null,
          }
        }
      });
    } catch (error) {
      showToast.error('Không thể nộp bài');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang chuẩn bị bài thi...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex].question;
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        title="Xác nhận nộp bài"
        message={`Bạn còn ${unansweredCount} câu chưa hoàn thành. Bạn có chắc chắn muốn nộp bài không?`}
        confirmText="Nộp bài"
        cancelText="Tiếp tục làm"
        onConfirm={submitExam}
        onCancel={() => setShowSubmitConfirm(false)}
        type="warning"
      />

      {/* Anti-cheat Warning Popup */}
      {showWarning && session?.exam.enableAntiCheat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Cảnh báo vi phạm!</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Hệ thống phát hiện bạn đã rời khỏi cửa sổ thi. Hành vi này sẽ được ghi nhận.
            </p>
            <p className="text-sm text-gray-600">
              Số lần vi phạm: <span className="font-bold text-red-600">{leaveScreenCount}</span>
            </p>
          </div>
        </div>
      )}

      {/* Anti-cheat Info Bar */}
      {session?.exam.enableAntiCheat && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-5xl mx-auto px-6 py-2">
            <div className="flex items-center gap-2 text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Chế độ chống gian lận đang bật</span>
              {leaveScreenCount > 0 && (
                <span className="ml-auto font-semibold text-red-600">
                  Vi phạm: {leaveScreenCount} lần
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header with timer */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{session.exam.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex gap-1 items-center text-xs text-gray-500">
                  <span className="font-medium text-indigo-600">Câu {currentQuestionIndex + 1}</span>
                  <span>/ {session.questions.length}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">
                  Đã trả lời: <span className="font-medium text-emerald-600">{Object.keys(answers).filter(k => answers[k]?.length > 0).length}</span>/{session.questions.length}
                </span>
              </div>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-all
              ${timeRemaining < 120
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                : timeRemaining < 300
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              }`}>
              <Clock className={`w-5 h-5 ${timeRemaining < 120 ? 'animate-pulse' : ''}`} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300
                  ${timeRemaining < 120 ? 'bg-red-500'
                    : timeRemaining < 300 ? 'bg-orange-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                {currentQuestionIndex + 1}
              </span>
              <div className="flex-1">
                <p className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.content}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {currentQuestion.type === 'MULTIPLE_CHOICE'
                    ? '(Chọn nhiều đáp án)'
                    : '(Chọn một đáp án)'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = answers[currentQuestion.id]?.includes(option.id) || false;
              const isMultiple = currentQuestion.type === 'MULTIPLE_CHOICE';

              return (
                <label
                  key={option.id}
                  className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.id, isMultiple)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 mr-2">{optionLetter}.</span>
                    <span className="text-gray-700">{option.content}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Câu trước</span>
          </button>

          <div className="flex space-x-3">
            {currentQuestionIndex === session.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Flag className="w-5 h-5" />
                <span>{isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(session.questions.length - 1, prev + 1))}
                className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <span>Câu tiếp</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-10 gap-2">
            {session.questions.map((q, idx) => {
              const isAnswered = answers[q.question.id] && answers[q.question.id].length > 0;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isAnswered
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-100"></div>
              <span className="text-gray-600">Đã trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-gray-100"></div>
              <span className="text-gray-600">Chưa trả lời</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-indigo-600"></div>
              <span className="text-gray-600">Câu hiện tại</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExamPage;
