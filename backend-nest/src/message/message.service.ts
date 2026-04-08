import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { ChatRoom } from './chat-room.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

export interface MenuRoom extends Omit<ChatRoom, 'participants'> {
	participants: User[];
}

@Injectable()
export class MessageService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<Message>,
		@InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
		private prisma: PrismaService,
	) {}

	async getCreateRoom(userId1: string, userId2: string)
	{
		const participants = [userId1, userId2].sort();

		let room = await this.chatRoomModel.findOne({ participants: { $all: participants, $size: 2 },
		});
		if (!room) {
			room = new this.chatRoomModel({ participants, });
			await room.save();
		}
		return room;
	}

	async storeMessage(roomId: string, senderId: string, content: string, read: boolean)
	{
		const message = new this.messageModel({
			roomId,
			senderId,
			content,
			read,
		});
		const savedMessage = await message.save();
		await this.chatRoomModel.findByIdAndUpdate(roomId, {
			lastMessage: savedMessage._id,
			updatedAt: new Date(),
		});

		return savedMessage;
	}

	async getRoomMessages(roomId: string, limit: number = 50, skip: number = 0)
	{
		return await this.messageModel.find({roomId})
		.sort({createdAt: -1})
		.skip(skip)
		.limit(limit)
	}

	async getRoomParticipants(roomId: string)
	{
		const room = await this.chatRoomModel.findById(roomId);
		if (!room)
		{
			return null;
		}
		const users = await this.prisma.user.findMany({
			where: {
				id: {
					in: room.participants,
				},
			},
		});
		return users;
	}

    async findAllForUser(userId: string) {
        const rooms = await this.chatRoomModel.find({ participants: userId }).select('_id').exec();
        const roomIds = rooms.map(room => room._id);
        return this.messageModel.find({ roomId: { $in: roomIds } }).sort({ createdAt: -1 }).exec();
    }

	async getChatRooms(userId: string)
	{
		return await this.chatRoomModel.find({participants: userId })
		.populate('lastMessage')
		.sort({ updatedAt: -1 });
	}

	async markAsRead(roomId: string, userId: string)
	{
		return await this.messageModel.updateMany(
			{
				roomId,
				senderId: { $ne: userId },
				read: { $ne: true },
			},
			{
				$set: { read: true },
			}
		);
	}

	async getMenuRooms(userId: string)
	{
		const rooms = await this.chatRoomModel.find({participants: userId })
		.populate('lastMessage')
		.sort({ updatedAt: -1 })
		.lean()
		.exec()

		const roomsWithParticipants = await Promise.all(
			rooms.map(async (room) => {
				const participants = await this.prisma.user.findMany({
					where: {
						id: {
							in: room.participants,
						},
					},
				});
				return {...room, participants};
			}));
			return roomsWithParticipants as unknown as MenuRoom[];
	}

}