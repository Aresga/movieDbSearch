import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import {
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendsModule } from './friends/friends.module';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageModule } from './message/message.module';
import { ReviewsModule } from './review/review.module';
import { TwofactorauthService } from './twofactorauth/twofactorauth.service';
import { TwofactorauthModule } from './twofactorauth/twofactorauth.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { EmailModule } from './email/email.module';
import { WishListModule } from './wishlist/wishlist.module';
import { WatchedListModule } from './watchedlist/watchedlist.module';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      defaultLabels: { service: 'backend-nest' },
    }),
    ConfigModule.forRoot({ isGlobal: true, }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    HttpModule,
    PrismaModule,
    AuthModule,
    UserModule,
    FriendsModule,
    GatewayModule,
    ReviewsModule,
    TwofactorauthModule,
    TmdbModule,
    MessageModule,
    WishListModule,
    EmailModule,
    WatchedListModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TwofactorauthService,
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
    }),
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
  ],
  exports: [AppService],
})
export class AppModule {}
