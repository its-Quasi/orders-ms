import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";
import { envs } from "./config/envs";

async function bootstrap() {
  const logger = new Logger("ORDERS-MS");
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TC,
      options: {
        port: envs.port
      }
    }
  );
  logger.log(`RUNNING ON PORT ${envs.port}`);
  await app.listen();
}
bootstrap();
