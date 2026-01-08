// backend/src/notifications/notifications.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Admin: Tao thong bao (gui cho 1 hoac nhieu users)
  async createNotification(createNotificationDto: CreateNotificationDto) {
    const { userId, userIds, ...notificationData } = createNotificationDto;

    // Neu co userId, gui cho 1 user
    if (userId) {
      return this.prisma.notification.create({
        data: {
          ...notificationData,
          userId,
        },
      });
    }

    // Neu co userIds, gui cho nhieu users
    if (userIds && userIds.length > 0) {
      const notifications = await this.prisma.notification.createMany({
        data: userIds.map(uid => ({
          ...notificationData,
          userId: uid,
        })),
      });

      return {
        message: `Đã tạo ${notifications.count} thông báo`,
        count: notifications.count,
      };
    }

    // Neu khong co userId hoac userIds, gui cho tat ca users
    const allUsers = await this.prisma.user.findMany({
      select: { id: true },
    });

    const notifications = await this.prisma.notification.createMany({
      data: allUsers.map(user => ({
        ...notificationData,
        userId: user.id,
      })),
    });

    return {
      message: `Đã tạo ${notifications.count} thông báo cho tất cả users`,
      count: notifications.count,
    };
  }

  // User: Lay danh sach thong bao cua minh
  async getMyNotifications(userId: string, query?: { isRead?: boolean }) {
    const where: any = { userId };

    if (query?.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // User: Dem so thong bao chua doc
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  // User: Danh dau 1 thong bao da doc
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Thông báo với ID ${notificationId} không tồn tại`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông báo này');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // User: Danh dau tat ca thong bao da doc
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      message: `Đã đánh dấu ${result.count} thông báo là đã đọc`,
      count: result.count,
    };
  }

  // User: Xoa 1 thong bao
  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Thông báo với ID ${notificationId} không tồn tại`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa thông báo này');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Đã xóa thông báo' };
  }

  // User: Xoa tat ca thong bao da doc
  async deleteAllRead(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return {
      message: `Đã xóa ${result.count} thông báo`,
      count: result.count,
    };
  }
}
