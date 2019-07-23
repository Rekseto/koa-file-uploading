import * as Koa from "koa";
import * as Router from "koa-router";

//@ts-ignore
import * as koaEjs from "koa-ejs";
import * as path from "path";

import routes from "./routes";

const app = new Koa();

koaEjs(app, {
  root: path.join(__dirname, "templates"),
  layout: false,
  viewExt: "ejs"
});

const router: Router = new Router();

routes(router); // Just mock of real route loading

app.use(router.routes());

app.listen(3000);
