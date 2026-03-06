import { Controller, Get, Post, Delete, Request, UseGuards, Body, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReviewsService } from './review.service';
import { ReviewDto } from './dto';

@Controller('reviews')
export class Reviews {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Get(':reviews')
	getReviews(@Request() req, @Param('movieID') movieId: string) {
		return this.reviewsService.getReviewsbyMovie(movieId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('postReview')
	postReview(@Request req, @Param('movieID') movieId: number, @Body() dto: ReviewDto)
	{
		return this.reviewsService.saveReview(dto.rating, dto.comment, req.user.id, movieId);
	}

	@UseGuards(JwtAuthGuard)

}