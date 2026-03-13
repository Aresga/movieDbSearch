import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePasswordDto } from './dto/update.password.dto';
import * as bcrypt from 'bcrypt'
import { SetPasswordDto } from './dto/set-password.dto';

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  isTwoFactorEnabled: true,
  provider: true,
  isOnline: true,
  bio: true,
  createdAt: true,
  password: true,
};

const safeUserSelectPublic = {
  id: true,
  username: true,
  avatarUrl: true,
  isOnline: true,
  bio: true,
  createdAt: true,
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelectPublic,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');

    const { password, ...rest } = user;

    return {
      ...rest,
      hasPassword: !!password,
    };
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    if (dto.username) {
      const verifyuser = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      })
      if (verifyuser) throw new ConflictException('Username already in use')
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.delete({
      where: { id }
    });
    if (!user) throw new NotFoundException('User not found');
  }


  async setTwoFactorSecret(id: string, secret: string) {
    await this.prisma.user.update({
      where: { id },
      data: { twoFactorSecret: secret },
    });
  }

  async enableTwoFactor(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isTwoFactorEnabled: true },
    });
  }

  async disableTwoFactor(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      }
    });
  }

  async findTwoFactorSecret(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { twoFactorSecret: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.twoFactorSecret;
  }

  async updateEmail(id: string, newEmail: string) {
    const existing = await this.prisma.user.findFirst({
      where: { email: newEmail, NOT: { id }},
    })

    if (existing) throw new ConflictException('Email already in use')

    return this.prisma.user.update({
      where: { id },
      data: { email: newEmail },
      select: { email: true },
    })
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new NotFoundException('User not found ')
    if (!user.password) throw new BadRequestException('Your account uses OAuth login and has no password. Please set a password first.')

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password)
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect')

    const hashed = await bcrypt.hash(dto.newPassword, 10)

    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    })

    return { message: 'Password updated successfully'}
  }

  async setPassword(id: string, dto: SetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) throw new NotFoundException('User not found ')
    if (user.password) throw new BadRequestException('Use password instead')

    const hashed = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    })

    return { message: 'Password set successfully' }
  }

}
