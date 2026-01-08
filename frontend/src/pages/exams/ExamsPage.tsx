import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, Plus } from 'lucide-react';
import { examService } from '@/services/exam.service';
import { courseService } from '@/services/course.service';
import { questionBankService } from '@/services/question-bank.service';
import { questionService } from '@/services/question.service';
import type { Exam, CreateExamDto, ExamQuestion } from '@/types/exam';
import type { Course } from '@/types/course';
import type { QuestionBank } from '@/types/question-bank';
import type { Question } from '@/types/question';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateExamDto>>({
    title: '',
    description: '',
    duration: 60,
    courseId: '',
    questions: [],
  });

  // Question Selection State
  const [availableBanks, setAvailableBanks] = useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId !== 'all') {
      fetchExams(selectedCourseId);
    } else {
      fetchExams();
    }
  }, [selectedCourseId]);

  // Fetch Logic
  const fetchExams = async (courseId?: string) => {
    try {
      setLoading(true);
      const data = await examService.getAllExams(courseId);
      setExams(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đề thi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Dialog Logic
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormData({
      title: '',
      description: '',
      duration: 60,
      courseId: '',
      openTime: '',
      closeTime: '',
      maxRetake: 1,
      randomizeQuestions: false,
      enableAntiCheat: false,
      questions: [],
    });
    setSelectedQuestionIds(new Set());
    setAvailableBanks([]);
    setBankQuestions([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (exam: Exam) => {
    setIsEditMode(true);
    setEditingId(exam.id);
    
    try {
      const details = await examService.getExamById(exam.id);
      setFormData({
        title: details.title,
        description: details.description,
        duration: details.duration,
        courseId: details.courseId,
        openTime: details.openTime || '',
        closeTime: details.closeTime || '',
        maxRetake: details.maxRetake || 1,
        randomizeQuestions: details.randomizeQuestions || false,
        enableAntiCheat: details.enableAntiCheat || false,
        questions: details.questions.map((q, index) => ({
          questionId: q.questionId,
          point: q.point,
          order: q.order || index + 1 // Giữ nguyên order hoặc tạo mới từ 1
        })),
      });
      
      const qIds = new Set(details.questions.map(q => q.questionId));
      setSelectedQuestionIds(qIds);

      // Load banks for this course
      if (details.courseId) {
        handleCourseChange(details.courseId);
      }
      
      setIsDialogOpen(true);
    } catch (error) {
        toast({ title: 'Lỗi', description: 'Không thể tải thông tin đề thi' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    try {
      await examService.deleteExam(id);
      toast({ title: 'Thành công', description: 'Đã xóa đề thi' });
      fetchExams(selectedCourseId === 'all' ? undefined : selectedCourseId);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể xóa đề thi', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.courseId || !formData.duration) {
        toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin bắt buộc', variant: 'destructive' });
        return;
      }
      
      const questionsData: ExamQuestion[] = Array.from(selectedQuestionIds).map((id, index) => ({
        questionId: id,
        point: 1, // Default point
        order: index + 1 // Thứ tự bắt đầu từ 1
      }));

      if (questionsData.length === 0) {
        toast({ title: 'Lỗi', description: 'Vui lòng chọn ít nhất một câu hỏi', variant: 'destructive' });
        return;
      }

      const payload: CreateExamDto = {
        title: formData.title!,
        description: formData.description,
        duration: Number(formData.duration),
        courseId: formData.courseId!,
        questions: questionsData,
        openTime: formData.openTime || undefined,
        closeTime: formData.closeTime || undefined,
        maxRetake: formData.maxRetake || 1,
        randomizeQuestions: formData.randomizeQuestions || false,
        enableAntiCheat: formData.enableAntiCheat || false,
      };

      if (isEditMode && editingId) {
        await examService.updateExam(editingId, payload);
        toast({ title: 'Thành công', description: 'Đã cập nhật đề thi' });
      } else {
        await examService.createExam(payload);
        toast({ title: 'Thành công', description: 'Đã tạo đề thi mới' });
      }

      setIsDialogOpen(false);
      fetchExams(selectedCourseId === 'all' ? undefined : selectedCourseId);
    } catch (error: any) {
      toast({ title: 'Lỗi', description: error.response?.data?.message || 'Thao tác thất bại', variant: 'destructive' });
    }
  };

  // Question Selection Logic
  const handleCourseChange = async (cId: string) => {
    setFormData(prev => ({ ...prev, courseId: cId }));
    // Load banks
    try {
      console.log('🔍 Loading question banks for course:', cId);
      const banks = await questionBankService.getAll(cId);
      console.log('✅ Loaded question banks:', banks);
      setAvailableBanks(banks);
      setBankQuestions([]); // Reset questions list
      setSelectedBankId('');
    } catch (error) {
      console.error('❌ Error loading question banks:', error);
      toast({ 
        title: 'Lỗi', 
        description: 'Không thể tải danh sách ngân hàng câu hỏi',
        variant: 'destructive'
      });
    }
  };

  const handleBankChange = async (bId: string) => {
    setSelectedBankId(bId);
    try {
      console.log('🔍 Loading questions for bank:', bId);
      const qs = await questionService.getAll(bId);
      console.log('✅ Loaded questions:', qs);
      setBankQuestions(qs);
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      toast({ 
        title: 'Lỗi', 
        description: 'Không thể tải danh sách câu hỏi',
        variant: 'destructive'
      });
    }
  };

  const toggleQuestion = (qId: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(qId)) {
      newSet.delete(qId);
    } else {
      newSet.add(qId);
    }
    setSelectedQuestionIds(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Đề thi</h1>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tạo Đề thi
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Label>Lọc theo Khóa học:</Label>
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả khóa học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khóa học</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Đề thi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Khóa học</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Lịch thi</TableHead>
                  <TableHead>Số câu</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.course?.name || 'N/A'}</TableCell>
                    <TableCell>{exam.duration} phút</TableCell>
                    <TableCell className="text-xs">
                      {exam.openTime && exam.closeTime ? (
                        <>
                          <div>Mở: {new Date(exam.openTime).toLocaleString('vi-VN')}</div>
                          <div>Đóng: {new Date(exam.closeTime).toLocaleString('vi-VN')}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">Chưa đặt lịch</span>
                      )}
                    </TableCell>
                    <TableCell>{exam.questions?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(exam)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(exam.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">Không tìm thấy đề thi nào</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Chỉnh sửa Đề thi' : 'Tạo Đề thi mới'}</DialogTitle>
            <DialogDescription>
              Thiết lập thông tin đề thi và chọn câu hỏi.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tiêu đề</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Kỳ thi cuối kỳ 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian (phút)</Label>
                <Input 
                  type="number"
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Mô tả</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              {/* Thời gian thi */}
              <div className="space-y-2">
                <Label>Thời gian mở thi</Label>
                <Input 
                  type="datetime-local"
                  value={formData.openTime ? new Date(formData.openTime).toISOString().slice(0, 16) : ''} 
                  onChange={e => setFormData({...formData, openTime: e.target.value ? new Date(e.target.value).toISOString() : ''})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Thời gian đóng thi</Label>
                <Input 
                  type="datetime-local"
                  value={formData.closeTime ? new Date(formData.closeTime).toISOString().slice(0, 16) : ''} 
                  onChange={e => setFormData({...formData, closeTime: e.target.value ? new Date(e.target.value).toISOString() : ''})} 
                />
              </div>

              {/* Cấu hình */}
              <div className="space-y-2">
                <Label>Số lần thi tối đa</Label>
                <Input 
                  type="number"
                  min={1}
                  value={formData.maxRetake} 
                  onChange={e => setFormData({...formData, maxRetake: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={e => setFormData({...formData, randomizeQuestions: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <span>Đảo câu hỏi ngẫu nhiên</span>
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    checked={formData.enableAntiCheat}
                    onChange={e => setFormData({...formData, enableAntiCheat: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <span>Bật chống gian lận</span>
                </Label>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Khóa học</Label>
                <Select 
                  value={formData.courseId} 
                  onValueChange={handleCourseChange}
                  disabled={isEditMode} 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                       <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditMode && <p className="text-xs text-muted-foreground">Không thể thay đổi khóa học khi chỉnh sửa.</p>}
              </div>
            </div>

            {/* Question Selection */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Chọn câu hỏi ({selectedQuestionIds.size} đã chọn)</h3>
              
              <div className="flex gap-4 mb-4">
                <div className="w-1/3">
                  <Label>Ngân hàng câu hỏi</Label>
                  <Select value={selectedBankId} onValueChange={handleBankChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={availableBanks.length ? "Chọn ngân hàng" : "Không có ngân hàng"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBanks.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-[300px] border rounded-md overflow-y-auto p-2">
                {bankQuestions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Chọn</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Độ khó</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankQuestions.map(q => (
                        <TableRow key={q.id}>
                          <TableCell>
                            <input 
                              type="checkbox" 
                              checked={selectedQuestionIds.has(q.id)}
                              onChange={() => toggleQuestion(q.id)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell className="max-w-[400px] truncate" title={q.content}>
                            {q.content.substring(0, 100)}...
                          </TableCell>
                          <TableCell>{q.type}</TableCell>
                          <TableCell>{q.level}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    {selectedBankId ? 'Không có câu hỏi trong ngân hàng này.' : 'Chọn Ngân hàng câu hỏi để xem các câu hỏi.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit}>Lưu Đề thi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
