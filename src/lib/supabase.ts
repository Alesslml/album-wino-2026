import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://exjxhpktxsnbjfhvjfzc.supabase.co";
const SUPABASE_KEY = "sb_publishable_d7xHSukjsdBRI1lN3B0TYw_BHVjcsrA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
