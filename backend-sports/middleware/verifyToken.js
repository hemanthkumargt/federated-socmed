import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.serverName !== process.env.SERVER_NAME) {
      return res.status(401).json({ message: "Invalid token origin" });
    }

    req.user = {
      userId: decoded.userId,
      federatedId: decoded.federatedId,
      displayName: decoded.displayName,
      serverName: decoded.serverName,
      role: decoded.role,
      image: decoded.image,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};
