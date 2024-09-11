import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaClient } from "@prisma/client";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { PaginationOrderDto } from "./dto/pagination-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { PRODUCT_SERVICE } from "src/config/services";
import { firstValueFrom, throwError } from "rxjs";

interface Product {
  price: number
  id: number
  name: string
}

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger("ORDER-SERVICE")

  async onModuleInit() {
    await this.$connect();
    this.logger.log("ORDER DATABASE CONNECTED")
  }

  constructor(@Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy) { super() }

  async create(createOrderDto: CreateOrderDto) {

    try {
      const ids = createOrderDto.items.map(item => item.productId)
      const products: Product[] = await firstValueFrom<Product[]>(
        this.productsClient.send('validate_products', ids)
      )

      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const { productId, quantity } = item
        const { price } = products.find(product => product.id === productId)
        return acc + price * quantity
      }, 0)

      const totalItems = createOrderDto.items.reduce((acc, item) => acc + item.quantity, 0)

      const detailData = products.map(product => {
        const { quantity } = createOrderDto.items.find(orderItem => product.id === orderItem.productId)
        return {
          productId: product.id,
          price: product.price,
          quantity
        }
      })
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          orderItems: {
            createMany: { data: detailData }
          }
        },
        include: {
          orderItems: {
            select: { price: true, quantity: true, productId: true }
          }
        }
      })
      const orderItems = order.orderItems.map(item => {
        return {
          ...item, name: products.find(p => p.id === item.productId).name
        }
      })
      return {
        ...order,
        orderItems
      }
    } catch (error) {
      throw new RpcException({
        message: 'some error message'
      })
    }
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
