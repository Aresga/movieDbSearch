import 'dotenv/config';
import { expand } from 'dotenv-expand';
import { defineConfig, env } from '@prisma/config';

expand({ parsed: process.env as Record<string, string> });

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: env('DATABASE_URL'),
    },
});