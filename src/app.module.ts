import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HoneyEcommerceModule } from './honey-ecommerce/honey-ecommerce.module';
import { BillingModule } from './billing/billing.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { configDev } from './configuration/config.dev';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      load: [configDev],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          console.log(
            `[MongoDB] Connected to ${connection.host}:${connection.port}/${connection.name}`,
          );
          connection.on('error', (error: { message?: string; code?: unknown }) => {
            const code =
              error && typeof error === 'object' && 'code' in error
                ? String((error as { code?: unknown }).code)
                : 'unknown';
            console.error(
              `[MongoDB] Connection error (code=${code}): ${error?.message ?? 'unknown'}`,
            );
          });
          return connection;
        },
      }),
    }),

    HoneyEcommerceModule,
    BillingModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    FeedbackModule,
    AdminModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
