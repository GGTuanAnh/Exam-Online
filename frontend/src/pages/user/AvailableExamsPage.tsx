import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Calendar, Lock, BookOpen, ChevronRight } from 'lucide-react';
import { showToast } from '../../lib/toast';
import { examService } from '../../services/exam.service';
import { examShiftService, type ExamShift } from '../../services/exam-shift.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SkeletonExamCard } from '../../components/SkeletonLoader';

const AvailableExamsPage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<ExamShift[]>([]);
  const [loading, setLoading] = useState(true);

  // Password Dialog
  const [selectedShift, setSelectedShift] = useState<ExamShift | null>(null);
  const [password, setPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  // Countdown refresh
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { fetchShifts(); }, []);

  const fetchShifts = async () => {
    try {
      const data = await examShiftService.getAll();
      setShifts(data);
    } catch {
      showToast.error('Không thể tải danh sách ca thi');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = (shift: ExamShift) => {
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);
    if (now < startTime) { showToast.error(`Ca thi chưa bắt đầu. Mở lúc: ${startTime.toLocaleString('vi-VN')}`); return; }
    if (now > endTime) { showToast.error('Ca thi đã kết thúc'); return; }
    if (shift.password) {
      setSelectedShift(shift); setPassword(''); setIsDialogOpen(true);
    } else {
      joinShift(shift.id);
    }
  };

  const joinShift = async (shiftId: string, shiftPassword?: string) => {
    try {
      setJoining(true);
      const session = await examService.startExam(undefined, shiftId, shiftPassword);
      showToast.success('Bắt đầu làm bài!');
      setIsDialogOpen(false);
      navigate(`/take-exam/session/${session.id}`);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Không thể tham gia ca thi');
    } finally {
      setJoining(false);
    }
  };

  const getShiftStatus = (shift: ExamShift) => {
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const activeShifts = shifts.filter(s => getShiftStatus(s) === 'active');
  const upcomingShifts = shifts.filter(s => getShiftStatus(s) === 'upcoming');
  const endedShifts = shifts.filter(s => getShiftStatus(s) === 'ended');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Ca Thi Khả Dụng
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Chọn ca thi đang mở để bắt đầu làm bài</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonExamCard key={i} />)}
        </div>
      ) : shifts.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có ca thi nào</h3>
          <p className="text-gray-400 text-sm">Hiện tại không có ca thi nào được lên lịch. Vui lòng quay lại sau.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {/* ── Active Shifts ── */}
          {activeShifts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Đang diễn ra ({activeShifts.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeShifts.map(shift => <ShiftCard key={shift.id} shift={shift} status="active" onJoin={handleJoinClick} />)}
              </div>
            </section>
          )}

          {/* ── Upcoming Shifts ── */}
          {upcomingShifts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  Sắp diễn ra ({upcomingShifts.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingShifts.map(shift => <ShiftCard key={shift.id} shift={shift} status="upcoming" onJoin={handleJoinClick} />)}
              </div>
            </section>
          )}

          {/* ── Ended Shifts ── */}
          {endedShifts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                  Đã kết thúc ({endedShifts.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
                {endedShifts.map(shift => <ShiftCard key={shift.id} shift={shift} status="ended" onJoin={handleJoinClick} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Password Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              Nhập Mật Khẩu Ca Thi
            </DialogTitle>
            <DialogDescription>
              Ca thi <strong>{selectedShift?.title}</strong> yêu cầu mật khẩu để tham gia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') joinShift(selectedShift!.id, password); }}
              className="focus-visible:ring-indigo-500"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => joinShift(selectedShift!.id, password)} disabled={joining || !password} className="bg-indigo-600 hover:bg-indigo-700">
              {joining ? 'Đang vào...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── ShiftCard Component ──────────────────────────────────────────────────────

type ShiftStatus = 'active' | 'upcoming' | 'ended';

function ShiftCard({ shift, status, onJoin }: { shift: ExamShift; status: ShiftStatus; onJoin: (s: ExamShift) => void }) {
  const startTime = new Date(shift.startTime);
  const endTime = new Date(shift.endTime);
  const exam = shift.exam as any;

  const statusConfig = {
    active: { dot: 'bg-emerald-500 animate-pulse', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Đang mở', border: 'border-emerald-200 ring-1 ring-emerald-100' },
    upcoming: { dot: 'bg-blue-400', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Sắp mở', border: 'border-blue-100' },
    ended: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Đã đóng', border: 'border-gray-100' },
  }[status];

  return (
    <div className={`bg-white rounded-2xl border ${statusConfig.border} p-5 flex flex-col gap-4 transition-all hover:shadow-md`}>
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
              {statusConfig.label}
            </span>
            {shift.password && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                <Lock className="w-2.5 h-2.5" />Mật khẩu
              </span>
            )}
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mt-1 leading-snug truncate">{shift.title}</h3>
          {exam?.title && <p className="text-sm text-indigo-600 font-medium truncate mt-0.5">{exam.title}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${status === 'active' ? 'bg-emerald-50' : status === 'upcoming' ? 'bg-blue-50' : 'bg-gray-50'}`}>
          <Clock className={`w-5 h-5 ${status === 'active' ? 'text-emerald-500' : status === 'upcoming' ? 'text-blue-400' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm">
        {exam?.course?.name && (
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{exam.course.name}</span>
            {exam.course.code && <span className="text-gray-400">({exam.course.code})</span>}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>{startTime.toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className={status === 'active' ? 'text-emerald-600' : 'text-gray-600'}>
            {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => onJoin(shift)}
        disabled={status !== 'active'}
        className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
          ${status === 'active'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300 active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
      >
        {status === 'active' ? (
          <><Play className="w-4 h-4" /> Vào Thi Ngay <ChevronRight className="w-4 h-4" /></>
        ) : status === 'upcoming' ? (
          <><Clock className="w-4 h-4" /> Chưa mở</>
        ) : (
          'Đã kết thúc'
        )}
      </button>
    </div>
  );
}

export default AvailableExamsPage;
