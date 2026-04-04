import { Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) { }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  addFriend(@Request() req, @Param('id') friendId: string) {
    return this.friendsService.addFriend(req.user.id, friendId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeFriend(@Request() req, @Param('id') friendId: string) {
    return this.friendsService.removeFriend(req.user.id, friendId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Get(':id/count')
  getFriendsCount(@Param('id') userId: string) {
    return this.friendsService.getFriendsCount(userId);
  }

}
