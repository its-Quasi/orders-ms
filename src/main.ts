import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger, ValidationPipe } from "@nestjs/common";
import { envs } from "./config/envs";

async function bootstrap() {
  const logger = new Logger("ORDERS-MS");
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: { servers: envs.nats_servers }
    }
  );
  logger.log(`RUNNING ON PORT ${envs.port}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  await app.listen();
}
bootstrap();
