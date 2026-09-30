import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Database, Copy, Check, Terminal, FileCode } from 'lucide-react';
import { CAPSTONE_CHECKLIST_DATA } from '../data/curriculumData';
import { CapstoneRequirement } from '../types';

interface CapstoneAuditModalProps {
  onClose: () => void;
}

const SUPABASE_MIGRATION_SQL = `-- ============================================================================
-- SultiAI Capstone Project: Supabase Migration Script
-- Objective: Enforce Row Level Security (RLS) on 'profiles' and 'lesson_attempts'
-- Target Database: Supabase / PostgreSQL
-- Institution: Jose Maria College Foundation, Inc. (JMCFI) - BSIT Capstone
-- Author: Genesis Diaz
-- Date: September 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Table Definitions (Guaranteed existence & constraints)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    target_dialect TEXT DEFAULT 'davao_bisaya' CHECK (target_dialect IN ('davao_bisaya', 'cebuano_standard', 'boholano')),
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    level TEXT DEFAULT 'Level 1: Beginner',
    daily_goal_minutes INTEGER DEFAULT 15 CHECK (daily_goal_minutes > 0),
    today_minutes INTEGER DEFAULT 0 CHECK (today_minutes >= 0),
    vocabulary_mastered INTEGER DEFAULT 0 CHECK (vocabulary_mastered >= 0),
    speech_score_average NUMERIC(5,2) DEFAULT 0.0 CHECK (speech_score_average >= 0.0 AND speech_score_average <= 100.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lesson_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    accuracy_score NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (accuracy_score >= 0.0 AND accuracy_score <= 100.0),
    whisper_wer NUMERIC(5,2) DEFAULT 0.0 CHECK (whisper_wer >= 0.0),
    completed BOOLEAN DEFAULT true NOT NULL,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    attempt_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_target_dialect ON public.profiles(target_dialect);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_user_id ON public.lesson_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_lesson_id ON public.lesson_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_attempts_created_at ON public.lesson_attempts(created_at DESC);

-- ============================================================================
-- 2. Enable & Force Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Idempotent Policy Cleanup
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own lesson attempts" ON public.lesson_attempts;
DROP POLICY IF EXISTS "Users can insert their own lesson attempts" ON public.lesson_attempts;
DROP POLICY IF EXISTS "Users can update their own lesson attempts" ON public.lesson_attempts;
DROP POLICY IF EXISTS "Users can delete their own lesson attempts" ON public.lesson_attempts;

-- ============================================================================
-- 4. Create Strict RLS Policies for 'profiles'
-- Enforces: Users can ONLY read and update their own profile data.
-- ============================================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 5. Create Strict RLS Policies for 'lesson_attempts'
-- Enforces: Users can ONLY read, insert, and update their own learning records.
-- ============================================================================

CREATE POLICY "Users can view their own lesson attempts"
ON public.lesson_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson attempts"
ON public.lesson_attempts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson attempts"
ON public.lesson_attempts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. Automated Profile Creation Trigger on Supabase Auth Signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, email, full_name, avatar_url, target_dialect, xp, streak_days, level, daily_goal_minutes, today_minutes, vocabulary_mastered, speech_score_average, created_at, updated_at
    )
    VALUES (
        new.id, new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80'),
        COALESCE(new.raw_user_meta_data->>'target_dialect', 'davao_bisaya'),
        0, 1, 'Level 1: Beginner', 15, 0, 0, 0.0, now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. Timestamp Update Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS set_lesson_attempts_updated_at ON public.lesson_attempts;
CREATE TRIGGER set_lesson_attempts_updated_at
    BEFORE UPDATE ON public.lesson_attempts
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();`;

