import { 
  BadRequestException, 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TmdbService } from 'src/tmdb/tmdb.service';

@Injectable()
export class WishListService {
  constructor(private prisma: PrismaService,
    private tmdbService: TmdbService,
  ) {}

  async getWishList(userId: string) {
    return this.prisma.wishList.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { addedAt: 'desc'},
    });
  }

  async isInWishList(userId: string, tmdbId: number): Promise<boolean> {
    const count = await this.prisma.wishList.count({
      where: { 
        userId,
        movie: { tmdb_id: tmdbId },
      }
    });
    return count > 0;
  }
/*
  async isInWishList(userId: string, tmdbId: number): Promise<boolean> {
    const movie = await this.prisma.movies.findUnique({
      where: { tmdb_id: tmdbId },
    });
    if (!movie)
      return false;
    const wish = await this.prisma.wishList.findUnique({
      where: {
        userId_movieId: {
          userId, 
          movieId: movie.id,
        }
      },
    });
    if (!wish)
      return false;
    return true;
  }
*/

  async addToWishList(userId: string, tmdbId: number) {
    try {
      const movie = await this.prisma.movies.findUnique({
        where: {tmdb_id: tmdbId},
      });
      if (!movie)
          throw new NotFoundException('Movie information not found on TMDB');
      const entry = await this.prisma.wishList.create({
        data: {
          userId,
          movieId: movie.id,
        }
      }); 
      return {
        message: 'WishList added successfully',
        data: entry
      };
    } catch(error) {
      if (error instanceof NotFoundException)
        throw error;
      if (error.code === 'P2002')
        throw new BadRequestException('This movie is already in your wishList');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while adding to wishList');
    } 
  }
  
  async removeFromWishList(userId: string, tmdbId: number){
    try {
      const movie = await this.prisma.movies.findUnique({
        where: { tmdb_id: tmdbId },
      });
      if (!movie)
        throw new NotFoundException('Movie not found in our database');
      await this.prisma.wishList.delete({
        where: {
          userId_movieId : {
            userId,
            movieId: movie.id,
          }
        }
      });
      return {
        message: 'Movie removed from wishList successfully',
      };
    } catch(error) {
      if (error instanceof NotFoundException)
        throw error;
      if (error.code === 'P2025')
        throw new BadRequestException('This movie is not in your wishList');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while removing from wishList');
    }
  }
}
