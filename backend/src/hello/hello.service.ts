import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class HelloService {
  private readonly existing_ids: number[] = [1, 4, 5];

  async getHello(): Promise<{ hello: string }> {
    return { hello: 'world' };
  }

  async getId(id: number): Promise<{ hello_id: number }> {
    if (id < 0) {
      throw new BadRequestException('Id can only be a non-negative');
    }
    if (!this.existing_ids.includes(id)) {
      throw new NotFoundException('Id not found');
    }
    return { hello_id: id };
  }
}
