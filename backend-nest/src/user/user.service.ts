import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  isTwoFactorEnabled: true,
  provider: true,
  isOnline: true,
  createdAt: true,
};

const safeUserSelectPublic = {
  id: true,
  username: true,
  avatarUrl: true,
  isOnline: true,
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
    return user;
  }

  // async findByEmail(email: string) {
    
  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //     select: { safeUserSelect },
  //   });
  //   if (!user) throw new NotFoundException('User not found');
  //   return user;

  // }

  async updateProfile(id: string, dto: UpdateUserDto) {
    const updatedUser = this.prisma.user.update({
      where: { id },
      data: dto,
      select: safeUserSelect,
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

}
