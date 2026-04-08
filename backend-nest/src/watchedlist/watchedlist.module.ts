import { Module } from '@nestjs/common';
import { WatchedListController } from './watchedlist.controller';
import { WatchedListService } from './watchedlist.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TmdbModule } from 'src/tmdb/tmdb.module';

@Module({
  imports: [PrismaModule, TmdbModule],
  controllers: [WatchedListController],
  providers: [WatchedListService]
})
export class WatchedListModule {}
