import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// login of all types of user
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email & password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  // fetch tenant slug for token
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });

  const token = generateToken(user, tenant);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: tenant?.slug ?? null,
      tenantPlan: tenant.plan,
    },
  });
};

// added this to reflect update in plan after upgrade limit (free -> pro)
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: {
          select: {
            slug: true,
            plan: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Flatten tenant info
    const userWithTenant = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
      tenantPlan: user.tenant.plan,
    };

    res.json({ user: userWithTenant });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
