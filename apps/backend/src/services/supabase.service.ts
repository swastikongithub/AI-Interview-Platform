import { SupabaseClient } from '@supabase/supabase-js';
import { User, UserRole, CandidateProfile, Job } from '../types';
import dotenv from 'dotenv';
import { databaseConfig, supabaseAdmin } from '../config/database';

dotenv.config();

export const isRealSupabase = databaseConfig.isRealSupabase;
export const supabase: SupabaseClient | null = supabaseAdmin;

export class SupabaseService {
  /**
   * Fetch a user by ID.
   */
  static async getUserById(userId: string): Promise<User | null> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as User;
  }

  /**
   * Update a user's role.
   */
  static async updateUserRole(userId: string, role: UserRole): Promise<User> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  /**
   * Fetch a candidate profile by User ID.
   */
  static async getProfileByUserId(userId: string): Promise<CandidateProfile | null> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as CandidateProfile;
  }

  /**
   * Upsert a candidate profile.
   */
  static async upsertProfile(profile: Partial<CandidateProfile> & { user_id: string }): Promise<CandidateProfile> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data as CandidateProfile;
  }

  /**
   * Fetch a job by ID.
   */
  static async getJobById(jobId: string): Promise<Job | null> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Job;
  }

  /**
   * Fetch all active jobs.
   */
  static async getJobs(): Promise<Job[]> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Job[];
  }

  /**
   * Upload resume to storage bucket
   */
  static async uploadResumeFile(userId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    
    // Only PDFs are ever accepted upstream (multer fileFilter enforces this); never derive
    // the storage key extension from the client-supplied filename.
    const fileName = `${userId}/${Date.now()}.pdf`;
    
    const { error } = await supabase.storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) throw error;
    return fileName;
  }

  /**
   * Get public URL for resume
   */
  static getResumeUrl(filePath: string): string {
    if (!isRealSupabase || !supabase) {
      throw new Error('FATAL: Real Supabase connection is required. Mock fallback is disabled.');
    }
    const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
    return data.publicUrl;
  }
}
