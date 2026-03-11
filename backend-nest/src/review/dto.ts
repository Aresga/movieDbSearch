import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class ReviewDto {

	@IsNotEmpty()
	@IsNumber()
	rating: number;

	@IsOptional()
    @IsString()
    comment?: string;
}