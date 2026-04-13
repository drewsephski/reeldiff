import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Unauthenticated client for public data (rarely used with RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Hook to create an authenticated Supabase client with Clerk JWT
export function useSupabase() {
  const { getToken } = useAuth();

  return useMemo(() => {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const token = await getToken({ template: 'supabase' });
          const headers = new Headers(options?.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          return fetch(url, { ...options, headers });
        },
      },
    });
  }, [getToken]);
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Project = Tables<'projects'>;
export type WebhookConfig = Tables<'webhook_configs'>;
export type Video = Tables<'videos'>;
export type SocialConnection = Tables<'social_connections'>;

// Database helper functions
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      webhook_configs(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateWebhookConfig(
  projectId: string, 
  config: Partial<Omit<WebhookConfig, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('webhook_configs')
    .upsert({ project_id: projectId, ...config })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProjectVideos(projectId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createVideo(video: Omit<Video, 'id' | 'created_at' | 'completed_at'>) {
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateVideoStatus(
  videoId: string, 
  status: Video['status'], 
  updates?: Partial<Video>
) {
  const { data, error } = await supabase
    .from('videos')
    .update({ 
      status, 
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      ...updates 
    })
    .eq('id', videoId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
