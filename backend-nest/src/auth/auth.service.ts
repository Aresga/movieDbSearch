import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { access } from 'fs';
import ms from 'ms';

// Add these interfaces at the top of the file (or in a types file)
export type LoginResult =
  | { requiresTwoFactor: true; access_token: string }
  | { 
        requiresTwoFactor?: false; 
        access_token: string; 
        refresh_token: string; 
        user: { 
            id: string; 
            email: string; 
            username: string; 
            avatarUrl: string | null 
        } 
    };



@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}


    private getRefreshSecret(): string {
        return this.configService.get<string>('JWT_REFRESH_SECRET')!;
    }

    private getRefreshExpiresIn(): StringValue {
        return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue;
    }

    private async generateTokenPair(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
        };
        
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.getRefreshSecret(),
            expiresIn: this.getRefreshExpiresIn(),
        });

        return { access_token, refresh_token };
    }

    private async saveRefreshToken(userId: string, refreshToken: string) {
        const refreshTokenh = await bcrypt.hash(refreshToken, 10);
        const refreshExpiresMs = ms(this.getRefreshExpiresIn());

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                refreshTokenHash: refreshTokenh,
                refreshTokenExpiresAt: new Date(Date.now() + refreshExpiresMs),
            }
        })
    }

    private async clearRefreshToken(userId: string) {
        await this.prisma.user.update({
            where: { id : userId },
            data: {
                refreshTokenHash: null,
                refreshTokenExpiresAt: null, 
            },
        });
    }


    //
    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (user.refreshTokenExpiresAt.getTime() < Date.now()) {
            await this.clearRefreshToken(userId); // @TODO 
            throw new UnauthorizedException('Refresh token expired');
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash); 
        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokens = await this.generateTokenPair(user);
        await this.saveRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        };
    }


    // validate user creds (used by localstrategy )
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        // check if the user exists and has a pass - not OAuth only
        if (!user || !user.password) {
            return null;
        }

        // compare provided pass with the hashed one 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        // do not return password in results
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }


    async login(user: any): Promise<LoginResult> {
        if (user.isTwoFactorEnabled) {
            const partialPayload = {
                    sub: user.id,
                    email: user.email,
                    username: user.username,
                    isTwoFactorAuthenticated: false,
                };
                return {
                    access_token: this.jwtService.sign(partialPayload, { 
                        expiresIn: '5m'
                    }), requiresTwoFactor: true,
                };
            }
        
        // const payload = {
        //     sub: user.id,
        //     email: user.email,
        //     username: user.username,

        // };

        const tokens = await this.generateTokenPair(user);
        await this.saveRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            // access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            }
        };
    }

    // reg new user
    async register(registerDto: RegisterDto) {
        // check if exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: registerDto.email },
                    { username: registerDto.username }
                ]
            }
        });

        if (existingUser) {
            throw new ConflictException('Email or username already in use');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                username: registerDto.username,
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async findOrCreateAuthUser(oauthData: {
        provider: string;
        providerId: string;
        email: string;
        username: string;
        avatarUrl?: string;
    }) {
        let user = await this.prisma.user.findUnique({
            where: {
                provider_providerId: {
                    provider: oauthData.provider,
                    providerId: oauthData.providerId,
                },
            },
        });

        if (!user) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: oauthData.email },
            });

            if (existingUser) {
                user = await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        provider: oauthData.provider,
                        providerId: oauthData.providerId,
                        avatarUrl: oauthData.avatarUrl || existingUser.avatarUrl,
                    },
                });
            }
        }

        if(!user) {
            let username = oauthData.username;

            while (await this.prisma.user.findUnique({
                where: { username }
            })) {
                const suffix = randomBytes(3).toString('hex');
                username = `${oauthData.username}_${suffix}`;
            }

            user = await this.prisma.user.create({
                data: {
                    email: oauthData.email,
                    username,
                    provider: oauthData.provider,
                    providerId: oauthData.providerId,
                    avatarUrl: oauthData.avatarUrl,
                    password: null,
                },
            });
        }
        const {
            password: _, ...userWithoutPassword 
        } = user;
        return userWithoutPassword;
    }

    async loginWith2FA(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            isTwoFactorAuthenticated: true,
        };


        const tokens = await this.generateTokenPair({ ...user, ...payload });
        await this.saveRefreshToken(user.id, tokens.refresh_token);


        return {
            ...tokens,
            user: { 
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl, 
            }
        };

        // const access_token = this.jwtService.sign(payload);
        // const refresh_token = this.jwtService.sign(payload, {
        //     secret: this.getRefreshSecret(),
        //     expiresIn: this.getRefreshExpiresIn(),
        // });

        // await this.saveRefreshToken(user.id, refresh_token);

        // return {
        //     access_token,
        //     refresh_token,
        //     // access_token: this.jwtService.sign(payload),
        //     user: {
        //         id: user.id,
        //         email: user.email,
        //         username: user.username,
        //         avatarUrl: user.avatarUrl,
        //     },
        // };
    }


    async logout(userId: string) {
        await this.clearRefreshToken(userId);
        return { message: 'Logged out successfully' };
    }
}
