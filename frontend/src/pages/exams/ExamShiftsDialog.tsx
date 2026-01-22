import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { examShiftService, type ExamShift } from '@/services/exam-shift.service';
import { Trash, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ExamShiftsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    examId: string;
    examTitle: string;
}

export const ExamShiftsDialog: React.FC<ExamShiftsDialogProps> = ({
    isOpen,
    onClose,
    examId,
    examTitle,
}) => {
    const [shifts, setShifts] = useState<ExamShift[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [newShift, setNewShift] = useState({
        title: '',
        startTime: '',
        endTime: '',
        password: '',
        isActive: true,
    });

    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen && examId) {
            fetchShifts();
        }
    }, [isOpen, examId]);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            const data = await examShiftService.getAll(examId);
            setShifts(data);
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể tải danh sách ca thi',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!newShift.title || !newShift.startTime || !newShift.endTime) {
                toast({
                    title: 'Lỗi',
                    description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
                    variant: 'destructive',
                });
                return;
            }

            await examShiftService.create({
                ...newShift,
                examId,
            });

            toast({ title: 'Thành công', description: 'Đã tạo ca thi mới' });
            setIsCreating(false);
            setNewShift({
                title: '',
                startTime: '',
                endTime: '',
                password: '',
                isActive: true,
            });
            fetchShifts();
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.response?.data?.message || 'Không thể tạo ca thi',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa ca thi này?')) return;
        try {
            await examShiftService.delete(id);
            toast({ title: 'Thành công', description: 'Đã xóa ca thi' });
            fetchShifts();
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa ca thi' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Quản lý Ca Thi - {examTitle}</DialogTitle>
                    <DialogDescription>
                        Tạo và quản lý các ca thi cho đề thi này.
                    </DialogDescription>
                </DialogHeader>

                {/* List Shifts */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div>
                            <h3 className="font-semibold text-gray-900">Danh sách Ca Thi</h3>
                            <p className="text-sm text-gray-500">
                                {shifts.length} ca thi đã tạo
                            </p>
                        </div>
                        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
                            {isCreating ? 'Hủy tạo mới' : <><Plus className="w-4 h-4 mr-2" /> Thêm Ca Thi</>}
                        </Button>
                    </div>

                    {isCreating && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-medium text-blue-800">Thông tin Ca Thi Mới</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên Ca Thi</Label>
                                    <Input
                                        placeholder="VD: Ca Sáng - K66"
                                        value={newShift.title}
                                        onChange={(e) => setNewShift({ ...newShift, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mật khẩu (Tùy chọn)</Label>
                                    <Input
                                        placeholder="VD: 123456"
                                        value={newShift.password}
                                        onChange={(e) => setNewShift({ ...newShift, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thời gian Bắt đầu</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newShift.startTime}
                                        onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Thời gian Kết thúc</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newShift.endTime}
                                        onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleCreate}>Lưu Ca Thi</Button>
                            </div>
                        </div>
                    )}

                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Tên Ca</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Mật khẩu</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell>
                                    </TableRow>
                                ) : shifts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có ca thi nào.</TableCell>
                                    </TableRow>
                                ) : (
                                    shifts.map((shift) => (
                                        <TableRow key={shift.id}>
                                            <TableCell className="font-medium">{shift.title}</TableCell>
                                            <TableCell className="text-sm">
                                                <div className="text-green-600">
                                                    {format(new Date(shift.startTime), 'Pp', { locale: vi })}
                                                </div>
                                                <div className="text-red-500">
                                                    {format(new Date(shift.endTime), 'Pp', { locale: vi })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {shift.password ? (
                                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{shift.password}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Không có</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${new Date() >= new Date(shift.startTime) && new Date() <= new Date(shift.endTime)
                                                        ? 'bg-green-100 text-green-700'
                                                        : new Date() > new Date(shift.endTime)
                                                            ? 'bg-gray-100 text-gray-600'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {new Date() >= new Date(shift.startTime) && new Date() <= new Date(shift.endTime)
                                                        ? 'Đang diễn ra'
                                                        : new Date() > new Date(shift.endTime)
                                                            ? 'Đã kết thúc'
                                                            : 'Sắp diễn ra'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(shift.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
