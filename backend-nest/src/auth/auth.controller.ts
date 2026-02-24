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
            access_token
        };
    }

    // --- google/Github OAuth --- // 

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
    }

    @Get('github')
    @UseGuards(GithubAuthGuard)
    async githubAuth() {
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const { access_token } = await this.authService.login(user);
        
        res.cookie('access_token', access_token, {
            httpOnly: true, // js cant aceess it
            secure:false,  // true if https 
            sameSite: 'lax', // CSRF protection 
            maxAge: 3600000. // 1 hour
        });
        res.redirect(`http://localhost:5173/auth/callback?success=true`);
    }


    @Get('github/callback')
    @UseGuards(GithubAuthGuard)
    async githubAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.findOrCreateAuthUser(req.user);
        const { access_token } = await this.authService.login(user);

        res.cookie('access_token', access_token, {
            httpOnly: true, // js cant aceess it
            secure:false,  // true if https 
            sameSite: 'lax', // CSRF protection 
            maxAge: 3600000. // 1 hour
        });

        res.redirect(`http://localhost:5173/auth/callback?success=true`);
    }


    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Res() res: Response) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        return { 
            message: 'Logged out succesfully'
        };
    }
}
