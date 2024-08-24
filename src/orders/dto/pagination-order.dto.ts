import { OrderStatus } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";


export class PaginationOrder extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus
}