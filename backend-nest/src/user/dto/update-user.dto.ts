import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;
}
