import { Injectable, HttpException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom, NotFoundError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

interface PyResponse {
  query: string;
  results: {
    title: string;
    plot: string;
    url: string;
    match_score: number;
  }[];
}

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private prisma: PrismaService
  ) {}

  health(): object {
    return {
      message: 'Healthy',
      version: '1.0.0'
    };
  }

  async searchMovies(query: string, limit: number = 5) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    
    if (!baseUrl) {
      throw new Error('AI_SERVICE_URL is not defined');
    }
    
    const cleanBase = baseUrl.replace(/\/$/, '');
    const fullUrl = `${cleanBase}/search`;

    try {
      const response = await lastValueFrom(
        this.httpService.get<PyResponse>(fullUrl, {
          params: { q: query, limit }
        }).pipe(
          map((res) => res.data)
        )
      );
      return { movies: response.results };

    } catch (error) {
      console.error("Error connecting to ai backend micro", error.message);
      throw new HttpException("The Movie Ai is currently unavailable", 503);
    }
  }

  async findMovie(tmdb: number) {
    const movie = await this.prisma.movies.findUnique({
      where: { tmdb_id: tmdb },
      select: {
              id: true,
              tmdb_id: true,
              title: true,
              overview: true,
              genres: true,
              tagline: true,
              release_year: true,
              vote_average: true,
              vote_count: true,
              runtime: true,
              popularity: true,
              poster_path: true,
              backdrop_path: true,
            }
    });

  if (!movie)
    throw new NotFoundException('Movie not found');

  return movie
  }

  async getTrending(limit: number = 20) {
    const movies = await this.prisma.movies.findMany({
      where: {
        popularity: { not: null },
        poster_path: { not: null },
      },
      orderBy: { popularity: 'desc' },
      take: limit,
      select: {
              id: true,
              tmdb_id: true,
              title: true,
              overview: true,
              genres: true,
              tagline: true,
              release_year: true,
              vote_average: true,
              vote_count: true,
              runtime: true,
              popularity: true,
              poster_path: true,
              backdrop_path: true,
            },
    });
    return { movies };
  }

  async analyzeSentiment(text: string) {
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL')

    if (!baseUrl) {
      throw new Error('AI_SERVICE_URL is not defined');
    }
    
    const cleanBase = baseUrl.replace(/\/$/, '')

    try {
      const response = await lastValueFrom(
        this.httpService.post<{ label: string; score: number }>(
          `${cleanBase}/sentiment`,
          { text }
        ).pipe(map((res) => res.data))
      )
      return response
    } catch (error) {
      // don't block review creation if sentiment fails
      console.error('Sentiment analysis failed:', error.message)
      return null
    }
  }



}
