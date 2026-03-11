import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const safeFriendsSelect = {
    id: true,
    username: true,
    avatarUrl: true,
    isOnline: true,
    // email: true,
};


@Injectable()
export class FriendsService {
    constructor(private readonly prisma: PrismaService) {}

    async addFriend(userId: string, friendIdentifier: string) {
        if (userId === friendIdentifier)
            throw new BadRequestException('Cannot add yourself as a friend');

        const friend = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: friendIdentifier },
                    { username: friendIdentifier },
                    { email: friendIdentifier }
                ]
            }
        });

        if (!friend)
            throw new NotFoundException('User not found');

        // write both side, so it bocome mutual friendship
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { friends: { connect: { id: friend.id }}},
            }),
            this.prisma.user.update({
                where: { id: friend.id },
                data: { friends: { connect: { id: userId }}},
            }),
        ]);

        return {
            message: 'Friend added succesfully'
        };
    }

    async removeFriend(userId: string, friendIdentifier: string) {
        const friend = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { id: friendIdentifier },
                    { username: friendIdentifier },
                    { email: friendIdentifier }
                ]
            }
        });
        if (!friend) throw new NotFoundException('User not found');

        const areFriends = await this.prisma.user.findFirst({
            where: {
                id: userId,
                friends: { some: { id: friend.id }},
            },
        });
        if (!areFriends) throw new BadRequestException('You are not friends');

        // disconnect both 
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { friends: { disconnect: { id: friend.id }}},
            }),

            this.prisma.user.update({
                where: { id: friend.id },
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
