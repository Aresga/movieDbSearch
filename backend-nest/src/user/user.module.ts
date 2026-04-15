import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { R2AvatarService } from './r2-avatar.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [PrismaModule, MessageModule, EmailModule],
  controllers: [UserController],
  providers: [UserService, R2AvatarService],
  exports: [UserService],
})
export class UserModule {}