export const CapstoneAuditModal: React.FC<CapstoneAuditModalProps> = ({ onClose }) => {
  const [modalTab, setModalTab] = useState<'checklist' | 'supabase_rls'>('checklist');
  const [items, setItems] = useState<CapstoneRequirement[]>(CAPSTONE_CHECKLIST_DATA);
  const [selectedItem, setSelectedItem] = useState<CapstoneRequirement | null>(items[0]);
  const [copied, setCopied] = useState(false);

  const verifiedCount = items.filter((i) => i.status === 'verified').length;
  const progressPct = Math.round((verifiedCount / items.length) * 100);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full h-[90vh] flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="font-display font-bold text-sm text-white">
                SultiAI Capstone Blueprint & Audit
              </h2>
              <p className="text-[11px] text-stone-400">
                BSIT Capstone Project · Jose Maria College Foundation, Inc.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pt-2 pb-2 bg-stone-950 border-b border-stone-800 flex gap-2">
          <button
            onClick={() => setModalTab('checklist')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              modalTab === 'checklist'
                ? 'bg-stone-800 text-teal-300 border border-teal-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Checklist (11/11)
          </button>
          <button
            onClick={() => setModalTab('supabase_rls')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              modalTab === 'supabase_rls'
                ? 'bg-stone-800 text-teal-300 border border-teal-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Supabase RLS</span>
          </button>
        </div>

        {/* TAB 1: CHECKLIST */}
        {modalTab === 'checklist' && (
          <>
            {/* Audit Status Bar */}
            <div className="p-3 bg-stone-950/70 border-b border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-300">Defense Verification Status</span>
                <span className="font-mono font-bold text-teal-400">{verifiedCount} of {items.length} ({progressPct}%)</span>
              </div>
              <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* 11 Requirements Checklist Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-stone-800/90 border-teal-500/80 shadow-md'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 fill-teal-400/20" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-snug">
                          {item.id}. {item.title}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem?.id === item.id && (
                    <div className="mt-2.5 pt-2.5 border-t border-stone-700/60 text-[11px] space-y-1 text-teal-200/90 bg-teal-950/30 p-2.5 rounded-xl">
                      <div className="font-semibold text-teal-300">Audited Evidence:</div>
                      <div>{item.evidence}</div>
                      <div className="text-[10px] text-stone-400 font-mono pt-1">
                        Verified: {item.verifiedTimestamp}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB 2: SUPABASE RLS MIGRATION */}
        {modalTab === 'supabase_rls' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Security Summary Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">public.profiles</span>
                  <span className="text-[9px] bg-teal-500/20 text-teal-300 font-semibold px-1.5 py-0.5 rounded">RLS Active</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  SELECT: <span className="font-mono text-teal-400">auth.uid() = id</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  UPDATE: <span className="font-mono text-teal-400">auth.uid() = id</span>
                </div>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">lesson_attempts</span>
                  <span className="text-[9px] bg-teal-500/20 text-teal-300 font-semibold px-1.5 py-0.5 rounded">RLS Active</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  SELECT: <span className="font-mono text-teal-400">auth.uid() = user_id</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  UPDATE: <span className="font-mono text-teal-400">auth.uid() = user_id</span>
                </div>
              </div>
            </div>

            {/* Migration File Header & Copy Button */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <FileCode className="w-4 h-4 text-teal-400" />
                <span className="font-mono text-[11px]">20260929000001_enforce_rls...sql</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-teal-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>

            {/* SQL Code Viewer */}
            <div className="bg-stone-950 rounded-2xl p-3 border border-stone-800 text-[10px] font-mono text-stone-300 overflow-x-auto max-h-[320px] whitespace-pre leading-relaxed select-all">
              {SUPABASE_MIGRATION_SQL}
            </div>

            {/* Research Note */}
            <div className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 text-[10px] text-stone-400 leading-normal">
              🔒 <span className="font-semibold text-stone-300">Security Rule Compliance:</span> Users can strictly read and modify only their own data rows. Automated signup triggers maintain zero orphaned records.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs">
          <span className="text-stone-400 text-[11px]">
            Lead Researcher: Genesis Diaz
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

