import { Controller, ParseUUIDPipe } from "@nestjs/common";
import { MessagePattern, Payload, RpcException } from "@nestjs/microservices";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaginationOrderDto } from "./dto/pagination-order.dto";
import { ChangeOrderStatusDto } from "./dto/change-order-status.dto";

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @MessagePattern("create_order")
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern("find_all_orders")
  findAll(@Payload() pagination: PaginationOrderDto) {
    return this.ordersService.findAll(pagination)
  }

  @MessagePattern("find_one_order")
  findOne(@Payload("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern("update_order")
  changeOrderStatus(@Payload() order: ChangeOrderStatusDto) {
    try {
      return this.ordersService.changeStatus(order);
    } catch (e) {
      console.error("Error en changeOrderStatus:", e);
      throw new RpcException('Error processing the order update');
    }
  }
}
