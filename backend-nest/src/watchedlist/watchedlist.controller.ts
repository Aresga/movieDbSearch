import { Controller, Get, UseGuards, Request, Param, ParseIntPipe, Post, Delete } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WatchedListService } from './watchedlist.service';

@UseGuards(JwtAuthGuard)
@Controller('watched')
export class WatchedListController {
  constructor(private readonly watchedListService: WatchedListService) {}

  @Get()
  getMyWatchedList(@Request() req) {
    return this.watchedListService.getWatchedList(req.user.id);
  }

  @Get('user/:userId')
  getUserWatchedList(@Param('userId') userId: string) {
    return this.watchedListService.getWatchedList(userId);
  }

  @Get('status/:movieId')
  isInWatchedList(
    @Request() req,
    @Param('movieId',ParseIntPipe) tmdbId: number
  ) {
    return this.watchedListService.isInWatchedList(req.user.id, tmdbId);
  }

  @Post(':movieId')
  addToWatchedList(
    @Request() req,
    @Param('movieId', ParseIntPipe) tmdbId: number
  ) {
    return this.watchedListService.addToWatchedList(req.user.id, tmdbId);
  }

  @Delete(':movieId')
  removeFromWatchedList(
    @Request() req,
    @Param('movieId', ParseIntPipe) tmdbId: number
  ) {
    return this.watchedListService.removeFromWatchedList(req.user.id, tmdbId);
  }
}
