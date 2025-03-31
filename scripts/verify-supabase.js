// This script verifies your Supabase connection
// Run it with: node scripts/verify-supabase.js

const { createClient } = require("@supabase/supabase-js");

// Check if environment variables are set
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error("❌ Error: Supabase environment variables are not set");
  console.log("Please set the following environment variables:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function verifyConnection() {
  try {
    // Try to get the current user to test the connection
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Error connecting to Supabase:", error.message);
      process.exit(1);
    }

    console.log("✅ Successfully connected to Supabase!");
    console.log("Your Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Check if tables exist
    const { data: tableData, error: tableError } = await supabase
      .from("api_keys")
      .select("count")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01") {
        // Table doesn't exist
        console.log(
          "⚠️ The api_keys table does not exist yet. Run migrations to create it.",
        );
      } else {
        console.error("❌ Error checking tables:", tableError.message);
      }
    } else {
      console.log("✅ Database tables are set up correctly!");
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    process.exit(1);
  }
}

verifyConnection();
