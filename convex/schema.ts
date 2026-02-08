import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    title: v.string(),
    year: v.string(),
    publisher: v.string(),
    isbn: v.string(),
    coverImage: v.string(),
    description: v.string(),
    abstract: v.string(),
    toc: v.optional(v.array(v.string())),
    status: v.union(v.literal("published"), v.literal("draft")),
    litresUrl: v.optional(v.string()),
    pdfPrice: v.optional(v.float64()),
    pdfCurrency: v.union(v.literal("KZT"), v.literal("RUB")),
    pdfStorageId: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
  })
    .index("by_isbn", ["isbn"])
    .index("by_isPublished", ["isPublished"]),

  orders: defineTable({
    bookId: v.id("books"),
    email: v.string(),
    amount: v.float64(),
    currency: v.union(v.literal("KZT"), v.literal("RUB")),
    status: v.union(
      v.literal("PENDING"),
      v.literal("PAID"),
      v.literal("FAILED"),
      v.literal("CANCELLED")
    ),
    robokassaInvoiceId: v.float64(),
    robokassaSignature: v.optional(v.string()),
    downloadToken: v.optional(v.string()),
    downloadTokenExpiry: v.optional(v.float64()),
    downloadCount: v.float64(),
  })
    .index("by_bookId", ["bookId"])
    .index("by_robokassaInvoiceId", ["robokassaInvoiceId"])
    .index("by_downloadToken", ["downloadToken"])
    .index("by_status", ["status"]),

  orderEvents: defineTable({
    orderId: v.id("orders"),
    eventType: v.string(),
    details: v.optional(v.string()),
  }).index("by_orderId", ["orderId"]),

  invoiceCounter: defineTable({
    value: v.float64(),
  }),

  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.float64(),
  }).index("by_token", ["token"]),

  profile: defineTable({
    name: v.string(),
    title: v.string(),
    bio: v.string(),
    extendedBio: v.string(),
    researchInterests: v.array(v.string()),
    university: v.string(),
    email: v.string(),
    location: v.string(),
    cvUrl: v.string(),
    profilePhotoPosition: v.optional(v.string()),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    profilePhotoStorageId: v.optional(v.id("_storage")),
  }),

  mediaItems: defineTable({
    title: v.string(),
    date: v.string(),
    type: v.union(
      v.literal("Lecture"),
      v.literal("Interview"),
      v.literal("Conference"),
      v.literal("Talk")
    ),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    status: v.union(v.literal("published"), v.literal("draft")),
  }).index("by_status", ["status"]),

  researchPapers: defineTable({
    title: v.string(),
    year: v.string(),
    journal: v.optional(v.string()),
    authors: v.string(),
    pdfUrl: v.optional(v.string()),
    abstract: v.string(),
    contentBlocks: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("paragraph"),
            v.literal("heading"),
            v.literal("image"),
            v.literal("quote")
          ),
          text: v.optional(v.string()),
          imageStorageId: v.optional(v.id("_storage")),
          imageCaption: v.optional(v.string()),
          level: v.optional(v.float64()),
        })
      )
    ),
    coverImageStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("published"), v.literal("draft")),
  })
    .index("by_status", ["status"])
    .index("by_year", ["year"]),

  coAuthors: defineTable({
    name: v.string(),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    cvEntries: v.array(
      v.object({
        year: v.string(),
        role: v.string(),
        context: v.string(),
      })
    ),
    sortOrder: v.float64(),
    status: v.union(v.literal("published"), v.literal("draft")),
  }).index("by_status", ["status"]),

  galleryPhotos: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.id("_storage"),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    sortOrder: v.float64(),
    status: v.union(v.literal("published"), v.literal("draft")),
  }).index("by_status", ["status"]),
});
