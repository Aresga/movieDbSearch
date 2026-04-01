import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageService } from 'src/message/message.service';
import { parse } from 'cookie';

@WebSocketGateway({
  cors: { origin: '*'},
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

      await this.prisma.user.update({
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

    await this.prisma.user.update({
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
      this.server.to(socketId).emit(event, payload);
    }
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

      const message = await this.messageService.storeMessage(
        roomId,
        senderId,
        content,
      );

      const payload = {
        _id: String(message._id),
        roomId,
        senderId,
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
      };
      console.log(`Message from ${senderId} in room ${roomId}: "${content}"`);
      this.server.to(roomId).emit('receiveMessage', payload)
    } catch (error) {
        console.error('Failed to send message:', error);
    }
  }
}
