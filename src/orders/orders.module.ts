import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { NATS_SERVICE } from "src/config/services";
import { envs } from "src/config/envs";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: { servers: envs.nats_servers }
      }
    ])
  ]
})
export class OrdersModule { }
