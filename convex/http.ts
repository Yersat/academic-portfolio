import { httpRouter } from "convex/server";
import {
  robokassaResult,
  robokassaSuccess,
  robokassaFail,
  serveDownload,
} from "./httpHandlers";

const http = httpRouter();

// Robokassa ResultURL callback (POST and GET)
http.route({
  path: "/robokassa/result",
  method: "POST",
  handler: robokassaResult,
});

http.route({
  path: "/robokassa/result",
  method: "GET",
  handler: robokassaResult,
});

// Robokassa SuccessURL (user redirect after payment)
http.route({
  path: "/robokassa/success",
  method: "GET",
  handler: robokassaSuccess,
});

// Robokassa FailURL (user redirect after failed payment)
http.route({
  path: "/robokassa/fail",
  method: "GET",
  handler: robokassaFail,
});

// PDF download endpoint
http.route({
  path: "/download",
  method: "GET",
  handler: serveDownload,
});

export default http;
