import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnershipGuard } from 'src/auth/guards/ownership.guard';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { SetPasswordDto } from './dto/set-password.dto';

// @UseGuards(JwtAuthGuard, OwnershipGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.userService.findByIdPublicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/email')
  updateEmail(@Request() req, @Body() dto: UpdateEmailDto) {    
    return this.userService.updateEmail(req.user.id, dto.email)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/password')
  setPassword(@Request() req, @Body() dto: SetPasswordDto) {
    return this.userService.setPassword(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteMe(@Request() req) {
    return this.userService.deleteUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/export')
  exportMyData(@Request() req) {
    return this.userService.exportData(req.user.id);
  }

}
