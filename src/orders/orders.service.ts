import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaClient } from "@prisma/client";
import { RpcException } from "@nestjs/microservices";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { PaginationOrderDto } from "./dto/pagination-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger("ORDER-SERVICE")

  async onModuleInit() {
    await this.$connect();
    this.logger.log("ORDER DATABASE CONNECTED")
  }

  create(createOrderDto: CreateOrderDto) {

    // return this.order.create({ data: createOrderDto })
  }

  async findAll(pagination: PaginationOrderDto) {
    console.log(pagination)
    const { limit, page, status } = pagination
    const totalRecords = await this.order.count({
      where: { status }
    })
    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status: status }
      }),
      meta: {
        lastPage: Math.ceil(totalRecords / limit),
        page,
        totalOrders: totalRecords,
      }
    }
  }

  findOne(id: string) {
    return this.order.findUnique({
      where: { id }
    })
  }

  async changeStatus(data: UpdateOrderDto) {

    const { id } = data
    let oldOrder = await this.findOne(id)

    return this.order.update({
      data: {
        ...oldOrder,
        ...data
      },
      where: { id }
    });
  }
}
