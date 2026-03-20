import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
// import { access } from 'fs';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    private setTokenCookies(res: Response, access_token: string, refresh_token: string) {
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: false, // for now 
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, // 15 min 
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // a week
        });
    }

    private clearTokenCookies(res: Response) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
    }



    @Post('register')
    async register(@Body() RegisterDto: RegisterDto) {
        const { id, username } = await this.authService.register(RegisterDto);
        return {
            message: 'user registered successfully',
            id,
            username,
        };
    }

    @UseGuards(LocalAuthGuard) 
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Request() req, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(req.user);

        if (result.requiresTwoFactor) {
            // if 2FA is enables we return a short lived partial access token without a refresh token yet
            res.cookie('access_token', result.access_token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 5 * 60 * 1000,
            });
            return { requiresTwoFactor: true };
        }

        this.setTokenCookies(res, result.access_token, result.refresh_token);
        return { user: result.user };
    }

    // --- refresh -----// 

    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response ) {
        const result = await this.authService.refreshTokens(
            req.user.sub,
            req.user.refreshToken,
        );
        this.setTokenCookies(res, result.access_token, result.refresh_token);
        return { user: result.user };
    }




    // --- google/Github OAuth --- // 

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {}

    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubAuth() {}

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const result = await this.authService.login(user);

        if (result.requiresTwoFactor) {
            return res.redirect('http://localhost:5173/auth/callback?error=2fa_required')
        }

        this.setTokenCookies(res, result.access_token, result.refresh_token);
        res.redirect(`http://localhost:5173/auth/callback?success=true`);
    }


    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const result = await this.authService.login(user);

        if (result.requiresTwoFactor) {
            return res.redirect('http://localhost:5173/auth/callback?error=2fa_required')
        }

        this.setTokenCookies(res, result.access_token, result.refresh_token);
        res.redirect(`http://localhost:5173/auth/callback?success=true`);
    }


    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.sub);
        this.clearTokenCookies(res);
        return { message: 'Logged out succesfully' };
    }

}
