
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
} else {
    console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — auth disabled');
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

// --- SESSION KEEPALIVE ---
// Proactively refresh the session every 4 minutes to prevent token expiry.
// This is the "out of the box" fix for stale connections.
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

const startHeartbeat = () => {
    if (heartbeatInterval) return;
    heartbeatInterval = setInterval(async () => {
        try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                // Force refresh if token expires within 10 minutes
                const expiresAt = data.session.expires_at;
                if (expiresAt && expiresAt * 1000 - Date.now() < 10 * 60 * 1000) {
                    await supabase.auth.refreshSession();
                }
            }
        } catch (e) {
            console.warn('Heartbeat refresh failed:', e);
        }
    }, 4 * 60 * 1000); // every 4 minutes
};

// When user returns to the tab after being away, immediately refresh.
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            try {
                await supabase.auth.refreshSession();
            } catch (e) {
                console.warn('Visibility refresh failed:', e);
            }
        }
    });
}

startHeartbeat();

/**
 * Call this before any critical DB operation (complete quest, save user, load leaderboard).
 * It ensures the token is valid and retries once if expired.
 * PERFORMANCE: Caches the result for 60s to avoid redundant network roundtrips.
 */
let lastSessionCheck = 0;
const SESSION_CACHE_MS = 60_000; // 60 seconds

export const ensureSession = async (): Promise<boolean> => {
    // Check if device is physically offline first
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
        console.warn('Cannot ensure session: Device is offline');
        return false;
    }

    // Skip network roundtrip if verified recently (heartbeat handles long-term)
    const now = Date.now();
    if (now - lastSessionCheck < SESSION_CACHE_MS) {
        return true;
    }

    try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
            // Try to recover
            const { error } = await supabase.auth.refreshSession();
            if (error) return false;
        }
        lastSessionCheck = Date.now();
        return true;
    } catch {
        return false;
    }
};

export { supabase };
