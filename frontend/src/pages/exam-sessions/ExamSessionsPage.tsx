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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { examService } from '@/services/exam.service';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { RefreshCw, Clock, ClipboardList, Search, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface ExamShift {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  exam: {
    id: string;
    title: string;
    course: {
      name: string;
    };
  };
  _count?: {
    sessions: number;
  };
}

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
  result?: {
    leaveScreenCount: number;
  };
}

const ExamSessionsPage: React.FC = () => {
  const [examShifts, setExamShifts] = useState<ExamShift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [sessions, setSessions] = useState<ExamSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchExamShifts();
  }, []);

  useEffect(() => {
    if (selectedShiftId) {
      fetchSessions();
      const interval = setInterval(fetchSessions, 10000); // Auto refresh every 10s
      return () => clearInterval(interval);
    }
  }, [selectedShiftId, statusFilter]);

  const fetchExamShifts = async () => {
    try {
      const response = await api.get<ExamShift[]>('/exam-shifts');
      setExamShifts(response.data);
      if (response.data.length > 0 && !selectedShiftId) {
        setSelectedShiftId(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách ca thi', variant: 'destructive' });
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params: any = { examShiftId: selectedShiftId };
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await examService.getAllExamSessions(params);
      setSessions(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách sinh viên', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const selectedShift = examShifts.find(shift => shift.id === selectedShiftId);

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${session.user?.firstName} ${session.user?.lastName}`.toLowerCase();
    const email = session.user?.email?.toLowerCase() || '';
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const stats = {
    total: filteredSessions.length,
    inProgress: filteredSessions.filter(s => s.status === 'IN_PROGRESS').length,
    completed: filteredSessions.filter(s => s.status === 'COMPLETED').length,
    timeout: filteredSessions.filter(s => s.status === 'TIMEOUT').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ClipboardList className="w-9 h-9 text-indigo-600" />
          Giám sát Ca thi
        </h1>
        <Button variant="outline" onClick={fetchSessions} disabled={!selectedShiftId}>
          <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
        </Button>
      </div>

      {/* Shift Selector */}
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-700">Chọn ca thi</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn ca thi để giám sát" />
            </SelectTrigger>
            <SelectContent>
              {examShifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  <div className="flex flex-col py-1">
                    <div className="font-semibold">{shift.title}</div>
                    <div className="text-sm text-gray-600">
                      📅 {format(new Date(shift.startTime), 'dd/MM/yyyy')} •
                      ⏰ {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')} •
                      📚 {shift.exam?.title}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedShift && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang thi</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Clock className="w-10 h-10 text-blue-500 opacity-20 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hết giờ</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.timeout}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {selectedShift && (
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm sinh viên theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
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
      )}

      {/* Sessions Table */}
      {selectedShift && (
        <Card>
          <CardHeader>
            <CardTitle>Danh sách sinh viên ({filteredSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Giờ bắt đầu</TableHead>
                  <TableHead>Giờ kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cảnh báo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchQuery ? 'Không tìm thấy sinh viên nào' : 'Chưa có sinh viên nào tham gia ca thi này'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">
                          {session.user?.firstName} {session.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{session.user?.email}</div>
                      </TableCell>
                      <TableCell>{format(new Date(session.startTime), 'HH:mm:ss dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {session.endTime ? format(new Date(session.endTime), 'HH:mm:ss dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1.5
                          ${session.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                          {session.status === 'IN_PROGRESS' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                          {session.status === 'IN_PROGRESS' ? 'Đang thi' :
                            session.status === 'COMPLETED' ? 'Hoàn thành' : 'Hết giờ'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.result?.leaveScreenCount && session.result.leaveScreenCount > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            ⚠️ Rời tab {session.result.leaveScreenCount} lần
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamSessionsPage;
