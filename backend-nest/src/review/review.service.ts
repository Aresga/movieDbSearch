import { Injectable, NotFoundException } from '@nestjs/common';
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

	async getReviewsbyMovie(mId: string)
	{
		return this.prisma.review.findMany({
			where: { movieId: movieId }
		});
	}

	async getReviewsByUser(uId: string)
	{
		return this.prisma.review.findMany({
			where: { userId: uId }
		});
	}

	async deleteReview(uId: string, mId: string)
	{
		return this.prisma.review.delete({
			where: { userId_movieId: 
				{
					userId: uId,
					movieId: mId
				}
			}
		});
	}


}