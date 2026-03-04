import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { examService } from '@/services/exam.service';
import { courseService } from '@/services/course.service';
import type { ExamResult, Exam } from '@/types/exam';
import type { Course } from '@/types/course';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RefreshCw, Search, Trophy } from 'lucide-react';

const ExamResultsPage: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [searchUser, setSearchUser] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // When course changes, fetch exams for that course
    if (selectedCourseId !== 'all') {
      fetchExams(selectedCourseId);
    } else {
      setExams([]);
    }
    // We can also trigger filter here or wait for button
    handleSearch();
  }, [selectedCourseId, selectedExamId]);

  const fetchInitialData = async () => {
    try {
      const coursesData = await courseService.getAll();
      setCourses(coursesData);

      // If we want to allow filtering by any exam immediately, we might need to fetch all exams
      // For now let's just fetch results
      handleSearch();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchExams = async (courseId: string) => {
    try {
      const data = await examService.getAllExams(courseId);
      setExams(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedExamId !== 'all') params.examId = selectedExamId;
      // Note: Backend might strictly filter by examId, if we want to filter by course we need to filter locally or backend support
      // Backend supports: examId, userId, status.
      // If course is selected but no exam, we can't filter by course in backend directly via exam-results endpoint?
      // Actually backend just takes examId.

      const data = await examService.getAllExamResults(params);

      // Client side filtering for Course if Exam not selected (complex, maybe unnecessary for V1)
      // Client side filtering for User Name/Email
      let filtered = data;

      if (selectedCourseId !== 'all' && selectedExamId === 'all') {
        filtered = filtered.filter(r => r.session?.exam?.course?.id === selectedCourseId || r.exam?.course?.name === courses.find(c => c.id === selectedCourseId)?.name);
      }

      if (searchUser) {
        const lower = searchUser.toLowerCase();
        filtered = filtered.filter(r =>
          r.user?.email.toLowerCase().includes(lower) ||
          r.user?.firstName?.toLowerCase().includes(lower) ||
          r.user?.lastName?.toLowerCase().includes(lower)
        );
      }

      setResults(filtered);
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tải kết quả thi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-indigo-600" />
          Kết quả thi
        </h1>
        <Button variant="outline" onClick={handleSearch} className="hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
          <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Khóa học</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đề thi</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={selectedCourseId === 'all' && exams.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả đề thi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đề thi</SelectItem>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tìm kiếm thí sinh</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Email hoặc Tên"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700"><Search className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">Danh sách kết quả ({results.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Thí sinh</TableHead>
                <TableHead className="font-semibold text-gray-700">Đề thi</TableHead>
                <TableHead className="font-semibold text-gray-700">Khóa học</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Điểm</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">Vi phạm</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Ngày nộp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">Không tìm thấy kết quả nào</TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {result.user?.firstName} {result.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{result.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-indigo-600">{result.session?.exam?.title || result.exam?.title || 'Không xác định'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {result.session?.exam?.course?.name || result.exam?.course?.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-gray-900">
                      {result.score?.toFixed(1)}
                    </TableCell>

                    <TableCell className="text-center">
                      {result.leaveScreenCount !== undefined && result.leaveScreenCount > 0 ? (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">
                          ⚠️ {result.leaveScreenCount} lần
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Không</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-gray-600 tabular-nums">
                      {result.submittedAt ? format(new Date(result.submittedAt), 'PP p', { locale: vi }) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResultsPage;
