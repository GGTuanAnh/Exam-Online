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
import { format } from 'date-fns';
import { RefreshCw, Clock, ClipboardList } from 'lucide-react';

interface ExamSessionData {
  id: string;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMEOUT';
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  exam: {
    title: string;
    course: {
      name: string;
    };
  };
}

const ExamSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<ExamSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await examService.getAllExamSessions(params);
      setSessions(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách ca thi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-indigo-600" />
          Giám sát Ca thi
        </h1>
        <Button variant="outline" onClick={fetchSessions}>
          <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang thi</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="TIMEOUT">Hết giờ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Ca thi ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Đề thi</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Giờ bắt đầu</TableHead>
                <TableHead>Giờ kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Không tìm thấy ca thi nào</TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">
                        {session.user?.firstName} {session.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{session.user?.email}</div>
                    </TableCell>
                    <TableCell>{session.exam?.title}</TableCell>
                    <TableCell>{session.exam?.course?.name}</TableCell>
                    <TableCell>{format(new Date(session.startTime), 'PP p')}</TableCell>
                    <TableCell>
                      {session.endTime ? format(new Date(session.endTime), 'PP p') : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1
                        ${session.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                      `}>
                        {session.status === 'IN_PROGRESS' && <Clock className="w-3 h-3 animate-pulse" />}
                        {session.status}
                      </span>
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

export default ExamSessionsPage;
