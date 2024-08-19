import { OrderStatus } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  totalAmount: number

  @IsNumber()
  @IsPositive()
  totalItems: number

  @IsEnum(OrderStatus, { message: `Posible status are ${OrderStatus}` })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING

  @IsBoolean()
  @IsOptional()
  paid: boolean = false
}
