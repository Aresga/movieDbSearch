import { Controller, Get, Post, Delete, Request, UseGuards, Body, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReviewsService } from './review.service';
import { ReviewDto } from './dto';

@Controller('reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Get('movie/reviews/:movieId')
	getReviewsByMovie(@Request() req, @Param('movieID') movieId: number) {
		return this.reviewsService.getReviewsbyMovie(movieId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('movie/reviews/:movieId')
	postReview(@Request() req, @Param('movieID') movieId: number, @Body() dto: ReviewDto) {
		return this.reviewsService.saveReview(dto.rating, dto.comment, req.user.id, movieId);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('movie/reviews/:reviewID')
	deleteReview(@Request() req, @Param('movieId') movieId: number) {
		return this.reviewsService.deleteReview(req.user.id, movieId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('user/reviews/:userID')
	getReviewsByUser(@Request() req, @Param('userId') userId: string) {
		return this.reviewsService.getReviewsByUser(userId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('movie/reviews/:movieId/edit')
	editReview(@Request() req, @Param('movieID') movieId: number, @Body() dto: ReviewDto) {
		return this.reviewsService.editReview(movieId, req.user.id, dto.rating, dto.comment);
	}

}