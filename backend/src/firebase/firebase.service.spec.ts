import { DeleteException } from '@/lib/errors';
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
  describe('delete', (): void => {
    let service: FirebaseService;
    let deleteFile: jest.Mock;
    let file: jest.Mock;

    beforeEach((): void => {
      service = Object.create(FirebaseService.prototype) as FirebaseService;
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

    it('should expose storage delete failures', async (): Promise<void> => {
      deleteFile.mockRejectedValue(new Error('storage unavailable'));

      await expect(service.delete('items/image.png')).rejects.toThrow(
        DeleteException
      );
    });
  });
});
