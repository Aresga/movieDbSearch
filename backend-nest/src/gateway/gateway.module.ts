import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway/gateway.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  providers: [GatewayGateway],
  exports: [GatewayGateway]
})
export class GatewayModule {}
