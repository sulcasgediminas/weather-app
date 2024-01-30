import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class WeatherService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}

  getWeather(city: string): Observable<any> {
    const apiKey = this.configService.get('WEATHER_API_KEY');
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

    return this.httpService.get(url).pipe(
      map(response => response.data)
    );
  }
}
