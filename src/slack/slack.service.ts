import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { createHmac } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  constructor(private readonly httpService: HttpService) {}

  // Updated method to verify Slack requests using signing secret
  verifySlackRequest(slackSignature: string, timestamp: string, rawBody: string): boolean {
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
    if (!slackSigningSecret) {
      throw new Error('SLACK_SIGNING_SECRET is not set in the environment variables');
    }

    const time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - Number(timestamp)) > 300) {
      this.logger.error('Timestamp difference is too large');
      return false;
    }

    const sigBasestring = `v0:${timestamp}:${rawBody}`;
    const mySignature = 'v0=' +
      createHmac('sha256', slackSigningSecret)
        .update(sigBasestring, 'utf8')
        .digest('hex');

    if (mySignature !== slackSignature) {
      this.logger.error(`Signature mismatch: Expected ${slackSignature} but calculated ${mySignature}`);
      return false;
    }

    return true;
  }

  // Method to extract the city from the Slack message text
  extractCityFromMessage(messageText: string): string {
    // Simple implementation assuming the city is always the last word after 'weather'
    const match = messageText.match(/weather in (\w+)/);
    return match ? match[1] : null;
  }

  // Method to fetch weather data for a city
  async getWeatherForCity(city: string): Promise<any> {
    // Use your existing weather service implementation to fetch the data
    // This is just a placeholder
    const weatherData = await this.httpService.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`).toPromise();
    return weatherData.data;
  }

  // Method to post a message to a Slack channel
  async postMessage(channel: string, message: string): Promise<void> {
    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    if (!slackBotToken) {
      throw new Error('SLACK_BOT_TOKEN is not set in the environment variables');
    }
    await this.httpService.post('https://slack.com/api/chat.postMessage', {
      channel: channel,
      text: message,
    }, {
      headers: { 'Authorization': `Bearer ${slackBotToken}` },
    }).toPromise();
  }
}
