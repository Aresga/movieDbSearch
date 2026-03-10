import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway/gateway.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MessageModule,
  ],
  providers: [GatewayGateway],
  exports: [GatewayGateway]
})
export class GatewayModule {}
