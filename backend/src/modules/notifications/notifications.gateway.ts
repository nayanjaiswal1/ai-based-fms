import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/notification.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(JwtAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string[]> = new Map();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove client from user sockets map
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId) || [];
      const filtered = sockets.filter(id => id !== client.id);

      if (filtered.length > 0) {
        this.userSockets.set(client.userId, filtered);
      } else {
        this.userSockets.delete(client.userId);
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(client: AuthenticatedSocket, userId: string) {
    client.userId = userId;

    // Add client to user sockets map
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(client.id);
    this.userSockets.set(userId, sockets);

    console.log(`Client ${client.id} authenticated as user ${userId}`);

    return { success: true, message: 'Authenticated successfully' };
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(client: AuthenticatedSocket) {
    if (!client.userId) {
      return { error: 'Not authenticated' };
    }

    const count = await this.notificationsService.getUnreadCount(client.userId);
    return { count };
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    const socketIds = this.userSockets.get(userId);

    if (socketIds && socketIds.length > 0) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });

      // Also send updated unread count
      const count = await this.notificationsService.getUnreadCount(userId);
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('unreadCount', { count });
      });
    }
  }

  // Helper method to broadcast notification
  async broadcastNotification(userId: string, createDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(userId, createDto);
    await this.sendNotificationToUser(userId, notification);
    return notification;
  }

  // NEW: Send group transaction event to all members in the group
  async broadcastGroupEvent(groupId: string, event: string, data: any) {
    this.server.to(`group:${groupId}`).emit(event, data);
  }

  // NEW: Send presence update to group
  async broadcastPresence(groupId: string, userId: string, status: string) {
    this.server.to(`group:${groupId}`).emit('presence:update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  // NEW: Join a group room for real-time updates
  @SubscribeMessage('joinGroup')
  handleJoinGroup(client: AuthenticatedSocket, groupId: string) {
    client.join(`group:${groupId}`);
    console.log(`Client ${client.id} joined group ${groupId}`);
    return { success: true, message: `Joined group ${groupId}` };
  }

  // NEW: Leave a group room
  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(client: AuthenticatedSocket, groupId: string) {
    client.leave(`group:${groupId}`);
    console.log(`Client ${client.id} left group ${groupId}`);
    return { success: true, message: `Left group ${groupId}` };
  }
}
