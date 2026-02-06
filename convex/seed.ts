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

    // Seed profiles
    await ctx.db.insert("profile", {
      slug: "sabina",
      name: "Аязбекова Сабина Шариповна",
      title: "Доктор философских наук, кандидат искусствоведения, профессор",
      bio: "Аязбекова Сабина Шариповна — доктор философских наук, кандидат искусствоведения, профессор, академик Казахстанской национальной академии искусств, академик Международной академии наук (Великобритания), академик Российской академии естествознания.",
      extendedBio:
        "С 2009 года работает в Казахстанском филиале МГУ имени М.В. Ломоносова в качестве профессора. Специализируется в области философии, культурологии и искусствоведения. Основные направления исследований — евразийские цивилизации и культурное наследие Великой Степи. Публикуется в международных изданиях, индексируемых в Scopus и Web of Science.",
      researchInterests: [
        "Философия",
        "Культурология",
        "Искусствоведение",
        "Евразийские цивилизации",
      ],
      university: "МГУ имени М.В. Ломоносова (Казахстанский филиал)",
      email: "ayazbekovas@gmail.com",
      location: "г. Астана, Казахстан",
      cvUrl: "#",
    });

    await ctx.db.insert("profile", {
      slug: "skandarbek",
      name: "Аязбеков Скандарбек Ахметович",
      title: "Профессор",
      bio: "Аязбеков Скандарбек Ахметович — профессор, исследователь цивилизаций Великой Степи и Ботайской культуры.",
      extendedBio:
        "Автор ряда монографий, посвящённых цивилизациям Великой Степи, Ботайской культуре и её вкладу в мировую историю. Соавтор исследований, раскрывающих роль Ботайской культуры как колыбели одомашнивания лошади и генератора цивилизационных процессов.",
      researchInterests: [
        "Цивилизации Великой Степи",
        "Ботайская культура",
        "Философия истории",
        "Археология",
      ],
      university: "МГУ имени М.В. Ломоносова (Казахстанский филиал)",
      email: "biligbaspa@mail.ru",
      location: "г. Астана, Казахстан",
      cvUrl: "#",
    });

    // Seed books
    // Book 1: Мир музыки Газизы Жубановой
    await ctx.db.insert("books", {
      title: "Мир музыки Газизы Жубановой",
      year: "2019",
      publisher: "Баспа-АС",
      isbn: "",
      coverImage: "/covers/book-cover1.png",
      description:
        "Монография посвящена осмыслению культурного взаимодействия Европы и Азии, парадигме Запад-Восток в контексте музыкальных традиций и этнической самоидентификации.",
      abstract:
        "В монографии рассматриваются вопросы бикультурного творчества Газизы Жубановой, анализируется музыкальное воспитание, музыкальный интеллект и функционирование этнических традиций в академической музыке. Издание представляет интерес для музыковедов, культурологов и специалистов в области межкультурной коммуникации.",
      toc: [
        "Культурное взаимодействие Европы и Азии",
        "Парадигма Запад-Восток",
        "Музыкальные традиции и этническая самоидентификация",
        "Бикультурное творчество Г. Жубановой",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 2: Коркут-Ата и философия музыки казахов
    await ctx.db.insert("books", {
      title: "Коркут-Ата и философия музыки казахов",
      year: "2021",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover2.png",
      description:
        "Монография раскрывает аксиологический и культуротворческий подход к осмыслению образа Коркут-Ата и философии казахской музыки.",
      abstract:
        "В монографии анализируются космоцентрическое и социоцентрическое мировоззрение, мирообразующее и миромоделирующее значение Коркут-Ата. Издание адресовано специалистам в области философии, теории культуры, истории, востоковедения и музыкознания.",
      toc: [
        "Аксиологический подход к образу Коркут-Ата",
        "Космоцентрическое мировоззрение",
        "Социоцентрическое мировоззрение",
        "Мирообразующее значение Коркут-Ата",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 3: Культура и искусство Великой Степи
    await ctx.db.insert("books", {
      title: "Культура и искусство Великой Степи",
      year: "2023",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover3.png",
      description:
        "Монография является продолжением исследования «Цивилизации Великой Степи» и посвящена генетическим связям кочевых, тенгрианских и скифо-сакских культур.",
      abstract:
        "В издании показаны генетические связи культур номадов, тенгрианства и скифо-сакского мира. Монография рекомендована для искусствоведов, философов, историков и культурологов.",
      toc: [
        "Генетические связи номадических культур",
        "Тенгрианские традиции",
        "Скифо-сакский мир",
        "Культурное наследие Великой Степи",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 4: Man and Society in Botai Culture (English)
    await ctx.db.insert("books", {
      title: "Man and Society in Botai Culture: Civilizational Discourse",
      year: "2023",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover4.png",
      description:
        "A monograph exploring the Botai culture as the earliest center of horse domestication and its role in generating civilizational processes.",
      abstract:
        "The Botai culture, discovered by archaeologist V.F. Smirnov, is world-renowned as the earliest horse domestication center. This study employs interdisciplinary methodology spanning civiliziology, philosophy, archaeology, history, DNA genealogy, linguistics, cultural studies, and ethnology. Key findings include Botai as a source of Kazakh statehood, a generator of multiple civilizations, and a site containing the earliest writing forms.",
      toc: [
        "Botai Culture: Discovery and Significance",
        "Interdisciplinary Methodology",
        "Horse Domestication and Civilization",
        "Botai as Generator of Civilizations",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 5: Ботай мәдениетіндегі адам және қоғам (Kazakh)
    await ctx.db.insert("books", {
      title: "Ботай мәдениетіндегі адам және қоғам: өркениеттік дискурс",
      year: "2023",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover5.png",
      description:
        "Ботай мәдениеті — жылқыны алғаш қолға үйреткен ежелгі орталық. Бұл монографияда өркениеттік контекстте адам мен қоғам мәселелері зерттелген.",
      abstract:
        "Монографияда пәнаралық әдіснама қолданылады: өркениеттану, философия, археология, тарих, ДНҚ генеалогиясы, лингвистика, мәдениеттану және этнология. Негізгі тұжырымдар: Ботай — қазақ мемлекеттігінің бастауы, бірнеше өркениеттердің генераторы.",
      toc: [
        "Ботай мәдениеті: ашылуы мен маңызы",
        "Пәнаралық әдіснама",
        "Жылқыны қолға үйрету және өркениет",
        "Ботай — өркениеттер генераторы",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 6: Человек и общество в Ботайской культуре (Russian)
    await ctx.db.insert("books", {
      title: "Человек и общество в Ботайской культуре: цивилизационный дискурс",
      year: "2023",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover6.png",
      description:
        "Монография посвящена Ботайской культуре — древнейшему центру одомашнивания лошади — и её роли как генератора цивилизационных процессов.",
      abstract:
        "Ботайская культура, открытая археологом В.Ф. Зайбертом, всемирно известна как древнейший центр доместикации лошади. В монографии применяется междисциплинарная методология: цивилизиология, философия, археология, история, ДНК-генеалогия, лингвистика, культурология и этнология. Ключевые выводы: Ботай как исток казахской государственности, генератор множества цивилизаций, носитель древнейших форм письменности.",
      toc: [
        "Ботайская культура: открытие и значение",
        "Междисциплинарная методология",
        "Доместикация лошади и цивилизация",
        "Ботай как генератор цивилизаций",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Book 7: Цивилизации Великой Степи
    await ctx.db.insert("books", {
      title: "Цивилизации Великой Степи",
      year: "2022",
      publisher: "Bilig",
      isbn: "",
      coverImage: "/covers/book-cover7.png",
      description:
        "Монография рассматривает мировые и глобальные цивилизации (синхронные и диахронные), локальные цивилизации (эндогенные и экзогенные) в контексте Великой Степи.",
      abstract:
        "В монографии анализируются номадические и оседлые цивилизации, тенгрианство и скифо-сакские цивилизации. Предлагается классификация цивилизационной системы Великой Степи. Издание адресовано историкам, философам, культурологам и всем интересующимся историей Центральной Азии.",
      toc: [
        "Мировые и глобальные цивилизации",
        "Локальные цивилизации",
        "Номадические и оседлые цивилизации",
        "Тенгрианство и скифо-сакский мир",
        "Классификация цивилизаций Великой Степи",
      ],
      status: "published",
      pdfPrice: 5000,
      pdfCurrency: "KZT",
      isPublished: true,
    });

    // Initialize invoice counter
    await ctx.db.insert("invoiceCounter", { value: 0 });

    return { message: "Seed data created successfully" };
  },
});
