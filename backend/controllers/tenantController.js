import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

// POST /tenants/:slug/upgrade  (Admin-only)
export const upgradeTenant = async (req, res) => {
  // console.log("Upgrade route hit:", req.params.slug, req.user);

  const { slug } = req.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const updated = await prisma.tenant.update({ where: { slug }, data: { plan: "pro" } });
  res.json({ message: "Tenant upgraded to Pro", tenant: updated });
};

// POST /tenants/:slug/invite  (Admin-only) -> create user in same tenant
// body: { email, role }
export const inviteUser = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ message: "email and role required" });

    // Ensure slug matches admin's tenant
    if (req.user.tenantSlug !== slug) return res.status(403).json({ message: "Can only invite to your own tenant" });

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Default password: "password" (for test/demo); in prod send invite flow
    const passwordHash = await bcrypt.hash("password", 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
        tenantId: tenant.id,
      },
    });

    res.status(201).json({ message: "User created (invite)", user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    if (err.code === "P2002") { // unique constraint (duplicate email)
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};
