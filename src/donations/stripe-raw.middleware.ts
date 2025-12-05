import { Injectable, NestMiddleware } from "@nestjs/common";
import * as bodyParser from "body-parser";

@Injectable()
export class StripeRawBodyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  }
}
