import jwt from 'jsonwebtoken';

export function requireAuth(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ message: 'Please log in to continue.' });
  try { request.user = jwt.verify(token, process.env.JWT_SECRET); return next(); }
  catch { return response.status(401).json({ message: 'Your session has expired. Please log in again.' }); }
}
