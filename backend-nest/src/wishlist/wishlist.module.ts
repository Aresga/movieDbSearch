import { Module } from '@nestjs/common';
import { WishListService } from './wishlist.service';
import { WishListController } from './wishlist.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TmdbModule } from 'src/tmdb/tmdb.module';

@Module({
  imports: [PrismaModule, TmdbModule],
  providers: [WishListService],
  controllers: [WishListController]
})
export class WishListModule {}
