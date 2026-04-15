import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { TmdbService } from './tmdb/tmdb.service';
import { ParamsTokenFactory } from '@nestjs/core/pipes';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { User } from './user/entities/user.entity';
import { OptionalJwtAuthGuard } from './auth/guards/optional-guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tmdb: TmdbService,
  ) {}

  @Get('health')
  health(): object {
    return this.appService.health();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 5,
    @Req() req,
  ) {
    if (!query) {
      throw new BadRequestException('Query param "q" is required');
    }
    const userId = req.user?.id;
    const results = await this.appService.searchMovies(query, page, size, userId);
    return results;
  }

  @Get('movie/:id')
  async fetchmovie(@Param('id', ParseIntPipe) tmdbId: number) {
    return this.appService.findMovie(tmdbId);
  }

  @Get('trending')
  async trending(
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
  ) {
    return this.appService.getTrending(page, size);
  }

  @Get('movie/:id/full')
  async movieFull(
    @Param('id', ParseIntPipe) tmdbId: number,
    @Query('lang') lang: string = 'en-US',
  ) {
    return this.tmdb.getMovieFull(tmdbId, lang)
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  async getRecommendations(
    @Req() req,
    @Query('limit') limit: number = 20,
  ) {
    return this.appService.getRecommendations(req.user.id, limit);
  }


}
