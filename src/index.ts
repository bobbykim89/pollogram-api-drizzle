import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { appendTrailingSlash } from "hono/trailing-slash";

export const bootstrap = () => {
  const app = new Hono();
  app
    .use(prettyJSON())
    .use(appendTrailingSlash())
    .get("/", (c) => {
      return c.json(
        {
          message: "Hello from pollito!",
        },
        200
      );
    });
  return app;
};
