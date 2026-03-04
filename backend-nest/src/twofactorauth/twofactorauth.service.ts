import { Injectable } from '@nestjs/common';
import { generateSecret, verify, generateURI } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class TwofactorauthService {
    generateSecret(userEmail: string): { secret: string; otpauthUrl: string } {
        const secret = generateSecret();
        const otpauthUrl = generateURI({
            issuer: 'MovieDbsearch',
            label: userEmail,
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
}
