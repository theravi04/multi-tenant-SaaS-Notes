import jwt from "jsonwebtoken";

const generateToken = (user, tenant) => {
  // user: prisma user object, tenant: { id, slug }
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || (tenant && tenant.id),
    tenantSlug: tenant ? tenant.slug : undefined,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });
};

export default generateToken;
