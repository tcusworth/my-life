import { getAdminClient } from "@/lib/pocketbase/admin";

async function main() {
  const pb = await getAdminClient();

  const collections = await pb.collections.getFullList();
  const exists = collections.some((c) => c.name === "oauth_connections");

  if (exists) {
    console.log("oauth_connections collection already exists");
    return;
  }

  await pb.collections.create({
    name: "oauth_connections",
    type: "base",
    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: { collectionId: "_pb_users_auth_", cascadeDelete: false, maxSelect: 1 },
      },
      {
        name: "provider",
        type: "text",
        required: true,
        options: { pattern: "^(google|microsoft)$" },
      },
      {
        name: "accessToken",
        type: "text",
        required: true,
      },
      {
        name: "refreshToken",
        type: "text",
        required: true,
      },
      {
        name: "expiresAt",
        type: "date",
        required: true,
      },
      {
        name: "providerEmail",
        type: "text",
        required: true,
      },
      {
        name: "scopes",
        type: "text",
        required: false,
      },
    ],
  });

  console.log("Created oauth_connections collection");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
