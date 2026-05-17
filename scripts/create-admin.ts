import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth-utils";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  try {
    console.log(`⏳ Creating/updating admin user: ${email}...`);

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email,
        password: hashedPassword,
        role: "ADMIN",
        name: "Administrator",
        username: "admin",
      },
    });

    console.log(`✅ Admin user successfully created/updated: ${user.email}`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();