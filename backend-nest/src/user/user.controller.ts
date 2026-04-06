import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { R2AvatarService } from './r2-avatar.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { OwnershipGuard } from 'src/auth/guards/ownership.guard';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { SetPasswordDto } from './dto/set-password.dto';

const AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

// Static `me` routes must be declared before `Get(':id')` so they are not shadowed.
// @UseGuards(JwtAuthGuard, OwnershipGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly r2Avatar: R2AvatarService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: AVATAR_MAX_BYTES } }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Missing file');
    }
    if (!AVATAR_MIME.includes(file.mimetype as (typeof AVATAR_MIME)[number])) {
      throw new BadRequestException('Use JPEG, PNG, WebP, or GIF');
    }
    return this.r2Avatar.putAvatarObject(req.user.id, file.buffer, file.mimetype);
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.userService.findByIdPublicProfile(id);
  }

}
