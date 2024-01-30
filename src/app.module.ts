import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { SlackController } from './slack/slack.controller';
import { SlackService } from './slack/slack.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [SlackController],
  imports: [HttpModule, WeatherModule, ConfigModule.forRoot()],
  providers: [SlackService],
})
export class AppModule {}
