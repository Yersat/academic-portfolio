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
      name: "Аязбеков Скандарбек & Аязбекова Сабина",
      title: "Профессора культурологии и философии",
      bio: "Аязбеков Скандарбек и Аязбекова Сабина — исследователи и педагоги, работающие на стыке культурологии, философии и искусствоведения. Совместно руководят научным направлением «Культура и цивилизация».",
      extendedBio:
        "За более чем два десятилетия научной работы профессора Аязбековы внесли значительный вклад в развитие культурологии и философии в Казахстане и за его пределами. Их исследования охватывают широкий спектр тем — от теории культуры до музыковедения и философии искусства.",
      researchInterests: [
        "Культурология",
        "Философия культуры",
        "Искусствоведение",
        "Музыковедение",
      ],
      university: "Университет",
      email: "contact@bilig.kz",
      location: "Казахстан",
      cvUrl: "#",
    });

    // Seed books
    await ctx.db.insert("books", {
      title: "Культура и цивилизация",
      year: "2021",
      publisher: "Издательство «Наука»",
      isbn: "978-0198812345",
      coverImage: "https://picsum.photos/seed/book1/400/600",
      description:
        "Монография, посвящённая теоретическим основам взаимосвязи культуры и цивилизации.",
      abstract:
        "В данной монографии рассматриваются основные концепции взаимосвязи культуры и цивилизации, предлагается новый методологический подход к анализу культурных процессов в контексте глобализации.",
      toc: [
        "Введение: Культура как система",
        "Цивилизационные подходы в культурологии",
        "Методология исследования культурных процессов",
        "Эмпирический анализ культурных трансформаций",
        "Заключение и перспективы",
      ],
      status: "published",
      litresUrl: "https://www.litres.ru/",
      pdfPrice: 2990,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    await ctx.db.insert("books", {
      title: "Философия музыки",
      year: "2018",
      publisher: "Издательство «Мысль»",
      isbn: "978-0262534567",
      coverImage: "https://picsum.photos/seed/book2/400/600",
      description: "Философский анализ музыкального искусства и его роли в культуре.",
      abstract:
        "Книга «Философия музыки» предлагает глубокий анализ музыкального искусства с позиций философии культуры, рассматривая музыку как отражение цивилизационных процессов.",
      toc: [
        "Введение в философию музыки",
        "Исторические перспективы",
        "Музыка и когнитивные процессы",
        "Нейроэстетика музыкального восприятия",
        "Современные подходы и перспективы",
      ],
      status: "published",
      litresUrl: "https://www.litres.ru/",
      pdfPrice: 3500,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Seed media
    await ctx.db.insert("mediaItems", {
      title: "Ежегодный доклад: Будущее культурологии",
      date: "2023-11-15",
      type: "Лекция",
      description: "Доклад на Международной конференции по культурологии.",
      videoUrl: "dQw4w9WgXcQ",
      tags: ["Культурология", "Доклад", "2023"],
      status: "published",
    });

    await ctx.db.insert("mediaItems", {
      title: "Интервью для научного радио",
      date: "2022-05-10",
      type: "Интервью",
      description:
        "Подробный разговор о философии культуры для широкой аудитории.",
      videoUrl: "dQw4w9WgXcQ",
      tags: ["Интервью", "Научпоп"],
      status: "published",
    });

    // Seed research
    await ctx.db.insert("researchPapers", {
      title: "О природе культурных границ",
      year: "2023",
      journal: "Вопросы культурологии",
      authors: "Аязбеков С., Аязбекова С.",
      abstract:
        "В статье представлены эмпирические данные о формировании и трансформации культурных границ в условиях глобализации.",
      status: "published",
    });

    // Initialize invoice counter
    await ctx.db.insert("invoiceCounter", { value: 0 });

    return { message: "Seed data created successfully" };
  },
});
