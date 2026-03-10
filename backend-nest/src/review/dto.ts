import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class ReviewDto {

	@IsNotEmpty()
	@IsNumber()
	rating: number;

    @IsString()
	@IsNotEmpty()
    comment: string;
}