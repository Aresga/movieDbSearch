import { Injectable, NotFoundException } from '@nestjs/common';
import { Reviews } from './review.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
	constructor(private readonly prisma: PrismaService) {}
	async saveReview(rating: number, comment:string, userId: string, movieId: number)
	{
		const date = new Date();
		return this.prisma.review.create({
			rating,
			comment,
			userId,
			movieId,
			date,
		});
	}

	async getReviewsbyMovie(movieId: string)
	{
		return this.prisma.review.findMany({
			where: { id: movieId }
		});
	}

	async getReviewsByUser(userId: string)
	{
		return this.prisma.review.findMany({
			where: { id: userId }
		});
	}

	async deleteReview(userId: string, movieId: string)
	{
		return this.prisma.review.delete({
			where: { userId }
		});
	}


}