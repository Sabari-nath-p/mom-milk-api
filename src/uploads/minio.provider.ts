import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { MINIO_CLIENT } from "./minio.constants";

export const minioClientProvider: Provider = {
  provide: MINIO_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const endPoint = configService.get<string>("MINIO_ENDPOINT", "localhost");
    const port = Number.parseInt(
      configService.get<string>("MINIO_PORT", "9000"),
      10,
    );
    const useSSL =
      configService.get<string>("MINIO_USE_SSL", "false") === "true";

    const accessKey = configService.get<string>(
      "MINIO_ACCESS_KEY",
      "palqaradmin",
    );
    const secretKey = configService.get<string>(
      "MINIO_SECRET_KEY",
      "StrongPassword123!",
    );

    return new Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  },
};
