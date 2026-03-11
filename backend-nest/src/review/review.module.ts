import { Module } from '@nestjs/common'
import { ReviewsService } from './review.service'
import { ReviewsController } from './review.controller'
import { PrismaModule } from 'src/prisma/prisma.module'

@Module({
	imports: [ PrismaModule ],
	controllers: [ ReviewsController ],
	providers: [ ReviewsService ],
	exports: [ ReviewsService ],
})
export class ReviewsModule {}