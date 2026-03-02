import { IsOptional, IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;
}