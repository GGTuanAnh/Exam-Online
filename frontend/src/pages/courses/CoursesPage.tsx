import React, { useEffect, useState } from 'react';
import { courseService } from '../../services/course.service';
import { authService } from '../../services/auth.service';
import type { Course, CreateCourseDto } from '../../types/course';
import { Plus, Search, Edit2, Trash2, BookOpen, X, Save, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCourseDto>({
    code: '',
    name: '',
    credits: 0,
    description: ''
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAll();
      setCourses(data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách môn học. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', credits: 0, description: '' });
    setEditingId(null);
    setModalMode('create');
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true); // Open modal
  };

  const handleOpenEdit = (course: Course) => {
    setFormData({
      code: course.code,
      name: course.name,
      credits: course.credits || 0,
      description: course.description || ''
    });
    setEditingId(course.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        const newCourse = await courseService.create(formData);
        setCourses([newCourse, ...courses]);
        setSuccess('Thêm môn học thành công!');
      } else if (modalMode === 'edit' && editingId) {
        const updatedCourse = await courseService.update(editingId, formData);
        setCourses(courses.map(c => c.id === editingId ? updatedCourse : c));
        setSuccess('Cập nhật môn học thành công!');
      }
      handleCloseModal();
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn học "${name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await courseService.delete(id);
      setCourses(courses.filter(c => c.id !== id));
      setSuccess('Đã xóa môn học');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa môn học này (có thể do đã có dữ liệu liên quan).');
    }
  };

  if (loading && courses.length === 0) {
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
            <BookOpen className="w-8 h-8 text-blue-600" />
            Quản lý Học phần
          </h1>
          <p className="text-gray-500 mt-1">Quản lý danh sách các môn học và học phần trong hệ thống.</p>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={loadCourses}
             className="flex items-center justify-center p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
             title="Tải lại"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          {isAdmin && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm Học phần
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

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm môn học (Mã, Tên)..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã HP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên Học phần</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Tín chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{course.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {course.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {course.description || <span className="text-gray-300 italic">Không có mô tả</span>}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.name)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400 gap-2">
                       <BookOpen className="w-12 h-12 text-gray-300" />
                       <span className="text-lg">Chưa có môn học nào</span>
                       {isAdmin && <span className="text-sm">Nhấn "Thêm Học phần" để bắt đầu</span>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background backdrop */}
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={handleCloseModal}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                    {modalMode === 'create' ? 'Thêm Học phần mới' : 'Cập nhật Học phần'}
                  </h3>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500 transition-colors">
                     <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Học phần <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="VD: INT3306"
                      />
                      <p className="text-xs text-gray-500 mt-1">Mã học phần là duy nhất.</p>
                   </div>
                   
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Học phần <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="VD: Phát triển ứng dụng Web"
                      />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số Tín chỉ</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.credits}
                        onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                      <textarea
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Mô tả ngắn về học phần..."
                      ></textarea>
                   </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-lg shadow-sm px-4 py-2.5 bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu lại
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
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

export default CoursesPage;
