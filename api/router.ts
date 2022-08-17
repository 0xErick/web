import { Router } from "oak";
import { dd } from "./handlers/index.ts";
const router = new Router();

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "The Hound of the Baskervilles",
  author: "Conan Doyle, Arthur",
});

router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .post("/", dd)
  .get("/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  .get("/book/:id", (context) => {
    if (books.has(context?.params?.id)) {
      context.response.body = books.get(context.params.id);
    }
  });

export default router;
