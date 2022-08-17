import { day } from "./utils.ts";
import ms from "ms";
import Limiter from "./lib/Limiter.ts";

// 记录请求的响应时间
export const setRT = async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
};

// 用于分析响应慢的URL和统计QPS
export const accessLog = async (ctx: any, next: any) => {
  const start = (day as any).tz().format("YYYY-MM-DDTHH:mm:ss#SSS");
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");

  console.log(
    `${ctx.request.method} ${start}  ${ctx.request.url} ${rt} ${ctx.request.ip} `
  );
};

export const ratelimit = (opts: any = {}) => {
  const defaultOpts = {
    duration: 1 * 60 * 1000, // 1分钟
    max: 500, // 1分钟 500个请求
    id: (ctx: any) => ctx.request.ip,
    headers: {
      remaining: "X-RateLimit-Remaining",
      reset: "X-RateLimit-Reset",
      total: "X-RateLimit-Limit",
    },
  };
  opts = { ...defaultOpts, ...opts };
  const {
    remaining = "X-RateLimit-Remaining",
    reset = "X-RateLimit-Reset",
    total = "X-RateLimit-Limit",
  } = opts.headers;

  return async function ratelimit(ctx: any, next: any) {
    const id = opts.id(ctx);

    const whitelisted =
      typeof opts.whitelist === "function" && (await opts.whitelist(ctx));
    const blacklisted =
      typeof opts.blacklist === "function" && (await opts.blacklist(ctx));

    if (blacklisted) {
      ctx.throw(403, "Forbidden");
    }

    if (id === false || whitelisted) return await next();

    // initialize limiter
    let limiter = new Limiter({ ...opts, id });

    // check limit
    const limit = await limiter.get();

    // check if current call is legit
    const calls = limit.remaining > 0 ? limit.remaining - 1 : 0;

    // check if header disabled
    const disableHeader = opts.disableHeader || false;

    let headers: any = {};
    if (!disableHeader) {
      // header fields
      headers = {
        [remaining]: calls,
        [reset]: limit.reset,
        [total]: limit.total,
      };

      if (id !== "global") {
        Object.keys(headers).forEach((ele) => {
          ctx.response.headers.set(ele, headers[ele]);
        });
      }
    }

    // console.log("remaining %s/%s %s", calls, limit.total, id);
    if (limit.remaining) return await next();

    // 记录限流超标日志

    const delta = (limit.reset * 1e3 - Date.now()) | 0;
    const after = (limit.reset - Math.floor(Date.now() / 1000)) | 0;

    ctx.response.status = opts.status || 429;
    ctx.response.body =
      opts.errorMessage ||
      `Rate limit exceeded, retry in ${ms(delta, { long: true })}.`;

    if (opts.throw) {
      ctx.throw(ctx.status, ctx.body, { headers });
    }
  };
};
