import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hoppr Business database...");

  // ── Clean existing seed data ──────────────────────────────────
  // Delete dependent records first (respect foreign key constraints)
  await prisma.eventParticipant.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.event.deleteMany();
  await prisma.passPurchase.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.pass.deleteMany();
  await prisma.barManager.deleteMany();
  await prisma.barAnalytics.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.bar.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@hoppr.fi",
      username: "admin",
      passwordHash,
      role: "SUPER_ADMIN",
      isAgeVerified: true,
    },
  });

  const managerLoose = await prisma.user.create({
    data: {
      email: "manager@barloose.fi",
      username: "manager_barloose",
      passwordHash,
      role: "BAR_MANAGER",
      isAgeVerified: true,
    },
  });

  const managerClubX = await prisma.user.create({
    data: {
      email: "manager@clubx.fi",
      username: "manager_clubx",
      passwordHash,
      role: "BAR_MANAGER",
      isAgeVerified: true,
    },
  });

  console.log("Created users:", admin.email, managerLoose.email, managerClubX.email);

  // ── Bars ──────────────────────────────────────────────────────
  const bars = await Promise.all([
    prisma.bar.create({
      data: {
        name: "Bar Loose",
        description:
          "Helsinki's premier rock bar with live music, great drinks, and an iconic atmosphere since 2005.",
        address: "Annankatu 21, 00100 Helsinki",
        latitude: 60.1675,
        longitude: 24.9372,
        phone: "+358 9 1234567",
        email: "info@barloose.fi",
        website: "https://barloose.fi",
        imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600",
        hours: {
          monday: { open: "16:00", close: "02:00" },
          tuesday: { open: "16:00", close: "02:00" },
          wednesday: { open: "16:00", close: "02:00" },
          thursday: { open: "16:00", close: "03:00" },
          friday: { open: "15:00", close: "04:00" },
          saturday: { open: "14:00", close: "04:00" },
          sunday: { open: "16:00", close: "00:00" },
        },
        amenities: ["Live Music", "Outdoor Terrace", "Pool Table", "Kitchen"],
        isActive: true,
      },
    }),
    prisma.bar.create({
      data: {
        name: "Club X",
        description:
          "Helsinki's hottest nightclub with world-class DJs, VIP lounges, and an unforgettable dance floor experience.",
        address: "Mannerheimintie 12, 00100 Helsinki",
        latitude: 60.171,
        longitude: 24.938,
        phone: "+358 9 7654321",
        email: "info@clubx.fi",
        website: "https://clubx.fi",
        imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600",
        hours: {
          thursday: { open: "22:00", close: "04:00" },
          friday: { open: "22:00", close: "05:00" },
          saturday: { open: "22:00", close: "05:00" },
        },
        amenities: ["VIP Lounge", "Coat Check", "Smoking Terrace"],
        isActive: true,
      },
    }),
    prisma.bar.create({
      data: {
        name: "The Cocktail",
        description:
          "An intimate speakeasy-style cocktail bar in the heart of Kallio, serving craft cocktails with a Nordic twist.",
        address: "Helsinginkatu 15, 00500 Helsinki",
        latitude: 60.184,
        longitude: 24.952,
        phone: "+358 9 5551234",
        email: "hello@thecocktail.fi",
        website: "https://thecocktail.fi",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600",
        hours: {
          tuesday: { open: "17:00", close: "01:00" },
          wednesday: { open: "17:00", close: "01:00" },
          thursday: { open: "17:00", close: "02:00" },
          friday: { open: "16:00", close: "03:00" },
          saturday: { open: "16:00", close: "03:00" },
          sunday: { open: "17:00", close: "00:00" },
        },
        amenities: ["Craft Cocktails", "Small Plates", "Intimate Setting"],
        isActive: true,
      },
    }),
    prisma.bar.create({
      data: {
        name: "BrewDog Helsinki",
        description:
          "Craft beer haven with 24 taps of BrewDog and guest beers, great bar food, and a lively beer garden.",
        address: "Tarkkampuja 3, 00130 Helsinki",
        latitude: 60.166,
        longitude: 24.946,
        phone: "+358 9 8881234",
        email: "helsinki@brewdog.fi",
        website: "https://brewdog.fi",
        imageUrl: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600",
        hours: {
          monday: { open: "14:00", close: "23:00" },
          tuesday: { open: "14:00", close: "23:00" },
          wednesday: { open: "14:00", close: "23:00" },
          thursday: { open: "14:00", close: "00:00" },
          friday: { open: "12:00", close: "02:00" },
          saturday: { open: "12:00", close: "02:00" },
          sunday: { open: "14:00", close: "22:00" },
        },
        amenities: ["24 Taps", "Beer Garden", "Kitchen", "Dog Friendly"],
        isActive: true,
      },
    }),
    prisma.bar.create({
      data: {
        name: "Sports Bar 99",
        description:
          "The ultimate sports viewing destination with 20+ screens, game-day specials, and an electric atmosphere.",
        address: "Fredrikinkatu 42, 00100 Helsinki",
        latitude: 60.163,
        longitude: 24.933,
        phone: "+358 9 9991234",
        email: "info@sportsbar99.fi",
        website: "https://sportsbar99.fi",
        imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600",
        hours: {
          monday: { open: "12:00", close: "01:00" },
          tuesday: { open: "12:00", close: "01:00" },
          wednesday: { open: "12:00", close: "01:00" },
          thursday: { open: "12:00", close: "02:00" },
          friday: { open: "11:00", close: "03:00" },
          saturday: { open: "11:00", close: "03:00" },
          sunday: { open: "11:00", close: "00:00" },
        },
        amenities: ["20+ Screens", "Game-Day Specials", "Pool Tables", "Kitchen"],
        isActive: true,
      },
    }),
  ]);

  console.log(
    "Created bars:",
    bars.map((b) => b.name).join(", ")
  );

  // ── Bar Managers ──────────────────────────────────────────────
  await prisma.barManager.createMany({
    data: [
      { userId: managerLoose.id, barId: bars[0].id, role: "MANAGER" },
      { userId: managerClubX.id, barId: bars[1].id, role: "MANAGER" },
    ],
  });

  // ── Also assign admin as manager of all bars ───────────────
  for (const bar of bars) {
    await prisma.barManager.create({
      data: { userId: admin.id, barId: bar.id, role: "OWNER" },
    });
  }

  console.log("Created bar manager assignments");

  // ── Promotions (2 per bar) ────────────────────────────────────
  const now = new Date();
  const day = 86400000;

  const promotionSeedData = [
    // Bar Loose
    {
      barId: bars[0].id,
      title: "Happy Hour: All Drafts 5€",
      description: "Every weekday from 16:00 to 19:00, all draft beers for just 5 euros.",
      discountType: "HAPPY_HOUR",
      discountValue: 40,
      startDate: new Date(now.getTime() - 7 * day),
      endDate: new Date(now.getTime() + 30 * day),
    },
    {
      barId: bars[0].id,
      title: "Live Music Thursdays",
      description: "Free entry before 21:00 when you show your Hoppr pass.",
      discountType: "COVER_DISCOUNT",
      discountValue: 100,
      startDate: new Date(now.getTime() - 3 * day),
      endDate: new Date(now.getTime() + 60 * day),
    },
    // Club X
    {
      barId: bars[1].id,
      title: "Ladies Night: Free Entry",
      description: "Ladies get free entry and a complimentary welcome drink every Saturday.",
      discountType: "LADIES_NIGHT",
      discountValue: 100,
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 45 * day),
    },
    {
      barId: bars[1].id,
      title: "Student Fridays: 50% Off Cover",
      description: "Show your student ID at the door for half-price entry every Friday.",
      discountType: "STUDENT_DISCOUNT",
      discountValue: 50,
      startDate: new Date(now.getTime() - 2 * day),
      endDate: new Date(now.getTime() + 60 * day),
    },
    // The Cocktail
    {
      barId: bars[2].id,
      title: "Cocktail of the Week: 9€",
      description: "Try our featured Nordic cocktail each week at a special price.",
      discountType: "DRINK_SPECIAL",
      discountValue: 35,
      startDate: new Date(now.getTime() - 5 * day),
      endDate: new Date(now.getTime() + 21 * day),
    },
    {
      barId: bars[2].id,
      title: "Date Night: 2-for-1 Cocktails",
      description: "Bring a date on Tuesdays and get two cocktails for the price of one.",
      discountType: "DRINK_SPECIAL",
      discountValue: 50,
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 90 * day),
    },
    // BrewDog Helsinki
    {
      barId: bars[3].id,
      title: "New Brew Tasting Flight",
      description: "Sample 4 new brews for 12€ every Wednesday evening.",
      discountType: "DRINK_SPECIAL",
      discountValue: 30,
      startDate: new Date(now.getTime() - 2 * day),
      endDate: new Date(now.getTime() + 30 * day),
    },
    {
      barId: bars[3].id,
      title: "Sunday Roast & Pint: 18€",
      description: "Sunday roast with a pint of BrewDog for just 18 euros.",
      discountType: "HAPPY_HOUR",
      discountValue: 25,
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 60 * day),
    },
    // Sports Bar 99
    {
      barId: bars[4].id,
      title: "Game Day Bucket Special",
      description: "5 beers for 22€ during any live Premier League or Champions League match.",
      discountType: "DRINK_SPECIAL",
      discountValue: 35,
      startDate: new Date(now.getTime()),
      endDate: new Date(now.getTime() + 45 * day),
    },
    {
      barId: bars[4].id,
      title: "UFC Nights: Free Entry",
      description: "Free entry for all UFC PPV events. Book your table in advance!",
      discountType: "COVER_DISCOUNT",
      discountValue: 100,
      startDate: new Date(now.getTime() - 1 * day),
      endDate: new Date(now.getTime() + 120 * day),
    },
  ];

  for (const promo of promotionSeedData) {
    await prisma.promotion.create({ data: promo });
  }

  console.log(`Created ${promotionSeedData.length} promotions`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
