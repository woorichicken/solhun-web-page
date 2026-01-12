import { db, changelogs } from "../lib/db";

async function main() {
  const result = await db.insert(changelogs).values({
    version: "v1.3.3",
    date: "Jan 12, 2026",
    title: "Bug Fix",
    description: "Terminal scroll fix",
    improvements: [],
    fixes: [{ text: "Fixed terminal scroll synchronization issue" }],
    patches: [],
    isFeatured: false,
  }).returning();
  
  console.log("Created:", result);
  process.exit(0);
}

main();
