import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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
    private readonly configService: ConfigService
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  health(): string {
    return 'Hello World!, I am healthy';
  }



  async searchMovies(query: string) {
    // where python lives
    const baseUrl = this.configService.get<string>('AI_SERVICE_URL');
    
    if (!baseUrl) {
      throw new Error('Ai_service_url is not defined');
    }
    
    const cleanBase = baseUrl.replace(/\/$/, '');
    const fullUrl = `${cleanBase}/search`;

    try {
      const response = await lastValueFrom(
        this.httpService.get<PyResponse>(fullUrl, {
          params: { q: query, limit:5 }
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
