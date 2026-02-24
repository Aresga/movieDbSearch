import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post(':id')
  addFriend(@Request() req, @Param('id') friendId: string) {
    return this.friendsService.addFriend(req.user.id, friendId);
  }

  @Delete(':id')
  removeFriend(@Request() req, @Param('id') friendId: string) {
    return this.friendsService.removeFriend(req.user.id, friendId);
  }

  @Get()
  getFriends(@Request() req) {
    
    return this.friendsService.getFriends(req.user.id);
  }
}
