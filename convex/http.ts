import { httpRouter } from "convex/server";
import { serveDownload } from "./httpHandlers";

const http = httpRouter();

// PDF download endpoint
http.route({
  path: "/download",
  method: "GET",
  handler: serveDownload,
});

export default http;
