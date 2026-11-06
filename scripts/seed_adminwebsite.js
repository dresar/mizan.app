const fs = require('fs');
const env = fs.readFileSync('/opt/data/home/mizan.apps/.env', 'utf-8');
const match = env.match(/DATABASE_URL=([^\r\n]+)/);
const dbUrl = match[1].replace(/['"]/g, '');
const { Client } = require('/opt/data/home/mizan.apps/portal/node_modules/pg');

async function main() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  await client.query(`
    INSERT INTO users_user (
      password, is_superuser, username, first_name, last_name, email,
      is_staff, is_active, date_joined, role, phone, created_at, updated_at
    ) VALUES (
      $1, false, 'adminwebsite', 'Admin', 'Website', 'adminwebsite@pesantren.com',
      true, true, NOW(), 'adminwebsite', '081234567891', NOW(), NOW()
    ) ON CONFLICT (username) DO UPDATE SET role = 'adminwebsite', is_active = true
  `, ['$2a$10$b0PeE80L3QTd.cXNRTmLv.cL9c26TlmGqwaHF7OkWKXj2dgFXpPw.']);

  await client.query(`
    INSERT INTO users (
      id, username, password, name, role, role_title, avatar_initials, is_active
    ) VALUES (
      'user-adminwebsite', 'adminwebsite', 'password123', 'Admin Website Profil',
      'adminwebsite', 'Admin Website Panel', 'AW', true
    ) ON CONFLICT (username) DO UPDATE SET role = 'adminwebsite', is_active = true
  `);

  const res = await client.query("SELECT username, role, is_active FROM users_user WHERE username = 'adminwebsite'");
  console.log('Result in users_user:', res.rows);

  const res2 = await client.query("SELECT username, role, is_active FROM users WHERE username = 'adminwebsite'");
  console.log('Result in users:', res2.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
