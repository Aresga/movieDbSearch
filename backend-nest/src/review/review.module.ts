import { forwardRef, Module } from '@nestjs/common'
import { ReviewsService } from './review.service'
import { ReviewsController } from './review.controller'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AppModule } from 'src/app.module'

@Module({
	imports: [ PrismaModule, forwardRef(() => AppModule)  ],
	controllers: [ ReviewsController ],
	providers: [ ReviewsService ],
	exports: [ ReviewsService ],
})
export class ReviewsModule {}