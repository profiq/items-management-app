import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

async function mockGetId(id: number) {
  const valid_id = 1;
  if (id < 0) {
    throw new BadRequestException();
  }
  if (id !== valid_id) {
    throw new NotFoundException();
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

      expect(await helloController.getHello()).toBe(result);
    });
  });

  describe('getId', () => {
    it('should return object with key hello_id and value 1', async () => {
      const result = { hello_id: 1 };
      jest.spyOn(helloService, 'getId').mockImplementation(id => mockGetId(id));

      expect(await helloController.getId(1)).toStrictEqual(result);
      await expect(helloController.getId(2)).rejects.toThrow(NotFoundException);
      await expect(helloController.getId(-1)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
