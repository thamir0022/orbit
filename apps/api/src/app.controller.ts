import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { add } from '@orbit/math/add';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log("🚀 ~ AppController ~ getHello ~ add(1, 5):", add(1, 5))
    return this.appService.getHello();
  }
}
