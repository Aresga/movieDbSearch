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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async updateProfile(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: safeUserSelect,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }

}
