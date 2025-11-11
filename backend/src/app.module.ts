import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';

// Config
import { appConfig } from '@config/app.config';
import { databaseConfig } from '@config/database.config';
import { jwtConfig } from '@config/jwt.config';
import { redisConfig } from '@config/redis.config';
import { uploadConfig } from '@config/upload.config';

// Guards
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

// Modules
import { AuthModule } from '@modules/auth/auth.module';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { TransactionsModule } from '@modules/transactions/transactions.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { TagsModule } from '@modules/tags/tags.module';
import { BudgetsModule } from '@modules/budgets/budgets.module';
import { GroupsModule } from '@modules/groups/groups.module';
import { InvestmentsModule } from '@modules/investments/investments.module';
import { LendBorrowModule } from '@modules/lend-borrow/lend-borrow.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, uploadConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database'),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
    }),

    // Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    AccountsModule,
    TransactionsModule,
    CategoriesModule,
    TagsModule,
    BudgetsModule,
    GroupsModule,
    InvestmentsModule,
    LendBorrowModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
