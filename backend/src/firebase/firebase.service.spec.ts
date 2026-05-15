import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DeleteException, UploadException } from '@/lib/errors';
import { FirebaseService } from './firebase.service';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej): void => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('FirebaseService', (): void => {
  let module: TestingModule;
  let service: FirebaseService;
  let file: jest.Mock;
  const originalFirebaseAuthEmulatorHost =
    process.env.FIREBASE_AUTH_EMULATOR_HOST;

  beforeEach(async (): Promise<void> => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    file = jest.fn();
    module = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): string => {
              const values: Record<string, string> = {
                'google.storage_bucket': 'test-bucket',
                'google.project_id': 'test-project',
                'google.client_email': 'firebase@example.test',
                'google.private_key': 'test-private-key',
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(FirebaseService);
    jest.spyOn(service, 'getBucket').mockReturnValue({
      file,
    } as never);
  });

  afterEach(async (): Promise<void> => {
    await service?.getApp().delete();
    await module?.close();
    if (originalFirebaseAuthEmulatorHost === undefined) {
      delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    } else {
      process.env.FIREBASE_AUTH_EMULATOR_HOST =
        originalFirebaseAuthEmulatorHost;
    }
    jest.clearAllMocks();
  });

  describe('upload', (): void => {
    let saveFile: jest.Mock;

    beforeEach((): void => {
      saveFile = jest.fn();
      file.mockReturnValue({ save: saveFile });
    });

    it('should expose storage upload failures with the original cause', async (): Promise<void> => {
      const storageError = new Error('storage unavailable');
      saveFile.mockRejectedValue(storageError);
      const result = service.upload('items/image.png', 'contents');

      await expect(result).rejects.toThrow(UploadException);
      await expect(result).rejects.toMatchObject({
        cause: storageError,
      });
    });
  });

  describe('delete', (): void => {
    let deleteFile: jest.Mock;

    beforeEach((): void => {
      deleteFile = jest.fn();
      file = jest.fn().mockReturnValue({ delete: deleteFile });
      jest.spyOn(service, 'getBucket').mockReturnValue({
        file,
      } as never);
    });

    it('should wait for the storage delete operation to finish', async (): Promise<void> => {
      const deferred = createDeferred<[unknown]>();
      deleteFile.mockReturnValue(deferred.promise);
      let settled = false;

      const result = service.delete('items/image.png').then((): void => {
        settled = true;
      });
      await Promise.resolve();

      expect(file).toHaveBeenCalledWith('items/image.png');
      expect(deleteFile).toHaveBeenCalled();
      expect(settled).toBe(false);

      deferred.resolve([undefined]);
      await result;

      expect(settled).toBe(true);
    });

    it('should treat missing storage objects as already deleted', async (): Promise<void> => {
      deleteFile.mockRejectedValue({ code: 404 });

      await expect(service.delete('items/image.png')).resolves.toBeUndefined();
    });

    it('should expose storage delete failures with the original cause', async (): Promise<void> => {
      const storageError = new Error('storage unavailable');
      deleteFile.mockRejectedValue(storageError);
      const result = service.delete('items/image.png');

      await expect(result).rejects.toThrow(DeleteException);
      await expect(result).rejects.toMatchObject({
        cause: storageError,
      });
    });
  });
});
