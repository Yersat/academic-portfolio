"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

function md5(str: string): string {
  return crypto.createHash("md5").update(str, "utf8").digest("hex");
}

/**
 * Verify Robokassa callback signature using Password2.
 * Returns true if the signature matches.
 */
export const verifyRobokassaSignature = internalAction({
  args: {
    outSum: v.string(),
    invId: v.string(),
    signatureValue: v.string(),
    shpOrderId: v.string(),
  },
  handler: async (_ctx, args) => {
    const password2 = process.env.ROBOKASSA_PASSWORD2!;
    const shpString = `Shp_orderId=${args.shpOrderId}`;
    const expectedSig = md5(`${args.outSum}:${args.invId}:${password2}:${shpString}`);
    return expectedSig.toLowerCase() === args.signatureValue.toLowerCase();
  },
});

/**
 * Generate Robokassa payment URL with MD5 signature using Password1.
 */
export const generateRobokassaUrl = internalAction({
  args: {
    merchantLogin: v.string(),
    outSum: v.string(),
    invId: v.string(),
    description: v.string(),
    email: v.string(),
    orderId: v.string(),
    testMode: v.boolean(),
    baseUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const password1 = process.env.ROBOKASSA_PASSWORD1!;
    const shpString = `Shp_orderId=${args.orderId}`;
    const signatureBase = `${args.merchantLogin}:${args.outSum}:${args.invId}:${password1}:${shpString}`;
    const signature = md5(signatureBase);

    const url = new URL(args.baseUrl);
    url.searchParams.set("MerchantLogin", args.merchantLogin);
    url.searchParams.set("OutSum", args.outSum);
    url.searchParams.set("InvId", args.invId);
    url.searchParams.set("Description", args.description);
    url.searchParams.set("SignatureValue", signature);
    url.searchParams.set("Email", args.email);
    url.searchParams.set("Shp_orderId", args.orderId);
    if (args.testMode) url.searchParams.set("IsTest", "1");

    return url.toString();
  },
});
