import { Injectable, NotFoundException } from '@nestjs/common';
import { generateSecret, verify, generateURI } from 'otplib';
import * as qrcode from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TwofactorauthService {
    constructor (
        private readonly prisma: PrismaService,
    ) {}

    generateSecret(username: string): { secret: string; otpauthUrl: string } {
        const secret = generateSecret();
        const otpauthUrl = generateURI({
            issuer: 'MovieDbsearch',
            label: username,
            secret,
        });
        return { secret, otpauthUrl };
    }

    async generateQrCode(otpauthUrl: string) {
        return qrcode.toDataURL(otpauthUrl);
    }

    async verifyToken(token: string, secret: string): Promise<boolean> {
        const result = await verify({ token, secret });
        return result.valid;
    }

    async disable2FA(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { isTwoFactorEnabled: false, twoFactorSecret: null },
        })
        return { message: '2FA disabled successfully' }
    }
}
