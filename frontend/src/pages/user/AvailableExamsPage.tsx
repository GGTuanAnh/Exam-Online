import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, Calendar, Lock } from 'lucide-react';
import { showToast } from '../../lib/toast';
import { examService } from '../../services/exam.service';
import { examShiftService, type ExamShift } from '../../services/exam-shift.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const AvailableExamsPage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<ExamShift[]>([]);
  const [loading, setLoading] = useState(true);

  // Password Dialog State
  const [selectedShift, setSelectedShift] = useState<ExamShift | null>(null);
  const [password, setPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      // Fetch all available shifts
      const data = await examShiftService.getAll();
      // Filter only active shifts? Backend returns all.
      // Filter logic: Show active and upcoming? Or just active?
      // Shows all for now, visual indicator for status
      setShifts(data);
      setLoading(false);
    } catch (error) {
      showToast.error('Không thể tải danh sách ca thi');
      setLoading(false);
    }
  };

  const handleJoinClick = (shift: ExamShift) => {
    const now = new Date();
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);

    if (now < startTime) {
      showToast.error(`Ca thi chưa bắt đầu. Mở lúc: ${startTime.toLocaleString('vi-VN')}`);
      return;
    }
    if (now > endTime) {
      showToast.error('Ca thi đã kết thúc');
      return;
    }

    if (shift.password) {
      setSelectedShift(shift);
      setPassword('');
      setIsDialogOpen(true);
    } else {
      joinShift(shift.id);
    }
  };

  const joinShift = async (shiftId: string, shiftPassword?: string) => {
    try {
      setJoining(true);
      // Start exam session with shiftId
      const session = await examService.startExam(undefined, shiftId, shiftPassword);

      showToast.success('Bắt đầu làm bài!');
      setIsDialogOpen(false);

      // Redirect to session-based take exam page
      navigate(`/take-exam/session/${session.id}`);
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Không thể tham gia ca thi');
    } finally {
      setJoining(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedShift) {
      joinShift(selectedShift.id, password);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Ca Thi Khả Dụng</h1>
          <p className="text-gray-600 mt-1">Chọn ca thi đang mở để bắt đầu làm bài</p>
        </div>
      </div>

      {shifts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có ca thi nào
          </h3>
          <p className="text-gray-500">
            Hiện tại không có ca thi nào được lên lịch.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift) => {
            const now = new Date();
            const startTime = new Date(shift.startTime);
            const endTime = new Date(shift.endTime);
            const isActive = now >= startTime && now <= endTime;
            const isUpcoming = now < startTime;
            const isEnded = now > endTime;

            return (
              <div
                key={shift.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all ${isActive ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200 opacity-80'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {shift.title}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">
                      {(shift.exam as any)?.title}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-24 font-medium">Môn học:</div>
                    <div className="flex-1 text-gray-900">{(shift.exam as any)?.course?.name || 'N/A'}</div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-24 font-medium">Thời gian:</div>
                    <div className={`flex-1 ${isActive ? 'text-green-600 font-bold' : ''}`}>
                      {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-24 font-medium">Ngày:</div>
                    <div className="flex-1">{startTime.toLocaleDateString('vi-VN')}</div>
                  </div>
                  {shift.password && (
                    <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                      <Lock className="w-3 h-3 mr-1" />
                      Yêu cầu mật khẩu
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {/* Extra info can go here */}
                  </div>
                  <Button
                    onClick={() => handleJoinClick(shift)}
                    disabled={!isActive}
                    className={`${isActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    {isUpcoming ? 'Chưa mở' : isEnded ? 'Đã kết thúc' : 'Vào Thi Ngay'}
                    {isActive && <Play className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập Mật Khẩu Ca Thi</DialogTitle>
            <DialogDescription>
              Ca thi này yêu cầu mật khẩu để tham gia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mật khẩu</Label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePasswordSubmit();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handlePasswordSubmit} disabled={joining}>
              {joining ? 'Đang vào...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableExamsPage;
