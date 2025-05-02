import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mtkfbnzhyfyomshvzpeb.supabase.co";  //Supabase project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10a2ZibnpoeWZ5b21zaHZ6cGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODA3NDEsImV4cCI6MjA1NzI1Njc0MX0.EUy_jh2ViLUCrbG_Dt0vKTPI4oJwAvAgNQaWDHalvzo";  //Supabase Anon Key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
