import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFile } from 'fs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
    private baseUrl = 'https://api.themoviedb.org/3'

    constructor(
        private http: HttpService,
        private config: ConfigService,
    ) {}

    private authHeader() {
        const token = this.config.get<string>('TMDB_KEY')
        if (!token) throw new Error('tmdb token missing')
            return { Authorization: `Bearer ${token}` }
    }

    async getMovieFull(tmdbId: number, language = 'en-US') {
        const url = `${this.baseUrl}/movie/${tmdbId}`
        const res = this.http.get(url, {
            headers: this.authHeader(), 
            params: {
                language,
                append_to_response: 'credits,videos,similar',
            },
        })
        const { data } = await lastValueFrom(res)
        return data
    }
}
