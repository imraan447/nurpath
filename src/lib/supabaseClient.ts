
import { createClient } from '@supabase/supabase-js';

// Configuration from your screenshot
const SUPABASE_URL = 'https://whrxgxwziopzwrelrztd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PTyO_vCea-XcrrrgOZAomw_eLnREpqn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
