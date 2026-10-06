
const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "..", ".env")
});

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
        "Supabase: configure SUPABASE_URL e SUPABASE_SECRET_KEY no arquivo .env."
    );
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = supabase;
