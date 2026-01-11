import { db, changelogs } from "../lib/db";

async function main() {
  const result = await db.insert(changelogs).values({
    version: "v1.3.1",
    date: "Jan 11, 2025",
    title: "Terminal PATH Fix",
    description: "Fixed command not found errors when launching from Finder/Spotlight",
    improvements: [],
    fixes: [
      { text: "Fixed \"command not found\" errors for brew, claude, direnv, etc. when launching app from Finder/Spotlight" },
      { text: "Terminal now starts as login shell (--login) on macOS/Linux to properly load .zprofile/.bash_profile" }
    ],
    patches: [],
    isFeatured: false,
    youtubeUrl: null,
  }).returning();
  
  console.log("Created changelog:", result);
  process.exit(0);
}

main();
