import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageService } from './message.service'

@Controller('message')
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Post()
	create(@Body() body: { text: string})
	{
		return this.messageService.create(body.text);
	}

	@Get()
	findAll()
	{
		return this.messageService.findAll();
	}
}
