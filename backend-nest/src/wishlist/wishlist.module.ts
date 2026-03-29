import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TmdbModule } from 'src/tmdb/tmdb.module';

@Module({
  imports: [PrismaModule, TmdbModule],
  providers: [WishlistService],
  controllers: [WishlistController]
})
export class WishlistModule {}
