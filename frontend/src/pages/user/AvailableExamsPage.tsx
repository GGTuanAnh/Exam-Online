import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Play } from 'lucide-react';
import { showToast } from '../../lib/toast';
import { examService } from '../../services/exam.service';
import type { Exam } from '../../types/exam';

const AvailableExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await examService.getAvailableExams();
      setExams(data);
      setLoading(false);
    } catch (error) {
      showToast.error('Không thể tải danh sách bài thi');
      setLoading(false);
    }
  };

  const handleStartExam = (examId: string) => {
    navigate(`/take-exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài thi khả dụng</h1>
          <p className="text-gray-600 mt-1">Chọn bài thi để bắt đầu làm bài</p>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có bài thi nào
          </h3>
          <p className="text-gray-500">
            Hiện tại chưa có bài thi nào được mở. Vui lòng quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-indigo-600 font-medium">
                    {exam.course.name}
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {exam.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Thời gian: {exam.duration} phút</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Số câu hỏi: {exam.questions?.length || 0}</span>
                </div>
                {exam.openTime && exam.closeTime && (
                  <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                    <div>Mở: {new Date(exam.openTime).toLocaleString('vi-VN')}</div>
                    <div>Đóng: {new Date(exam.closeTime).toLocaleString('vi-VN')}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStartExam(exam.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Bắt đầu làm bài</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExamsPage;
