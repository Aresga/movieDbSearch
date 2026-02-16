import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';
import { GithubAuthGuard } from './guards/github-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() RegisterDto: RegisterDto) {
        const user = await this.authService.register(RegisterDto);
        return {
            message: 'user registered successfully',
            user,
        };
    }

    @UseGuards(LocalAuthGuard) 
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Request() req) {
        const access_token = await this.authService.login(req.user);
        return {
            message: 'Login Succesful',
            access_token,
            user: {
                id: req.user.id,
                email: req.user.email,
                username: req.user.username,
            }
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request( ) req) {
        return {
            message: 'This is a protected route', 
            user: req.user,
        };
    }


    // --- google auoth --- // 
    // user click google oauth 
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Request() req) {
    console.log('🚀 Starting Google OAuth flow...');
    console.log('Request query:', req.query);
    console.log('Request headers:', req.headers.host);
    }

    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubAuth(@Request() req) {
    console.log('🚀 Starting Google OAuth flow...');
    console.log('Request query:', req.query);
    console.log('Request headers:', req.headers.host);
    }



    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const { access_token } = await this.authService.login(user);
        res.redirect(`http://localhost:5173/auth/callback?token=${access_token}`);
    }


    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const { access_token } = await this.authService.login(user);
        res.redirect(`http://localhost:5173/auth/callback?token=${access_token}`);
    }

}
