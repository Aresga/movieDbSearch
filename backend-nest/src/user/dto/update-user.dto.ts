import { IsOptional, IsString, IsUrl, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    bio?: string;


    // @IsEmail()
    // @IsNotEmpty()
    // email?: string;
}