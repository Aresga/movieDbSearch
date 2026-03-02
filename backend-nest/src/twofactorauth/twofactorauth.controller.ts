import { Controller, Req, UseGuards, Get, Post, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TwofactorauthService } from './twofactorauth.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { TwoFactorTokenDto } from 'src/twofactorauth/dto/twofactorToken.dto';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwofactorauthController {
    constructor(
        private readonly twofactorauthservice: TwofactorauthService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    // Generate secret and qr code for authenticated user
    @Get('setup')
    async setup(@Req() req) {
        const { secret, otpauthUrl } = this.twofactorauthservice.generateSecret(req.id);

        // store secret temp
        await this.userService.setTwoFactorSecret(req.user.id, secret);
        const qrcode = await this.twofactorauthservice.generateQrCode(otpauthUrl);
        return { qrcode };
    }


    @Post('activate')
    @HttpCode(200)
    async activate(@Req() req, @Body() dto: TwoFactorTokenDto) {
        const secret = await this.userService.findTwoFactorSecret(req.user.id);
        if (!secret) throw new UnauthorizedException('2FA setup not initialized')
        const isValid = this.twofactorauthservice.verifyToken(dto.token, secret);
        if (!isValid) throw new UnauthorizedException('Invalid authentication code');

        await this.userService.enableTwoFactor(req.user.id);
        return {
            message: '2FA activated successfully'
        };
    }

    @Post('verify')
    @HttpCode(200)
    async verify(@Req() req, @Body() dto: TwoFactorTokenDto) {
        const user = await this.userService.findById(req.user.id);
        if (!user.isTwoFactorEnabled) throw new UnauthorizedException('2FA is not enabled');

        const secret = await this.userService.findTwoFactorSecret(req.user.id);
        if (!secret) throw new UnauthorizedException('2FA setup not initialized')

        const isValid = await this.twofactorauthservice.verifyToken(dto.token, secret);
        console.log('secret:', secret);
        console.log('token:', dto.token);
        console.log('isValid:', isValid);
        if (!isValid) throw new UnauthorizedException('Invalid authentication code');


        return this.authService.loginWith2FA(user);
    }
}
