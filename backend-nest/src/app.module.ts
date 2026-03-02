import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendsModule } from './friends/friends.module';
import { GatewayModule } from './gateway/gateway.module';
import { TwofactorauthService } from './twofactorauth/twofactorauth.service';
import { TwofactorauthModule } from './twofactorauth/twofactorauth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    HttpModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FriendsModule,
    GatewayModule,
    TwofactorauthModule,
  ],
  controllers: [AppController],
  providers: [AppService, TwofactorauthService, TwofactorauthService],
})
export class AppModule {}
