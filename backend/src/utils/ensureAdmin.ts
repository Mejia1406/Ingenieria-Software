import bcrypt from 'bcryptjs';
import User from '../models/User';

export async function ensureAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      return; // No seed if env vars not present
    }
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.userType !== 'admin') {
        existing.userType = 'admin';
        await existing.save();
        console.log(`[ensureAdmin] Promoted existing user ${email} to admin.`);
      }
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      password: hash,
      firstName: 'System',
      lastName: 'Admin',
      userType: 'admin',
      location: { city: '', country: '' }
    });
    console.log(`[ensureAdmin] Created admin user ${email}.`);
  } catch (err) {
    console.error('[ensureAdmin] Error creating admin user', err);
  }
}
