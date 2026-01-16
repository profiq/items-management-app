import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

async function mockGetId(id: number): Promise<{ hello_id: number } | null> {
  const valid_id = 1;
  if (id !== valid_id) {
    return null;
  }
  return { hello_id: id };
}

describe('HelloController', () => {
  let helloController: HelloController;
  let helloService: HelloService;

  beforeEach(() => {
    helloService = new HelloService();
    helloController = new HelloController(helloService);
  });

  describe('getHello', () => {
    it('should return object key hello after resolving', async () => {
      const result = { hello: 'world' };
      jest
        .spyOn(helloService, 'getHello')
        .mockImplementation(() => Promise.resolve(result));

      expect.assertions(1);

      await expect(helloController.getHello()).resolves.toBe(result);
    });
  });

  describe('getId', () => {
    it('should return object with key hello_id and value 1', async () => {
      const result = { hello_id: 1 };
      jest.spyOn(helloService, 'getId').mockImplementation(id => mockGetId(id));

      expect.assertions(3);

      await expect(helloController.getId(1)).resolves.toStrictEqual(result);
      await expect(helloController.getId(2)).rejects.toThrow(NotFoundException);
      await expect(helloController.getId(-1)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
