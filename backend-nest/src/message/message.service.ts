import { Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
	constructor(
		@InjectModel(Message.name) private messageModel: Model<MessageDocument>,
	) {}
	
	async create(text: string) {
		return this.messageModel.create({text});
	}

	async findAll() {
		return this.messageModel.find().sort({
			createdAt: -1}).lean();
	}
}