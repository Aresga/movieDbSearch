import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query, Req } from '@nestjs/common';
import { MessageService, MenuRoom } from './message.service'
import { CreateMessageDto } from './dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post('rooms/create/:friendId')
	async getCreateRoom(@Request() req, @Param('friendId') userId2: string)
	{
		const room = await this.messageService.getCreateRoom(
			req.user.id,
			userId2,
		);
		return room;
	}

	@Post('rooms/:roomId/chat')
	async sendMessage( @Request() Req, @Param('roomId') roomId: string, @Body() dto: CreateMessageDto,)
	{
		const message = await this.messageService.storeMessage(roomId, Req.user.id, dto.content);
		return (message);
	}

	@Get('rooms/:userId')
	async getUserRooms(@Request() req) {
		return await this.messageService.getChatRooms(req.user.id)
	}

	@Get('menu/rooms')
	async getMenuRooms(@Request() req): Promise<MenuRoom[]> {
  		return this.messageService.getMenuRooms(req.user.id);
	}

	@Get('rooms/:roomId/messages')
	async getRoomMessages(@Request() Req, @Param('roomId') roomId: string)
	{
		return await this.messageService.getRoomMessages(roomId);
	}

	@Get('/rooms/:roomId/info')
	async getRoomInfo(@Request() Req, @Param('roomId') roomId: string)
	{
		const participants = await this.messageService.getRoomParticipants(roomId);
		return { participants };
	}

	@Post('/rooms/:roomId/messages')
	async markAsRead(@Request() Req, @Param('roomId') roomId: string)
	{
		return await this.messageService.markAsRead(roomId, Req.user.id);
	}
}
