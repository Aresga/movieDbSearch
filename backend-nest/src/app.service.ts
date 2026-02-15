import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
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
  
  getHello(): object {
    return {message: 'Hello World!'};
  }

  health(): object {
    return {
      message: 'I\'m NestJs and I\'m healthy',
      version: '1.0.0'
    };
  }



  async searchMovies(query: string) {
    // where python lives
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    
    if (!baseUrl) {
      throw new Error('AI_SERVICE_URL is not defined');
    }
    
    const cleanBase = baseUrl.replace(/\/$/, '');
    const fullUrl = `${cleanBase}/search`;

    try {
      const response = await lastValueFrom(
        this.httpService.get<PyResponse>(fullUrl, {
          params: { q: query, limit:2 }
        }).pipe(
          map((res) => res.data) // data part of resp
        )
      );
      return {
        source: 'Ai_Engine',
        count: response.results.length,
        movies: response.results
      };

    } catch (error) {
      console.error("Error connecting to ai backend micro", error.message);
      throw new HttpException("The Movie Ai is currently unavailable", 503);
    }
  }



}
