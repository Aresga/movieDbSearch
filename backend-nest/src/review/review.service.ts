import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
	constructor(private readonly prisma: PrismaService) {}

	private async findMovieByTmdbId(tmdbId: number) {
		const movie = await this.prisma.movies.findUnique({
			where: { tmdb_id: tmdbId },
			select: { id: true },
		});
		if (!movie) throw new NotFoundException(`Movie with tmdb_id ${tmdbId} not found`);
		return movie;
	}

	async saveReview(rating: number, comment: string | null, userId: string, tmdbId: number) {
		const movie = await this.findMovieByTmdbId(tmdbId);

		const previousReview = await this.getSingleReview(movie.id, userId);
		if (previousReview) {
			throw new ConflictException('You have already reviewed this movie');
		}

		return this.prisma.review.create({
			data: { rating, comment, userId, movieId: movie.id },
			include: this.userSelect,
		});
	}

	private readonly userSelect = {
		user: {
			select: {
				id: true,
				username: true,
				avatarUrl: true,
			},
		},
	};

	async getReviewsbyMovie(tmdbId: number) {
		const movie = await this.findMovieByTmdbId(tmdbId);
		return this.prisma.review.findMany({
			where: { movieId: movie.id },
			include: this.userSelect,
		});
	}

	async getReviewsByUser(uId: string) {
		return this.prisma.review.findMany({
			where: { userId: uId },
			include: this.userSelect,
		});
	}

	async deleteReview(uId: string, tmdbId: number) {
		const movie = await this.findMovieByTmdbId(tmdbId);
		const existing = await this.getSingleReview(movie.id, uId);
		if (!existing) {
			throw new NotFoundException('Review not found');
		}
		return this.prisma.review.delete({
			where: {
				userId_movieId: {
					userId: uId,
					movieId: movie.id,
				},
			},
		});
	}

	async getSingleReview(mId: number, uId: string) {
		return this.prisma.review.findUnique({
			where: {
				userId_movieId: {
					userId: uId,
					movieId: mId,
				},
			},
		});
	}

	async editReview(tmdbId: number, uId: string, ratingEdit: number, commentEdit: string | null) {
		const movie = await this.findMovieByTmdbId(tmdbId);
		return this.prisma.review.update({
			where: { userId_movieId: { userId: uId, movieId: movie.id } },
			data: { comment: commentEdit, rating: ratingEdit },
			include: this.userSelect,
		});
	}
}