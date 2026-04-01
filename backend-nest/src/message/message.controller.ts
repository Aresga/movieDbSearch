import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query, Req } from '@nestjs/common';
import { MessageService, MenuRoom } from './message.service'
import { CreateMessageDto } from './dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('message')
@UseGuards(JwtAuthGuard)
export class MessageController {
	constructor(private readonly messageService: MessageService) {}


	@UseGuards(JwtAuthGuard)
	@Post('rooms/create/:friendId')
	async getCreateRoom(@Request() req, @Param('friendId') userId2: string)
	{
		const room = await this.messageService.getCreateRoom(
			req.user.id,
			userId2,
		);
		return room;
	}

	@UseGuards(JwtAuthGuard)
	@Post('rooms/:roomId/chat')
	async sendMessage( @Request() Req, @Param('roomId') roomId: string, @Body() dto: CreateMessageDto,)
	{
		const message = await this.messageService.storeMessage(roomId, Req.user.id, dto.content);
		return (message);
	}

	@UseGuards(JwtAuthGuard)
	@Get('rooms/:userId')
	async getUserRooms(@Request() req) {
		return await this.messageService.getChatRooms(req.user.id)
	}

	@UseGuards(JwtAuthGuard)
	@Get('menu/rooms')
	async getMenuRooms(@Request() req): Promise<MenuRoom[]> {
  		return this.messageService.getMenuRooms(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('rooms/:roomId/messages')
	async getRoomMessages(@Request() Req, @Param('roomId') roomId: string)
	{
		return await this.messageService.getRoomMessages(roomId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('/rooms/:roomId/info')
	async getRoomInfo(@Request() Req, @Param('roomId') roomId: string)
	{
		const participants = await this.messageService.getRoomParticipants(roomId);
		return { participants };
	}
}
