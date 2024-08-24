import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaClient } from "@prisma/client";
import { RpcException } from "@nestjs/microservices";
import { PaginationDto } from "src/common/dto/pagination.dto";

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

  findAll(pagination: PaginationDto) {
    console.log(pagination)
    return this.order.findMany();
  }

  findOne(id: string) {
    return this.order.findUnique({
      where: { id }
    })
  }

  async changeStatus(id: string) {
    const order = await this.findOne(id)
    order.status = "DELIVERED"
    return this.order.update({
      data: order,
      where: { id }
    });
  }
}
