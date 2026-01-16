import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  private readonly existing_ids: number[] = [1, 4, 5];

  async getHello(): Promise<{ hello: string }> {
    return { hello: 'world' };
  }

  async getId(id: number): Promise<{ hello_id: number } | null> {
    if (!this.existing_ids.includes(id)) {
      return null;
    }
    return { hello_id: id };
  }
}
