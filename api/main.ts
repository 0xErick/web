import { Application } from "oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello Worldsss!";
});

await app.listen({ port: 8000 });
