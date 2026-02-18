import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*'},
  namespace: '/',
})
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // map to track userId 
  private connectedUsers = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}


  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
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
    } catch {
      client.disconnect();
    }
    
  }



  async handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (!userId) return ;

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
}
