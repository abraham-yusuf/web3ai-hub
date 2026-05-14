import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { hashPassword } from "../src/lib/auth-utils";

async function getAuthToken(): Promise<string> {
  if (process.env.AURORA_HOST && process.env.AWS_REGION && process.env.AURORA_USER) {
    const signer = new Signer({
      hostname: process.env.AURORA_HOST,
      port: parseInt(process.env.AURORA_PORT || "5432"),
      region: process.env.AWS_REGION,
      username: process.env.AURORA_USER,
    })
    return await signer.getAuthToken()
  }
  if (!process.env.AURORA_PASSWORD) {
    throw new Error("AURORA_PASSWORD atau IAM konfigurasi wajib diisi.")
  }
  return process.env.AURORA_PASSWORD
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  let pool: Pool;

  if (process.env.AURORA_HOST && process.env.AURORA_USER && process.env.AURORA_DATABASE) {
    pool = new Pool({
      host: process.env.AURORA_HOST,
      port: parseInt(process.env.AURORA_PORT || "5432"),
      user: process.env.AURORA_USER,
      database: process.env.AURORA_DATABASE,
      password: () => getAuthToken(),
      ssl: { rejectUnauthorized: false },
    })
  } else if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  } else {
    console.error("❌ DATABASE_URL atau AURORA_* variables must be set in .env");
    process.exit(1);
  }

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

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
    await pool.end();
  }
}

main();
