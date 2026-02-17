import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): object {
  //   return this.appService.getHello();
  // }

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
    const results = await this.appService.searchMovies(query, limit);  // 👈 pass it
    return results;
  }


}
