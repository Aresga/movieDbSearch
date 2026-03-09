import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io';

export interface IGatewaySessionManager {
	getUserSocket(id: number)
	setUserSocket(userId: number, socket: Socket): void;
	removeUserSocket(userId: number): void;
	getSockets(): Map<number, Socket>;
}
@Injectable()
export class GatewaySessionManager implements IGatewaySessionManager {
	private readonly sessions: Map<number, Socket> = new Map();
	getUserSocket(id: number) {
		return this.sessions.get(id);
	}
	setUserSocket(userId: number, socket: Socket) {
		this.sessions.set(userId, socket);
	}
	removeUserSocket(userId: number) {
		this.sessions.delete(userId);
	}
	getSockets(): Map<number, Socket> {
		return this.sessions;
	}

}