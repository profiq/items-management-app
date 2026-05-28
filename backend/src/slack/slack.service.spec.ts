jest.mock('@slack/web-api');

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SlackService } from './slack.service';
import { WebClient } from '@slack/web-api';

const mockLookupByEmail = jest.fn();
const mockPostMessage = jest.fn();
const MockWebClient = WebClient as jest.MockedClass<typeof WebClient>;

describe('SlackService', (): void => {
  let service: SlackService;

  beforeEach(async (): Promise<void> => {
    MockWebClient.mockImplementation(
      () =>
        ({
          users: { lookupByEmail: mockLookupByEmail },
          chat: { postMessage: mockPostMessage },
        }) as unknown as WebClient
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlackService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('xoxb-test') },
        },
      ],
    }).compile();

    service = module.get<SlackService>(SlackService);
    jest.clearAllMocks();
  });

  describe('sendDm', (): void => {
    it('looks up user by email and sends DM', async (): Promise<void> => {
      mockLookupByEmail.mockResolvedValue({ user: { id: 'U123' } });
      mockPostMessage.mockResolvedValue({});

      await service.sendDm('test@profiq.com', 'Hello');

      expect(mockLookupByEmail).toHaveBeenCalledWith({
        email: 'test@profiq.com',
      });
      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'U123',
        text: 'Hello',
      });
    });

    it('logs warning and does not throw when Slack user not found', async (): Promise<void> => {
      mockLookupByEmail.mockRejectedValue(
        Object.assign(new Error('user not found'), {
          code: 'slack_webapi_platform_error',
          data: { error: 'users_not_found' },
        })
      );

      await expect(
        service.sendDm('unknown@profiq.com', 'Hello')
      ).resolves.not.toThrow();
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('logs error and does not throw on generic Slack API failure', async (): Promise<void> => {
      mockLookupByEmail.mockRejectedValue(new Error('network error'));

      await expect(
        service.sendDm('test@profiq.com', 'Hello')
      ).resolves.not.toThrow();
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it('logs warning and does not throw when lookupByEmail returns no user id', async (): Promise<void> => {
      mockLookupByEmail.mockResolvedValue({ user: undefined });

      await expect(
        service.sendDm('test@profiq.com', 'Hello')
      ).resolves.not.toThrow();
      expect(mockPostMessage).not.toHaveBeenCalled();
    });
  });
});
