import { createClient } from "@supabase/supabase-js";
import { createDemoClient } from "./demoClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when the Supabase keys are missing. `createClient` throws on an empty
 * URL, which used to take the whole site down; instead the app runs on sample
 * data held in memory (see lib/demoClient.js), so it can always be previewed.
 */
export const isDemo = !supabaseUrl || !supabaseAnonKey;

if (isDemo) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars missing, so BloodLink is running on sample data. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to use the real database."
  );
}

export const supabase = isDemo
  ? createDemoClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 5 } },
    });
