import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto';
import { randomBytes } from 'crypto';
import { access } from 'fs';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

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


    async login(user: any) {
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
        



        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,

        };

        // const signed_token = await this.jwtService.sign(payload) 

        return {
            access_token: this.jwtService.sign(payload),
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

    loginWith2FA(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            isTwoFactorAuthenticated: true,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        };
    }

}


