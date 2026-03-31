import { Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WishListService } from './wishlist.service';

/* db schema for wishList
model WishList {
  id     Int    @id @default(autoincrement())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  movieId Int
  movie   movies @relation(fields: [movieId], references: [id], onDelete: Cascade)

  addedAt DateTime @default(now())

  @@unique([userId, movieId])
  @@index([userId])
  @@index([movieId])
}
*/

@UseGuards(JwtAuthGuard)
@Controller('wish')
export class WishListController {
  constructor(private readonly wishListService: WishListService) {}

// Read the user's wishList
  @Get()
  getMyWishList(@Request() req) {
    return this.wishListService.getWishList(req.user.id);
  }

// Read a specific user's wishList (for friends or any users?)
  @Get('user/:userId')
  getUserWishList(@Param('userId') userId: string) {
    return this.wishListService.getWishList(userId);
  }

// Check if a movie is in the user's wishList (for heart icon?)
  @Get('status/:movieId')
  isInWishList(
    @Request() req, 
    @Param('movieId', ParseIntPipe) tmdbId: number
  ) {
    return this.wishListService.isInWishList(req.user.id, tmdbId);
  }

// Add a movie to the user's wishList
  @Post(':movieId')
  addToWishList(
    @Request() req, 
    @Param('movieId', ParseIntPipe) tmdbId: number
  ) {
    return this.wishListService.addToWishList(req.user.id, tmdbId);
  }

// Remove a movie from the user's wishList
  @Delete(':movieId')
  removeFromWishList(
    @Request() req, 
    @Param('movieId', ParseIntPipe) tmdbId: number
  ) {
    return this.wishListService.removeFromWishList(req.user.id, tmdbId);
  } 
}