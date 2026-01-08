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
import { RefreshCw, Search } from 'lucide-react';

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
      toast({ title: 'Error', description: 'Failed to fetch results', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        <Button variant="outline" onClick={handleSearch}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Exam</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={selectedCourseId === 'all' && exams.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Student Search</label>
              <div className="flex gap-2">
                <Input 
                    placeholder="Email or Name" 
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch}><Search className="h-4 w-4"/></Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results List ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vi phạm</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No results found</TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="font-medium">
                        {result.user?.firstName} {result.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{result.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      {result.session?.exam?.title || result.exam?.title || 'Unknown Exam'}
                    </TableCell>
                    <TableCell>
                      {result.session?.exam?.course?.name || result.exam?.course?.name || '-'}
                    </TableCell>
                    <TableCell className="font-bold">
                      {result.score?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${result.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      `}>
                        {result.isPassed ? 'PASSED' : 'FAILED'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {result.leaveScreenCount !== undefined && result.leaveScreenCount > 0 ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          ⚠️ {result.leaveScreenCount} lần
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Không</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.submittedAt ? format(new Date(result.submittedAt), 'PP p') : '-'}
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
