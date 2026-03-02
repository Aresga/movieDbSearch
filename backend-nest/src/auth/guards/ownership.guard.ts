// src/auth/guards/ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const id = request.params?.id;

    if (!id) {
        return !!user;  // Just check auth
    }

    if (!user) {
        throw new ForbiddenException('Missing user');
    }

    if (user.id !== id) {
        throw new ForbiddenException('You can only modify your own data');
    }

    return true;
    }

}
