import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const safeFriendsSelect = {
    id: true,
    username: true,
    avatarUrl: true,
    // email: true,
};


@Injectable()
export class FriendsService {
    constructor(private readonly prisma: PrismaService) {}

    async addFriend(userId: string, friendId: string) {
        if (userId === friendId)
            throw new BadRequestException('Cannot add yourself as a friend');

        const friend = await this.prisma.user.findUnique({
            where: { id: friendId }
        });

        if (!friend)
            throw new NotFoundException('User not found');

        // write both side, so it bocome mutual friendship
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { friends: { connect: { id: friendId }}},
            }),
            this.prisma.user.update({
                where: { id: friendId },
                data: { friends: { connect: { id: userId }}},
            }),
        ]);

        return {
            message: 'Friend added succesfully'
        };
    }

    async removeFriend(userId: string, friendId: string) {
        const friend = await this.prisma.user.findUnique({
            where: { id: friendId },
        });
        if (!friend) throw new NotFoundException('User Not found');

        const areFriends = await this.prisma.user.findFirst({
            where: {
                id: userId,
                friends: { some: { id: friendId }},
            },
        });
        if (!areFriends) throw new BadRequestException('You are not friends');

        // disconnect both 
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { friends: { disconnect: { id: friendId }}},
            }),

            this.prisma.user.update({
                where: { id: friendId },
                data: { friends: { disconnect: { id: userId } } },
            }),
        ]);

        return {
            message: 'Friend removed succesfully'
        };
    }

    async getFriends(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                friends: { select: safeFriendsSelect },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user.friends;
    }
}
