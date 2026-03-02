import { IsString, Length, Matches } from "class-validator";

export class TwoFactorTokenDto {
    @IsString()
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
    token: string;
}