import { Controller, Get, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

    @UseGuards(LocalAuthGuard) // calidate credntials using localstrategy 
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);

    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request( ) req) {
        return {
            message: 'This is a protected route', 
            user: req.user,
        };
    }
}
