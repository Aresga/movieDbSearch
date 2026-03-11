import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';
import { ChatRoom } from './chat-room.schema';

@Injectable()
export class MessageService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<Message>,
		@InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>
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

	async storeMessage(roomId: string, senderId: string, content: string)
	{
		const message = new this.messageModel({
			roomId,
			senderId,
			content,
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

	async getChatRooms(userId: string)
	{
		return await this.chatRoomModel.find({participants: userId })
		.populate('lastMessage')
		.sort({ updatedAt: -1 });
	}

}