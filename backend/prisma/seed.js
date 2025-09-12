// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding DB...");

  // Create or upsert tenants
  const acme = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: { name: "Acme", slug: "acme", plan: "free" },
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: "globex" },
    update: {},
    create: { name: "Globex", slug: "globex", plan: "free" },
  });

  const pwHash = await bcrypt.hash("password", 10);

  // Helper to upsert users
  async function upsertUser(email, role, tenantId) {
    const ex = await prisma.user.findUnique({ where: { email } });
    if (ex) return ex;
    return prisma.user.create({
      data: { email, password: pwHash, role, tenantId },
    });
  }

  await upsertUser("admin@acme.test", "admin", acme.id);
  await upsertUser("user@acme.test", "member", acme.id);
  await upsertUser("admin@globex.test", "admin", globex.id);
  await upsertUser("user@globex.test", "member", globex.id);

  console.log("Seeding done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
