import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HelloService } from './hello.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('hello')
export class HelloController {
  constructor(private helloService: HelloService) {}

  @Get()
  @ApiOkResponse({ example: { hello: 'world' } })
  async getHello(): Promise<{ hello: string }> {
    return this.helloService.getHello();
  }

  @Get(':id')
  @ApiOkResponse({ example: { hello_id: 1 } })
  @ApiNotFoundResponse({
    example: {
      message: 'Id not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiBadRequestResponse({
    example: {
      message: 'Id can only be a non-negative',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  async getId(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ hello_id: number }> {
    return this.helloService.getId(id);
  }
}
