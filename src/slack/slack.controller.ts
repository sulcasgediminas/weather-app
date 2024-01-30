import { Controller, Post, Req, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SlackService } from './slack.service'; // Ensure SlackService is imported
import { CustomExpressRequest } from './custom-express-request.interface'; 

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Post('events')
  @HttpCode(HttpStatus.OK)
  async handleSlackEvent(@Req() req: CustomExpressRequest, @Body() body: any, @Res() res: Response) {
    // Extract the headers for verification
    const slackSignature = req.headers['x-slack-signature'] as string;
    const timestamp = req.headers['x-slack-request-timestamp'] as string;
    
    // You need to configure your server to not parse the body and pass the raw body here for verification
    const rawBody = req.rawBody as string; // This should be set up in your server configuration to get the raw body

    // Verify the request is from Slack using the signing secret
    const isVerified = this.slackService.verifySlackRequest(slackSignature, timestamp, rawBody);
    if (!isVerified) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Verification failed');
    }

    if (body.type === 'url_verification') {
      // URL verification challenge
      return res.json({ challenge: body.challenge });
    }

    if (body.event && body.event.type === 'app_mention') {
      // Handle app_mention events
      const message = body.event.text;
      const channel = body.event.channel;

      // Check if the message is a command for weather
      if (message.includes('weather')) {
        // Implement logic to extract the city from the message
        const city = this.slackService.extractCityFromMessage(message);
        try {
          const weatherData = await this.slackService.getWeatherForCity(city);
          const message = `The current temperature in ${city} is ${weatherData.current.temp_c}°C`;
          await this.slackService.postMessage(channel, message);
        } catch (error) {
          await this.slackService.postMessage(channel, 'Failed to fetch weather data.');
        }
      }
    }

    // Respond to Slack that the event has been received
    return res.status(HttpStatus.OK).send();
  }
}
