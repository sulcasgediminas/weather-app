import { Controller, Get, Query, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get()
  async getWeather(@Query('city') city: string, @Res() res: Response) {
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }
    try {
      const weather = await this.weatherService.getWeather(city).toPromise();
      res.json({ weather });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
}
