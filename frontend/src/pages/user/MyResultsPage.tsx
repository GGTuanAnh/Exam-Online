import { useEffect, useState } from 'react';
import { Trophy, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { showToast } from '../../lib/toast';
import { examService } from '../../services/exam.service';
import type { ExamResult } from '../../types/exam';

const MyResultsPage = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await examService.getMyExamResults();
      setResults(data);
      setLoading(false);
    } catch (error) {
      showToast.error('Không thể tải kết quả thi');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
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
          <h1 className="text-3xl font-bold text-gray-900">Kết quả của tôi</h1>
          <p className="text-gray-600 mt-1">Xem lại các bài thi đã hoàn thành</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có kết quả nào
          </h3>
          <p className="text-gray-500">
            Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu làm bài!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kết quả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian hoàn thành
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.exam?.title || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {result.exam?.course?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {result.score.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Đạt: {result.exam?.passingScore || 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.isPassed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Không đạt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(result.completedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số bài thi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {results.length}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số bài đạt</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {results.filter(r => r.isPassed).length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%
                </p>
              </div>
              <Clock className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResultsPage;
