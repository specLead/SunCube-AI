import knex from 'knex';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function bootstrap() {
  const email = process.env.ADMIN_EMAIL || 'admin@suncube.ai';
  const password = 'admin_password'; // Change in prod
  const hash = await bcrypt.hash(password, 10);

  try {
    const exists = await db('users').where({ email }).first();
    if (exists) {
        console.log('Admin already exists.');
    } else {
        await db('users').insert({
          email,
          password_hash: hash,
          role: 'admin',
          name: 'Super Admin'
        });
        console.log(`Admin created: ${email}`);
    }
  } catch (e) {
    console.error('Error bootstrapping admin:', e);
  } finally {
    await db.destroy();
  }
}

bootstrap();
