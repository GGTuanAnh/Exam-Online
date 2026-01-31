import React, { useEffect, useState } from 'react';
import { questionBankService } from '../../services/question-bank.service';
import { courseService } from '../../services/course.service';
import { authService } from '../../services/auth.service';
import type { QuestionBank, CreateQuestionBankDto } from '../../types/question-bank';
import type { Course } from '../../types/course';
import {
  Plus, Search, Edit2, Trash2, Database, X, Save,
  AlertCircle, CheckCircle, Filter, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuestionBanksPage: React.FC = () => {
  const navigate = useNavigate();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateQuestionBankDto>({
    name: '',
    description: '',
    courseId: ''
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Filtered question banks based on search keyword
  const filteredQuestionBanks = questionBanks.filter((bank) => {
    if (!searchKeyword.trim()) return true;
    const keyword = searchKeyword.toLowerCase().trim();
    return (
      bank.name.toLowerCase().includes(keyword) ||
      (bank.description?.toLowerCase().includes(keyword)) ||
      (bank.course?.code?.toLowerCase().includes(keyword)) ||
      (bank.course?.name?.toLowerCase().includes(keyword))
    );
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [banksData, coursesData] = await Promise.all([
        questionBankService.getAll(),
        courseService.getAll()
      ]);
      setQuestionBanks(banksData);
      setCourses(coursesData);
      setError('');
    } catch (err: any) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionBanks = async (courseId?: string) => {
    try {
      setLoading(true);
      const data = await questionBankService.getAll(courseId);
      setQuestionBanks(data);
    } catch {
      setError('Lỗi khi tải danh sách ngân hàng câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  // Filter change handler
  const handleCourseFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    loadQuestionBanks(courseId || undefined);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', courseId: '' });
    setEditingId(null);
    setModalMode('create');
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    if (selectedCourse) {
      setFormData(prev => ({ ...prev, courseId: selectedCourse }));
    } else if (courses.length > 0) {
      setFormData(prev => ({ ...prev, courseId: courses[0].id }));
    }
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (qb: QuestionBank) => {
    setFormData({
      name: qb.name,
      description: qb.description || '',
      courseId: qb.courseId
    });
    setEditingId(qb.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      setError("Vui lòng chọn môn học");
      return;
    }

    try {
      if (modalMode === 'create') {
        const newBank = await questionBankService.create(formData);

        // If filtering by specific course, only add if matches
        if (!selectedCourse || selectedCourse === newBank.courseId) {
          setQuestionBanks([newBank, ...questionBanks]);
        }
        setSuccess('Thêm ngân hàng câu hỏi thành công!');
      } else if (modalMode === 'edit' && editingId) {
        const updatedBank = await questionBankService.update(editingId, formData);
        setQuestionBanks(questionBanks.map(b => b.id === editingId ? updatedBank : b));
        setSuccess('Cập nhật thành công!');
      }
      setIsModalOpen(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ngân hàng "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await questionBankService.delete(id);
      setQuestionBanks(questionBanks.filter(b => b.id !== id));
      setSuccess('Đã xóa ngân hàng câu hỏi');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa (có thể do vẫn còn câu hỏi bên trong).');
    }
  };

  if (loading && questionBanks.length === 0 && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-600" />
            Ngân hàng câu hỏi
          </h1>
          <p className="text-gray-500 mt-1">Quản lý kho câu hỏi theo từng môn học/học phần.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Tạo Ngân hàng
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={selectedCourse}
          onChange={handleCourseFilterChange}
          className="flex-1 max-w-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">-- Tất cả môn học --</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên, môn học..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
        {filteredQuestionBanks.map((bank) => (
          <div key={bank.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2">
                  {bank.course?.code || 'Unknown'}
                </span>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenEdit(bank)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(bank.id, bank.name)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2" title={bank.name}>{bank.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{bank.description || 'Chưa có mô tả'}</p>

              <div className="flex items-center gap-2 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-50">
                <Database className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold">{bank.totalQuestions || 0}</span> câu hỏi
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {new Date(bank.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <button
                onClick={() => navigate(`/admin/questions?bankId=${bank.id}`)}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center gap-1"
              >
                <Eye className="w-4 h-4" /> Xem câu hỏi
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card (Empty State) */}
        {filteredQuestionBanks.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Database className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">
              {searchKeyword ? `Không tìm thấy kết quả cho "${searchKeyword}"` : 'Chưa có ngân hàng câu hỏi nào'}
            </p>
            {isAdmin && !searchKeyword && <p className="text-sm">Bấm "Tạo Ngân hàng" để bắt đầu</p>}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl leading-6 font-bold text-gray-900">
                    {modalMode === 'create' ? 'Tạo Ngân hàng câu hỏi' : 'Cập nhật Ngân hàng'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Môn học <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white max-h-48"
                      size={1}
                      disabled={modalMode === 'edit' || (!!selectedCourse && modalMode === 'create')}
                    >
                      <option value="">-- Chọn môn học --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Ngân hàng <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="VD: Chương 1 - Đại số tuyến tính"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Mô tả nội dung các câu hỏi trong ngân hàng này..."
                    ></textarea>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-lg shadow-sm px-4 py-2.5 bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBanksPage;

