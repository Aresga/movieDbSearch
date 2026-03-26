import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class UpdatePasswordDto {
    @IsString()
    currentPassword: string

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
        {
            message: 'Password must contain uppercase, lowecase, number and a special character'
        })
    newPassword: string;
}