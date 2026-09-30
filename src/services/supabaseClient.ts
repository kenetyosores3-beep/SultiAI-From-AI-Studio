import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, DayActivity } from '../types';

// Retrieve Supabase credentials if configured
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface GeneratedMediaRecord {
  id: string;
  userId?: string;
  mediaType: 'image' | 'video' | 'music' | 'audio' | 'transcript';
  title: string;
  prompt: string;
  targetDialect: string;
  mediaUrl: string;
  status: 'completed' | 'processing' | 'failed';
  aspectRatio?: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Service helper to save generated learning media to Supabase
export async function saveGeneratedMediaToSupabase(
  media: Omit<GeneratedMediaRecord, 'id' | 'createdAt'>
): Promise<GeneratedMediaRecord> {
  const newRecord: GeneratedMediaRecord = {
    ...media,
    id: 'media_' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  // If Supabase is connected, persist into Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase.from('generated_media').insert([
        {
          media_type: media.mediaType,
          title: media.title,
          prompt: media.prompt,
          target_dialect: media.targetDialect,
          media_url: media.mediaUrl,
          status: media.status,
          aspect_ratio: media.aspectRatio || '1:1',
          duration_seconds: media.durationSeconds || 0,
          metadata: media.metadata || {},
        },
      ]).select().single();

      if (!error && data) {
        return {
          id: data.id,
          userId: data.user_id,
          mediaType: data.media_type,
          title: data.title,
          prompt: data.prompt,
          targetDialect: data.target_dialect,
          mediaUrl: data.media_url,
          status: data.status,
          aspectRatio: data.aspect_ratio,
          durationSeconds: data.duration_seconds,
          metadata: data.metadata,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase media save fallback to local storage:', err);
    }
  }

  // Local storage cache fallback
  try {
    const existing = JSON.parse(localStorage.getItem('sultiai_generated_media') || '[]');
    localStorage.setItem('sultiai_generated_media', JSON.stringify([newRecord, ...existing]));
  } catch {
    // ignore
  }

  return newRecord;
}

// Fetch generated media
export async function fetchGeneratedMedia(): Promise<GeneratedMediaRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('generated_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          mediaType: d.media_type,
          title: d.title,
          prompt: d.prompt,
          targetDialect: d.target_dialect,
          mediaUrl: d.media_url,
          status: d.status,
          aspectRatio: d.aspect_ratio,
          durationSeconds: d.duration_seconds,
          metadata: d.metadata,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase media fetch fallback:', err);
    }
  }

  try {
    return JSON.parse(localStorage.getItem('sultiai_generated_media') || '[]');
  } catch {
    return [];
  }
}
