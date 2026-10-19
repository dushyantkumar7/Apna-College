import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin ready: ${email} / ${password}`);

  // Demo course with sample videos so the platform is not empty after deploy.
  const slug = "getting-started-demo";
  const existing = await prisma.course.findUnique({ where: { slug } });

  if (!existing) {
    const course = await prisma.course.create({
      data: {
        title: "Getting Started (Demo Course)",
        slug,
        description:
          "A sample course to verify your platform works end-to-end. Delete it from the Admin panel once you upload your own content.",
        lessons: {
          create: [
            {
              title: "Lesson 1 – Welcome to the platform",
              description: "How courses, lessons and progress tracking work.",
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              position: 1,
            },
            {
              title: "Lesson 2 – Your first build",
              description: "A demo lesson with another public sample video.",
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              position: 2,
            },
          ],
        },
      },
    });
    console.log(`Demo course created: ${course.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
