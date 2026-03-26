import { Controller, Get, Post, Delete, Req, UseGuards, Body, Param } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReviewsService } from './review.service';
import { ReviewDto } from './dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getReviewsByUser(@Req() req, @Param('userId') userId: string) {
    return this.reviewsService.getReviewsByUser(userId)
  }

  @Get(':movieId')
  getReviewsByMovie(@Param('movieId') movieId: string) {
    return this.reviewsService.getReviewsbyMovie(+movieId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':movieId')
  postReview(@Req() req, @Param('movieId') movieId: string, @Body() dto: ReviewDto) {
    return this.reviewsService.saveReview(dto.rating, dto.comment ?? null, req.user.id, +movieId)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':movieId')
  deleteReview(@Req() req, @Param('movieId') movieId: string) {
    return this.reviewsService.deleteReview(req.user.id, +movieId)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':movieId/edit')
  editReview(@Req() req, @Param('movieId') movieId: string, @Body() dto: ReviewDto) {
    return this.reviewsService.editReview(+movieId, req.user.id, dto.rating, dto.comment ?? null)
  }
}
