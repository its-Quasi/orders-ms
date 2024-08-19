import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaClient } from "@prisma/client";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger("ORDER-SERVICE")

  async onModuleInit() {
    await this.$connect();
    this.logger.log("ORDER DATABASE CONNECTED")
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto })
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  changeStatus(id: number) {
    return `This action update a #${id} order`;
  }
}
