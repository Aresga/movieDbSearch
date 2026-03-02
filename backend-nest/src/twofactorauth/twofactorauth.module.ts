import { Module } from '@nestjs/common';
import { TwofactorauthController } from './twofactorauth.controller';
import { TwofactorauthService } from './twofactorauth.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  providers: [TwofactorauthService],
  controllers: [TwofactorauthController],
  exports: [TwofactorauthService],
})
export class TwofactorauthModule {}
