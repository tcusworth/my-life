#!/usr/bin/env node

/**
 * Seed default areas for a PocketBase user.
 *
 * Usage:
 *   POCKETBASE_URL=https://pb.example.com \
 *   SEED_USER_EMAIL=you@example.com \
 *   SEED_USER_PASSWORD=secret \
 *   npm run seed:areas
 */

const POCKETBASE_URL = process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL;
const EMAIL = process.env.SEED_USER_EMAIL;
const PASSWORD = process.env.SEED_USER_PASSWORD;

const DEFAULT_AREAS = [
  "CSI",
  "OPAcommunity",
  "Daily AI Productivity",
  "Flatirons Creative Studio",
  "Personal",
];

function normalizeName(value) {
  return value.trim().toLowerCase();
}

async function main() {
  if (!POCKETBASE_URL) {
    console.error("Missing POCKETBASE_URL or NEXT_PUBLIC_POCKETBASE_URL");
    process.exit(1);
  }

  if (!EMAIL || !PASSWORD) {
    console.error("Missing SEED_USER_EMAIL and SEED_USER_PASSWORD");
    process.exit(1);
  }

  const authResponse = await fetch(
    `${POCKETBASE_URL}/api/collections/users/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
    }
  );

  if (!authResponse.ok) {
    console.error("Authentication failed:", await authResponse.text());
    process.exit(1);
  }

  const auth = await authResponse.json();
  const token = auth.token;
  const userId = auth.record.id;

  const listResponse = await fetch(
    `${POCKETBASE_URL}/api/collections/areas/records?perPage=200`,
    {
      headers: { Authorization: token },
    }
  );

  if (!listResponse.ok) {
    console.error("Failed to list areas:", await listResponse.text());
    process.exit(1);
  }

  const existing = (await listResponse.json()).items ?? [];
  const existingNames = new Set(existing.map((area) => normalizeName(area.name)));

  const created = [];
  const skipped = [];

  for (const [index, name] of DEFAULT_AREAS.entries()) {
    if (existingNames.has(normalizeName(name))) {
      skipped.push(name);
      continue;
    }

    const createResponse = await fetch(
      `${POCKETBASE_URL}/api/collections/areas/records`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userId, name, sortOrder: index }),
      }
    );

    if (!createResponse.ok) {
      console.error(`Failed to create area ${name}:`, await createResponse.text());
      process.exit(1);
    }

    created.push(name);
    existingNames.add(normalizeName(name));
  }

  console.log("Seed complete");
  if (created.length) console.log("Created:", created.join(", "));
  if (skipped.length) console.log("Skipped:", skipped.join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
