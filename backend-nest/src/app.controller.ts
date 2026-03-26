import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { TmdbService } from './tmdb/tmdb.service';
import { ParamsTokenFactory } from '@nestjs/core/pipes';

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

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 5,
  ) {
    if (!query) {
      throw new BadRequestException('Query param "q" is required');
    }
    const results = await this.appService.searchMovies(query, limit);
    return results;
  }

  @Get('movie/:id')
  async fetchmovie(@Param('id', ParseIntPipe) tmdbId: number) {
    return this.appService.findMovie(tmdbId);
  }

  @Get('trending')
  async trending(@Query('limit') limit: number = 20) {
    return this.appService.getTrending(limit);
  }

  @Get('movie/:id/full')
  async movieFull(
    @Param('id', ParseIntPipe) tmdbId: number,
    @Query('lang') lang: string = 'en-US',
  ) {
    return this.tmdb.getMovieFull(tmdbId, lang)
  }

}
