import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Only seed if tables are empty
    const existingBooks = await ctx.db.query("books").first();
    const existingProfile = await ctx.db.query("profile").first();

    if (existingBooks || existingProfile) {
      return { message: "Data already exists, skipping seed" };
    }

    // Seed profile
    await ctx.db.insert("profile", {
      name: "Dr. Elena Vance",
      title: "Professor of Theoretical Linguistics",
      bio: "Elena Vance is a researcher and educator focused on the intersection of cognitive syntax and computational semantic models. She currently leads the Language & Logic Lab.",
      extendedBio:
        "With over two decades of research, Dr. Vance has pioneered several frameworks in minimalist syntax. Her work often bridges the gap between traditional philology and modern neural linguistics. Previously, she held chairs at Oxford and Stanford.",
      researchInterests: [
        "Minimalist Syntax",
        "Formal Semantics",
        "Cognitive Neuroscience",
        "Historical Linguistics",
      ],
      university: "State University of Research",
      email: "e.vance@university.edu",
      location: "Building B, Room 402",
      cvUrl: "#",
    });

    // Seed books
    await ctx.db.insert("books", {
      title: "The Architecture of Syntax",
      year: "2021",
      publisher: "Oxford University Press",
      isbn: "978-0198812345",
      coverImage: "https://picsum.photos/seed/book1/400/600",
      description:
        "A comprehensive look at minimalist program developments.",
      abstract:
        "This monograph explores the evolution of the minimalist program over the last decade, proposing a new model for phase-theoretic derivations that accounts for cross-linguistic variations in word order.",
      toc: [
        "Preliminaries: The Internal System of Meaning",
        "Recursive Structures and Functional Heads",
        "A New Model for Phase Inheritance",
        "Empirical Evidence from Romance Dialects",
        "Concluding Remarks on Biolinguistics",
      ],
      status: "published",
      litresUrl: "https://www.litres.ru/",
      pdfPrice: 2990,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    await ctx.db.insert("books", {
      title: "Meaning in Motion",
      year: "2018",
      publisher: "MIT Press",
      isbn: "978-0262534567",
      coverImage: "https://picsum.photos/seed/book2/400/600",
      description: "Dynamic semantics and the evolution of language.",
      abstract:
        "Meaning in Motion challenges static views of semantics, arguing for a fluid interpretative process that mirrors biological cognitive growth.",
      toc: [
        "Introduction to Dynamic Semantics",
        "Historical Perspectives",
        "Cognitive Mechanisms",
        "Neurolinguistic Evidence",
        "Modern Applications and Future Directions",
      ],
      status: "published",
      litresUrl: "https://www.litres.ru/",
      pdfPrice: 3500,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Seed media
    await ctx.db.insert("mediaItems", {
      title: "Annual Keynote: The Future of Formalism",
      date: "2023-11-15",
      type: "Lecture",
      description: "Delivered at the International Linguistics Conference.",
      videoUrl: "dQw4w9WgXcQ",
      tags: ["Formalism", "Keynote", "2023"],
      status: "published",
    });

    await ctx.db.insert("mediaItems", {
      title: "Interview with Lexical Radio",
      date: "2022-05-10",
      type: "Interview",
      description:
        "A deep dive into cognitive syntax for a general audience.",
      videoUrl: "dQw4w9WgXcQ",
      tags: ["Interview", "Popular Science"],
      status: "published",
    });

    // Seed research
    await ctx.db.insert("researchPapers", {
      title: "On the Nature of Phase Boundaries",
      year: "2023",
      journal: "Linguistic Inquiry",
      authors: "Elena Vance, Marcus Aurelius",
      abstract:
        "This paper provides empirical evidence for the rigidity of phase boundaries in Germanic languages.",
      status: "published",
    });

    // Initialize invoice counter
    await ctx.db.insert("invoiceCounter", { value: 0 });

    return { message: "Seed data created successfully" };
  },
});
