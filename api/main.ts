import { Application } from "oak";
import { setRT, accessLog, ratelimit } from "./oakplugins.ts";
import router from "./router.ts";

const app = new Application({ logErrors: false });
const db = new Map();

// 三个分析用的日志，访问日志、限流日志、错误日志

// 访问记录
app.use(accessLog);

// 记录响应时间
app.use(setRT);

// IP限流
app.use(ratelimit({ db: db }));

// 过载保护 1秒只接受 200个请求
app.use(ratelimit({ db: db, id: () => "global", duration: 1000, max: 200 }));

// 路由配置
app.use(router.routes());
app.use(router.allowedMethods());

// 捕获错误并记录
app.addEventListener("error", (evt) => {
  // Will log the thrown error to the console.
  console.log(666, evt.error);
});

await app.listen({ port: 8000 });
