import { Controller, ParseUUIDPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @MessagePattern("create_order")
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern("find_all_orders")
  findAll(@Payload() pagination: PaginationDto) {
    return this.ordersService.findAll(pagination)
  }

  @MessagePattern("find_one_order")
  findOne(@Payload("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern("update_order")
  changeOrderStatus(@Payload("id") id: string) {
    return this.ordersService.changeStatus(id);
  }
}
