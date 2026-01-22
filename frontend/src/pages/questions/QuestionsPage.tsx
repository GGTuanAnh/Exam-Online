import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { questionService } from '../../services/question.service';
import { questionBankService } from '../../services/question-bank.service';
import { authService } from '../../services/auth.service';
import { QuestionType, QuestionLevel } from '../../types/question';
import type { Question, CreateQuestionDto, QuestionOption } from '../../types/question';
import type { QuestionBank } from '../../types/question-bank';
import {
  Plus, Edit2, Trash2, CheckSquare,
  Circle, Type, HelpCircle, Save, X, AlertCircle, CheckCircle, ArrowLeft,
  Upload, Download, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { showToast } from '../../lib/toast';

const QuestionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bankIdParam = searchParams.get('bankId');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>(bankIdParam || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[]; total: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateQuestionDto>({
    content: '',
    type: QuestionType.SINGLE_CHOICE,
    level: QuestionLevel.MEDIUM,
    questionBankId: '',
    options: []
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadQuestions(selectedBankId);
    } else {
      setQuestions([]); // Clear questions if no bank selected
    }
  }, [selectedBankId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const banks = await questionBankService.getAll();
      setQuestionBanks(banks);

      // If banks exist but no bank selected, selecting first one by default isn't always good UX 
      // but if bankIdParam exists, we make sure it's valid
      if (bankIdParam && !banks.find(b => b.id === bankIdParam)) {
        setError('Ngân hàng câu hỏi không tồn tại hoặc đã bị xóa');
      }
    } catch (err) {
      setError('Lỗi tải danh sách ngân hàng câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (bankId: string) => {
    try {
      setLoading(true);
      const data = await questionService.getAll(bankId);
      setQuestions(data);
      setError('');
    } catch (err) {
      setError('Lỗi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    if (!selectedBankId) {
      setError('Vui lòng chọn ngân hàng câu hỏi trước khi thêm');
      return;
    }

    setFormData({
      content: '',
      type: QuestionType.SINGLE_CHOICE,
      level: QuestionLevel.MEDIUM,
      questionBankId: selectedBankId,
      options: [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setFormData({
      content: q.content,
      type: q.type,
      level: q.level,
      questionBankId: q.questionBankId,
      options: q.options.map(o => ({ content: o.content, isCorrect: o.isCorrect }))
    });
    setEditingId(q.id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: any) => {
    if (!formData.options) return;

    const newOptions = [...formData.options];

    if (field === 'isCorrect') {
      if (formData.type === QuestionType.SINGLE_CHOICE || formData.type === QuestionType.TRUE_FALSE) {
        // Uncheck others if single choice
        if (value === true) {
          newOptions.forEach((o, i) => o.isCorrect = i === index);
        }
      } else {
        // Multiple choice allows multiple true
        newOptions[index].isCorrect = value;
      }
    } else {
      // Update content
      (newOptions[index] as any)[field] = value;
    }

    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (!formData.options) return;
    setFormData({
      ...formData,
      options: [...formData.options, { content: '', isCorrect: false }]
    });
  };

  const removeOption = (index: number) => {
    if (!formData.options || formData.options.length <= 2) {
      showToast.error('Phải có ít nhất 2 đáp án');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleTypeChange = (type: QuestionType) => {
    let newOptions = formData.options || [];

    if (type === QuestionType.TRUE_FALSE) {
      newOptions = [
        { content: 'Đúng', isCorrect: true },
        { content: 'Sai', isCorrect: false }
      ];
    } else if (type === QuestionType.ESSAY) {
      newOptions = [];
    } else if (newOptions.length === 0) {
      // Default for choice types
      newOptions = [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ];
    }

    setFormData({ ...formData, type, options: newOptions });
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !selectedBankId) return;

    try {
      setIsImporting(true);
      const result = await questionService.importQuestions(selectedBankId, importFile);
      const resultWithTotal = { ...result, total: result.success + result.failed };
      setImportResult(resultWithTotal);
      if (result.success > 0) {
        setSuccess(`Đã import thành công ${result.success} câu hỏi.`);
        loadQuestions(selectedBankId);
      }
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Không thể xóa (có thể do vẫn còn câu hỏi bên trong).');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Content', 'Type', 'Level', 'Option1', 'Correct1', 'Option2', 'Correct2', 'Option3', 'Correct3', 'Option4', 'Correct4'];
    const sample = [
      ['Thủ đô của Việt Nam là gì?', 'SINGLE', 'EASY', 'Hà Nội', 'TRUE', 'Hồ Chí Minh', 'FALSE', 'Đà Nẵng', 'FALSE', 'Cần Thơ', 'FALSE'],
      ['Các số nguyên tố nhỏ hơn 10?', 'MULTIPLE', 'MEDIUM', '2', 'TRUE', '3', 'TRUE', '4', 'FALSE', '5', 'TRUE'],
      ['Trái đất hình vuông?', 'TRUE_FALSE', 'EASY', 'Đúng', 'FALSE', 'Sai', 'TRUE', '', '', '', ''],
      ['Mô tả quy trình X?', 'ESSAY', 'HARD', '', '', '', '', '', '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "Mau_Cau_Hoi.xlsx");
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate nội dung câu hỏi
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    // Validate các đáp án không được để trống
    if (formData.options && formData.options.length > 0) {
      const hasEmptyOption = formData.options.some(opt => !opt.content.trim());
      if (hasEmptyOption) {
        setError('Tất cả đáp án phải có nội dung, không được để trống');
        return;
      }

      // Validate phải có ít nhất 1 đáp án đúng
      const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        setError('Phải có ít nhất một đáp án đúng');
        return;
      }
    }

    try {
      if (modalMode === 'create') {
        const newQ = await questionService.create(formData);
        setQuestions([newQ, ...questions]);
        setSuccess('Thêm câu hỏi thành công');
      } else if (modalMode === 'edit' && editingId) {
        const updatedQ = await questionService.update(editingId, formData);
        setQuestions(questions.map(q => q.id === editingId ? updatedQ : q));
        setSuccess('Cập nhật thành công');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Có lỗi xảy ra'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await questionService.delete(id);
      setQuestions(questions.filter(q => q.id !== id));
      setSuccess('Đã xóa câu hỏi');
    } catch (err) {
      setError('Không thể xóa câu hỏi');
    }
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE: return 'Một đáp án';
      case QuestionType.MULTIPLE_CHOICE: return 'Nhiều đáp án';
      case QuestionType.TRUE_FALSE: return 'Đúng/Sai';
      case QuestionType.ESSAY: return 'Tự luận';
      default: return type;
    }
  };

  const getTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.SINGLE_CHOICE: return <Circle className="w-4 h-4" />;
      case QuestionType.MULTIPLE_CHOICE: return <CheckSquare className="w-4 h-4" />;
      case QuestionType.TRUE_FALSE: return <HelpCircle className="w-4 h-4" />;
      case QuestionType.ESSAY: return <Type className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: QuestionLevel) => {
    switch (level) {
      case QuestionLevel.EASY: return 'bg-green-100 text-green-800';
      case QuestionLevel.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case QuestionLevel.HARD: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Content', 'Type', 'Level',
      'Option1', 'Correct1',
      'Option2', 'Correct2',
      'Option3', 'Correct3',
      'Option4', 'Correct4'
    ];
    const sampleData = [
      [
        'Thủ đô của Việt Nam là gì?', 'SINGLE_CHOICE', 'EASY',
        'Hà Nội', 'TRUE',
        'Hồ Chí Minh', 'FALSE',
        'Đà Nẵng', 'FALSE',
        'Cần Thơ', 'FALSE'
      ],
      [
        'Các số nguyên tố nhỏ hơn 10 là?', 'MULTIPLE_CHOICE', 'MEDIUM',
        '2', 'TRUE',
        '3', 'TRUE',
        '4', 'FALSE',
        '9', 'FALSE'
      ]
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, 'question_template.xlsx');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile || !selectedBankId) return;

    try {
      setIsImporting(true);
      const result = await questionService.importQuestions(selectedBankId, importFile);
      const resultWithTotal = { ...result, total: result.success + result.failed };
      setImportResult(resultWithTotal);
      if (result.success > 0) {
        loadQuestions(selectedBankId);
        setSuccess(`Đã nhập thành công ${result.success} câu hỏi`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi nhập file');
    } finally {
      setIsImporting(false);
    }
  };

  if (loading && questions.length === 0 && questionBanks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            Quản lý Câu hỏi
          </h1>
          <p className="text-gray-500 mt-1">Soạn thảo và quản lý danh sách câu hỏi thi.</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                disabled={!selectedBankId}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-white
                    ${!selectedBankId ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                  `}
              >
                <Upload className="w-5 h-5" />
                Import Excel
              </button>
              <button
                onClick={handleOpenCreate}
                disabled={!selectedBankId}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-white
                    ${!selectedBankId ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                  `}
              >
                <Plus className="w-5 h-5" />
                Thêm câu hỏi
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Ngân hàng câu hỏi:</label>
          <select
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">-- Chọn ngân hàng để xem câu hỏi --</option>
            {questionBanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.course?.code} - {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 text-sm text-gray-500 flex items-end">
          {selectedBankId && (
            <span>Đang hiển thị {questions.length} câu hỏi</span>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(q.level)}`}>
                  {q.level}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 gap-1">
                  {getTypeIcon(q.type)} {getTypeLabel(q.type)}
                </span>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(q)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-gray-900 font-medium mb-3">
              <span className="font-bold mr-2">Câu {questions.length - idx}:</span>
              <span dangerouslySetInnerHTML={{ __html: q.content }} />
            </h3>

            {q.type !== QuestionType.ESSAY && (
              <div className="space-y-2 ml-4 border-l-2 border-gray-100 pl-4">
                {q.options.map((opt, i) => (
                  <div key={opt.id || i} className={`text-sm flex items-start gap-2 ${opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                    <span className="mt-0.5">{opt.isCorrect ? <CheckCircle className="w-4 h-4" /> : <span className="w-4 h-4 inline-block" />}</span>
                    <span>{opt.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {selectedBankId && questions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Chưa có câu hỏi nào trong ngân hàng này.
          </div>
        )}

        {!selectedBankId && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
            <ArrowLeft className="w-12 h-12 mx-auto mb-2 opacity-20" />
            Vui lòng chọn ngân hàng câu hỏi để bắt đầu quản lý
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeImportModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Import câu hỏi từ Excel
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="mb-2">Chọn file Excel (.xlsx) chứa danh sách câu hỏi để tải lên hệ thống.</p>
                    <button onClick={downloadTemplate} className="text-blue-600 hover:underline flex items-center gap-1">
                      <Download className="w-4 h-4" /> Tải file mẫu
                    </button>
                  </div>

                  {!importResult ? (
                    <div className="mt-4">
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click để chọn</span> hoặc kéo thả file</p>
                            <p className="text-xs text-gray-500">XLSX only (MAX. 5MB)</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" accept=".xlsx" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
                        </label>
                      </div>
                      {importFile && <div className="mt-2 text-sm font-medium text-green-600">Đã chọn: {importFile.name}</div>}
                    </div>
                  ) : (
                    <div className="mt-4 bg-gray-50 p-3 rounded text-sm">
                      <p className="font-bold">Kết quả import:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Tổng số dòng: {importResult.total}</li>
                        <li className="text-green-600">Thành công: {importResult.success}</li>
                        <li className="text-red-600">Thất bại: {importResult.failed}</li>
                      </ul>
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto border-t border-gray-200 pt-2 text-red-500 text-xs">
                          {importResult.errors.map((e: string, i: number) => <div key={i}>{e}</div>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                {!importResult ? (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!importFile || isImporting}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isImporting ? 'Đang xử lý...' : 'Tiến hành Import'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeImportModal}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Đóng
                  </button>
                )}
                {!importResult && (
                  <button
                    type="button"
                    onClick={closeImportModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl leading-6 font-bold text-gray-900">
                    {modalMode === 'create' ? 'Thêm câu hỏi mới' : 'Cập nhật câu hỏi'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Settings Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Loại câu hỏi</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={QuestionType.SINGLE_CHOICE}>Trắc nghiệm 1 đáp án</option>
                        <option value={QuestionType.MULTIPLE_CHOICE}>Trắc nghiệm nhiều đáp án</option>
                        <option value={QuestionType.TRUE_FALSE}>Đúng / Sai</option>
                        <option value={QuestionType.ESSAY}>Tự luận</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mức độ khó</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as QuestionLevel })}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={QuestionLevel.EASY}>Dễ</option>
                        <option value={QuestionLevel.MEDIUM}>Trung bình</option>
                        <option value={QuestionLevel.HARD}>Khó</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung câu hỏi <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={3}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập nội dung câu hỏi..."
                    ></textarea>
                  </div>

                  {/* Options Area (Hidden for ESSAY) */}
                  {formData.type !== QuestionType.ESSAY && formData.options && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Các phương án trả lời</label>
                        {formData.type !== QuestionType.TRUE_FALSE && (
                          <button type="button" onClick={addOption} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                            + Thêm đáp án
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {formData.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input
                              type={formData.type === QuestionType.SINGLE_CHOICE || formData.type === QuestionType.TRUE_FALSE ? 'radio' : 'checkbox'}
                              name="correctOption"
                              checked={opt.isCorrect}
                              onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)}
                              className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              title="Đánh dấu là đáp án đúng"
                            />
                            <input
                              type="text"
                              required
                              value={opt.content}
                              onChange={(e) => handleOptionChange(idx, 'content', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder={`Đáp án ${idx + 1}`}
                              readOnly={formData.type === QuestionType.TRUE_FALSE} // True/False content is fixed
                            />
                            {formData.type !== QuestionType.TRUE_FALSE && (
                              <button
                                type="button"
                                onClick={() => removeOption(idx)}
                                className="text-gray-400 hover:text-red-500"
                                title="Xóa đáp án"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Tích vào ô tròn/vuông để chọn đáp án đúng.
                      </p>
                    </div>
                  )}
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

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsImportModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl leading-6 font-bold text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    Nhập câu hỏi từ Excel
                  </h3>
                  <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!importResult ? (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Hướng dẫn:</h4>
                      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li>Tải file mẫu về để xem định dạng chuẩn.</li>
                        <li>Các cột bắt buộc: Content, Type, Level.</li>
                        <li>Loại câu hỏi (Type): SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, ESSAY.</li>
                        <li>Mức độ (Level): EASY, MEDIUM, HARD.</li>
                      </ul>
                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" /> Tải file mẫu (.xlsx)
                      </button>
                    </div>

                    <form onSubmit={handleImportSubmit} className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <input
                          id="file-upload"
                          type="file"
                          accept=".xlsx, .xls"
                          className="hidden"
                          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        />
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        {importFile ? (
                          <div>
                            <p className="font-medium text-gray-900">{importFile.name}</p>
                            <p className="text-sm text-gray-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900">Click để chọn file</p>
                            <p className="text-sm text-gray-500">Hỗ trợ định dạng .xlsx, .xls</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!importFile || isImporting}
                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                                    ${!importFile || isImporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                                `}
                      >
                        {isImporting ? 'Đang xử lý...' : 'Tiến hành nhập liệu'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${importResult.failed === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {importResult.failed === 0 ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      <div>
                        <p className="font-medium">Kết quả nhập liệu ({importResult.total} dòng):</p>
                        <p>Thành công: <b>{importResult.success}</b></p>
                        <p>Thất bại: <b>{importResult.failed}</b></p>
                      </div>
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-200 font-medium text-red-700 text-sm">
                          Chi tiết lỗi ({importResult.errors.length})
                        </div>
                        <div className="max-h-48 overflow-y-auto p-4 bg-white text-sm text-red-600 space-y-1">
                          {importResult.errors.map((err, i) => (
                            <div key={i}>• {err}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          setIsImportModalOpen(false);
                          setImportResult(null);
                          setImportFile(null);
                        }}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;

