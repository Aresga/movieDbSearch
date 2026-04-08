import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ChatRoom, ChatRoomSchema } from './chat-room.schema';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Message.name, schema: MessageSchema },
			{ name: ChatRoom.name, schema: ChatRoomSchema },
		]),
		PrismaModule,
	],
		controllers: [MessageController],
		providers: [MessageService],
		exports: [MessageService],
})
export class MessageModule {}