/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as books from "../books.js";
import type * as coAuthors from "../coAuthors.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as httpHandlers from "../httpHandlers.js";
import type * as orders from "../orders.js";
import type * as profile from "../profile.js";
import type * as seed from "../seed.js";
import type * as textbooks from "../textbooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  books: typeof books;
  coAuthors: typeof coAuthors;
  gallery: typeof gallery;
  http: typeof http;
  httpHandlers: typeof httpHandlers;
  orders: typeof orders;
  profile: typeof profile;
  seed: typeof seed;
  textbooks: typeof textbooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
