import { useState, useEffect } from 'react';
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
import { Edit, Trash, Plus, Calendar, FileText } from 'lucide-react';
// ... imports

// ... inside component

return (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
        <FileText className="w-8 h-8 text-indigo-600" />
        Quản lý Đề thi
      </h1>
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
                {/* Lịch thi column removed/changed intent */}
                <TableHead>Ca thi</TableHead>
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
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleOpenShifts(exam)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                      <Calendar className="w-4 h-4 mr-2" /> Quản lý Ca thi
                    </Button>
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
              {exams.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">Không tìm thấy đề thi nào</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>

    {/* Main Exam Dialog */}
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
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Kỳ thi cuối kỳ 2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Thời gian (phút)</Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Time Fields Removed - Now in Shifts */}

            {/* Cấu hình */}
            <div className="space-y-2">
              <Label>Số lần thi tối đa</Label>
              <Input
                type="number"
                min={1}
                value={formData.maxRetake}
                onChange={e => setFormData({ ...formData, maxRetake: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.randomizeQuestions}
                  onChange={e => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
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
                  onChange={e => setFormData({ ...formData, enableAntiCheat: e.target.checked })}
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

    {/* Shifts Dialog */}
    {selectedExamForShift && (
      <ExamShiftsDialog
        isOpen={isShiftDialogOpen}
        onClose={() => setIsShiftDialogOpen(false)}
        examId={selectedExamForShift.id}
        examTitle={selectedExamForShift.title}
      />
    )}
  </div>
);
}
