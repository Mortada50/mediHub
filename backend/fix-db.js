import mongoose from "mongoose";
import { ENV } from "./src/config/env.js";

async function fixIndex() {
  try {
    await mongoose.connect(ENV.DB_URI);
    console.log("Connected to DB...");
    
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    await db.collection("patients").dropIndex("clerkUserId_1");
    console.log("✅ Dropped clerkUserId_1 index successfully.");
    
  } catch (error) {
    if (error.codeName === "IndexNotFound") {
      console.log("✅ Index already dropped or doesn't exist.");
    } else {
      console.error("❌ Error dropping index:", error);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

fixIndex();
