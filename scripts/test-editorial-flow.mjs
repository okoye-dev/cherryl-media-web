#!/usr/bin/env node

/**
 * Cherryl Media — Editorial Flow Testing Script
 * Tests the complete lifecycle:
 * 1. Creates & persists a draft article in the database.
 * 2. Confirms media assets in storage.
 * 3. Publishes a different article, enforcing the media confirmation gatekeeper.
 * 4. Verifies post notification dispatch logging.
 * 5. Pins the published article via the Featured Decision Engine.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "../../backend");

console.log("🚀 Executing Cherryl Media Publish & Draft Flow Verification...\n");

const child = spawn("go", ["run", "./cmd/test-flow/main.go"], {
  cwd: backendDir,
  stdio: "inherit",
  env: process.env,
});

child.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Test flow completed successfully!");
  } else {
    console.error(`\n❌ Test flow exited with code ${code}`);
    process.exit(code || 1);
  }
});
