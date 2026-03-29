import { Controller, Delete, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

/* db schema for wishlist
model Wishlist {
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
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

// Read the user's wishlist
  @Get()
  getMyWishlist(@Request() req) {
  return this.wishlistService.getWishlist(req.user.id);
  }

// Read a specific user's wishlist (for friends or any users?)
  @Get('user/:userId')
  getUserWishlist(@Param('userId') userId: string) {
  return this.wishlistService.getWishlist(userId);
  }

// Check if a movie is in the user's wishlist (for heart icon?)
  @Get('status/:movieId')
  isInWishlist(
    @Request() req, 
    @Param('movieId', ParseIntPipe) movieId: number
  ) {
    return this.wishlistService.isInWishlist(req.user.id, movieId);
  }

// Add a movie to the user's wishlist
  @Post(':movieId')
  addToWishlist(
    @Request() req, 
    @Param('movieId', ParseIntPipe) movieId: number
  ) {
    return this.wishlistService.addToWishlist(req.user.id, movieId);
  }

// Remove a movie from the user's wishlist
  @Delete(':movieId')
  removeFromWishlist(
    @Request() req, 
    @Param('movieId', ParseIntPipe) movieId: number
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, movieId);
  } 
}