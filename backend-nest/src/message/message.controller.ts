import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query, Req } from '@nestjs/common';
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto'

@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post('rooms/:userId')
	async getCreateRoom(@Request() req, @Param('userId') userId2: string)
	{
		const room = await this.messageService.getCreateRoom(
			req.user.id,
			userId2,
		);
		return room;
	}

	@Post('rooms/:roomId/messages')
	async sendMessage( @Request() Req, @Param('roomId') roomId: string, @Body() dto: CreateMessageDto,) 
	{
		const message = await this.messageService.storeMessage(roomId, Req.user.id, dto.content);
		return (message);
	}

	@Get()
	async getUserRooms(@Request() req) {
		return await this.messageService.getChatRooms(req)
	}
}
