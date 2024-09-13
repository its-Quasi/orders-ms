import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaClient } from "@prisma/client";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { PaginationOrderDto } from "./dto/pagination-order.dto";
import { NATS_SERVICE, PRODUCT_SERVICE } from "src/config/services";
import { firstValueFrom } from "rxjs";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ChangeOrderStatusDto } from "./dto/change-order-status.dto";

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

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) { super() }

  async create(createOrderDto: CreateOrderDto) {

    try {
      const ids = createOrderDto.items.map(item => item.productId)
      const products: Product[] = await firstValueFrom<Product[]>(
        this.client.send('validate_products', ids)
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

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          select: { quantity: true, price: true, productId: true }
        }
      }
    })

    const productsIds = order.orderItems.map(p => p.productId)

    const products: Product[] = await firstValueFrom<Product[]>(
      this.client.send('validate_products', productsIds)
    )

    const orderItems = order.orderItems.map(item => {
      const { productId, ...rest } = item
      return {
        ...rest,
        name: products.find(product => product.id === item.productId).name
      }
    })
    const { id: _, ...rest } = order
    return {
      ...rest,
      orderItems
    }
  }

  async changeStatus(data: ChangeOrderStatusDto) {
    const { id, status } = data
    return this.order.update({
      where: { id },
      data: { status }
    });
  }
}
