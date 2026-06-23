import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import PeopleClient from "./people-client";

export default async function PeoplePage() {
  const pb = await getAuthenticatedClient();
  if (!pb) redirect("/login");
  const contacts = await pb.collection("contacts").getFullList({ sort: "name" });
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <PeopleClient contacts={contacts as any[]} />
  );
}
