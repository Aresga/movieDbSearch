import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageService } from 'src/message/message.service';
import { parse } from 'cookie';

@WebSocketGateway({
  cors: { 
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://moviedb.gagabuilds.com'],
    credentials: true,
  },
  namespace: '/',
})
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userRooms = new Map();
  @OnEvent('message.create')
  handleMessageCreateEvent(payload: any) {
	this.server.emit('receiveMessage', payload);
  }
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService
  ) {}


  async handleConnection(client: Socket) {
      const token = client.handshake.auth?.token
        || client.handshake.headers?.authorization?.split(' ')[1]
        || client.handshake.headers?.token
        || (() => {
          const cookies = parse(client.handshake.headers?.cookie || '');
          return cookies['access_token'];
          })();
      if (!token) {
        client.disconnect();
        return ;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      await this.prisma.user.updateMany({
        where: { id: userId },
        data: { isOnline: true },
      });

      await this.notifyFriendsStatus(userId, true);
      console.log(`User ${userId} connected`);
  }


  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (!userId) return ;

    this.userRooms.delete(userId);
    this.connectedUsers.delete(userId);

    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { isOnline: false },
    });

    await this.notifyFriendsStatus(userId, false);

    console.log(`User ${userId} disconnected`);
  }

  private async notifyFriendsStatus(userId: string, isOnline: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, friends: { select: { id: true } } },
    });

    if (!user) return ;

    for (const friend of user.friends) {
      const friendSocketId = this.connectedUsers.get(friend.id);
      if (friendSocketId) {
        this.server.to(friendSocketId).emit('friendStatus', {
          userId,
          username: user.username,
          isOnline,
        });
      }
    }
  }

  @SubscribeMessage('joinRoom')
  async handleRoomJoin(client: Socket, roomId: string)
  {
      client.join(roomId);
      return { success: true, room: roomId }
  }

  sendToUser(userId: string, event: string, payload: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      console.log(`Sending event "${event}" to user ${userId} (socket ${socketId}) with payload:`, payload);
      this.server.to(socketId).emit(event, payload);
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, roomId: string)
  {
    client.leave(roomId);
    return { success: true, room: roomId }
  }


  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    data: { roomId: string; content: string },
  )
  {
    try {
      const senderId = client.data.userId;
      const roomId = data.roomId;
      const content = data.content?.trim();

      if (!senderId || !roomId || !content) {
        return ;
      }

      const roomSockets = await this.server.in(roomId).fetchSockets();
      const checkForUser = roomSockets.some((socket) => socket.data.userId && socket.data.userId !== senderId);
      const message = await this.messageService.storeMessage(
        roomId,
        senderId,
        content,
        checkForUser,
      );

      const payload = {
        _id: String(message._id),
        roomId,
        senderId,
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
        read: checkForUser,
      };

      const participants = await this.messageService.getRoomParticipants(roomId);
      const senderUsername = participants?.find((participant) => participant.id === senderId)?.username;

      console.log(`Message from ${senderId} in room ${roomId}: "${content}"`);
      this.server.to(roomId).emit('receiveMessage', payload);

      if (participants?.length) {
        for (const participant of participants) {
          if (participant.id === senderId) continue;

          this.sendToUser(participant.id, 'receiveMessageNotification', {
            _id: payload._id,
            roomId,
            senderId,
            senderUsername,
            content: payload.content,
            createdAt: payload.createdAt,
          });
        }
      }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
  }

  @SubscribeMessage('markRoomAsRead')
  async handleMarkRoomAsRead(client: Socket, roomId: string)
  {
    const userId = client.data.userId;
    await this.messageService.markAsRead(roomId, userId);
    this.server.to(roomId).emit('markAsRead', {
      roomId,
      readBy: userId,
    });
  }
}
