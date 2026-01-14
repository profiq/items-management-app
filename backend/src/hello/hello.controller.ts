import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hello')
export class HelloController {
  constructor(private helloService: HelloService) {}

  @Get()
  async getHello(): Promise<{ hello: string }> {
    return this.helloService.getHello();
  }

  @Get(':id')
  async getId(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ hello_id: number }> {
    return this.helloService.getId(id);
  }
}
