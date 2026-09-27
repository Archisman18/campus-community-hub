const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://grwplvhedmvzjediuflr.supabase.co';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_U8vuHdI3oW8w2iD9TmDgcQ_tDT-Q1OO';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;