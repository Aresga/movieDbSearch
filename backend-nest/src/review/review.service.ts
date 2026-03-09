import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewsService {
	constructor(private readonly prisma: PrismaService) {}
	async saveReview(rating: number, comment:string, userId: string, movieId: number)
	{
		const previousReview = await this.getSingleReview(movieId, userId);
		if (previousReview == null)
			return this.prisma.review.create({
			data: {
				rating,
				comment,
				userId,
				movieId,
			}});
	}

	async getReviewsbyMovie(mId: number)
	{
		return this.prisma.review.findMany({
			where: { movieId: mId }
		});
	}

	async getReviewsByUser(uId: string)
	{
		return this.prisma.review.findMany({
			where: { userId: uId }
		});
	}

	async deleteReview(uId: string, mId: number)
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

	async getSingleReview(mId: number, uId: string)
	{
		return this.prisma.review.findUnique({
			where: { userId_movieId: 
				{
					userId: uId,
					movieId: mId
				}
			}
		});	
	}


}