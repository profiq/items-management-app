import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly client: WebClient;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('slack.botToken');
    if (!token) {
      throw new Error('Missing SLACK_BOT_TOKEN configuration');
    }
    this.client = new WebClient(token);
  }

  async sendDm(email: string, message: string): Promise<void> {
    try {
      const result = await this.client.users.lookupByEmail({ email });
      const userId = result.user?.id;
      if (!userId) {
        this.logger.warn(`Slack user not found for email: ${email}`);
        return;
      }
      await this.client.chat.postMessage({ channel: userId, text: message });
    } catch (error) {
      const isPlatformError =
        (error as { code?: string }).code === ErrorCode.PlatformError;
      const isUserNotFound =
        (error as { data?: { error?: string } }).data?.error ===
        'users_not_found';
      if (isPlatformError && isUserNotFound) {
        this.logger.warn(`Slack user not found for email: ${email}`);
        return;
      }
      this.logger.error(`Failed to send Slack DM to ${email}`, error);
    }
  }
}
