import { 
  BadRequestException, 
  Injectable, 
  NotFoundException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TmdbService } from 'src/tmdb/tmdb.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService,
    private tmdbService: TmdbService,
  ) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { addedAt: 'desc'},
    });
  }

  async isInWishlist(userId: string, tmdb: number): Promise<boolean> {
    const movie = await this.prisma.movies.findUnique({
      where: { tmdb_id: tmdb },
      include: { wishlist: {
        where: { userId }
      }},
    });
    return !!movie?.wishlist?.length;
  }
/*
  async isInWishlist(userId: string, tmdb: number): Promise<boolean> {
    const movie = await this.prisma.movies.findUnique({
      where: { tmdb_id: tmdb },
    });
    if (!movie)
      return false;
    const wish = await this.prisma.wishlist.findUnique({
      where: {
        userId_movieId: {
          userId, 
          movieId: movie.id,
        }},
      });
    if (!wish)
      return false;
    return true;
  }
*/

  async addToWishlist(userId: string, tmdb: number) {
    try {
      let movie = await this.prisma.movies.findUnique({
        where: {tmdb_id: tmdb},
      });
      // when the movies not exists in our database,
      // fetch from TMDB and save it to ours
      if (!movie)
      {
        const tmdbMovie = await this.tmdbService.getMovieFull(tmdb);
        if (!tmdbMovie)
          throw new NotFoundException('Movie information not found on TMDB');
        movie = await this.prisma.movies.create({
          data: {
            tmdb_id: tmdb,
            title: tmdbMovie.title,
            overview: tmdbMovie.overview,
            genres: tmdbMovie.genres?.map((g:any) => g.name) || [],
            tagline: tmdbMovie.tagline,
            release_year: tmdbMovie.release_date
              ? new Date(tmdbMovie.release_date).getFullYear(): null,
            vote_average: tmdbMovie.vote_average,
            vote_count: tmdbMovie.vote_count,
            runtime: tmdbMovie.runtime,
            popularity: tmdbMovie.popularity,
            poster_path: tmdbMovie.poster_path,
            backdrop_path: tmdbMovie.backdrop_path,
          }
        });
      }
      const entry = await this.prisma.wishlist.create({
        data: {
          userId: userId,
          movieId: movie.id,
        }
      }); 
      return {
        message: 'Wishlist added successfully',
        data:entry
      };
    } catch (error){
      if (error.code === 'P2002')
        throw new BadRequestException('This movie is already in your wishlist');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while adding to wishlist');
    } 
  }
  
  async removeFromWishlist(userId: string, tmdb: number){
    try {
      const movie = await this.prisma.movies.findUnique({
        where: {tmdb_id: tmdb},
      });
      if (!movie)
        throw new NotFoundException('Movie not found in our database');
      await this.prisma.wishlist.delete({
        where: {
          userId_movieId : {
            userId: userId,
            movieId: movie.id,
          }
        }
      });
      return {
        message: 'Movie removed from wishlist successfully',
      };
    } catch (error){
      if (error.code === 'P2025')
        throw new BadRequestException('This movie is not in your wishlist');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while removing from wishlist');
    }
  }
}
