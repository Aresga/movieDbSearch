import { 
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
 } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TmdbService } from 'src/tmdb/tmdb.service';

@Injectable()
export class WatchedListService {
  constructor(private prisma: PrismaService,
    private tmdbService:TmdbService,
  ) {}

  async getWatchedList(userId: string) {
    return this.prisma.watchedList.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { watchedAt: 'desc'}
    })
  }

  async isInWatchedList(userId: string, tmdbId: number): Promise<boolean> {
    const count = await this.prisma.watchedList.count({
      where: {
        userId,
        movie: { tmdb_id: tmdbId },
      },
    });
    return count > 0;
  }

  async addToWatchedList(userId: string, tmdbId: number) {
    try {
      let movie = await this.prisma.movies.findUnique({
        where: {tmdb_id: tmdbId},
      });
      if (!movie)
      {
        const tmdbMovie = await this.tmdbService.getMovieFull(tmdbId);
        if (!tmdbMovie)
          throw new NotFoundException('Movie information not found on TMDB');
        movie = await this.prisma.movies.upsert({
          where: { tmdb_id: tmdbId},
          update: {},
          create: {
            tmdb_id: tmdbId,
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
          },
        });
      }
      const entry = await this.prisma.watchedList.create({
        data: {
          userId,
          movieId: movie.id
        }
      });
      return {
        message: 'WatchedList added successfully',
        data: entry
      }
    } catch(error) {
      if (error instanceof NotFoundException)
        throw error;
      if (error.code === 'P2002')
        throw new BadRequestException('This movie is already in your watchedList');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while adding to watchedList');
    }
  }
  async removeFromWatchedList(userId: string, tmdbId: number)
  {
    try {
      const movie = await this.prisma.movies.findUnique({
        where: { tmdb_id: tmdbId },
      });
      if (!movie)
        throw new NotFoundException('Movie not found in our database');
      await this.prisma.watchedList.delete({
        where: {
          userId_movieId: {
            userId,
            movieId: movie.id,
          }
        }
      });
      return {
        message: 'Movie removed from watchedList successfully',
      };
    } catch(error) {
      if (error instanceof NotFoundException)
        throw error;
      if (error.code === 'P2025')
        throw new BadRequestException('This movie is not in your watchedList');
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while removing from watchedList');
    }

  }
}
