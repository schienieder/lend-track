-- Migration: Add reminders and reminder_configs tables
-- Run this migration in your Supabase SQL Editor

-- reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('due_date', 'overdue', 'custom')),
  reminder_date DATE NOT NULL,
  sent_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (sent_status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- reminder_configs table (per-loan settings)
CREATE TABLE IF NOT EXISTS reminder_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID UNIQUE NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  due_date_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1],
  overdue_days_after INTEGER[] DEFAULT ARRAY[1, 7, 14],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reminders_loan_id ON reminders(loan_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_status ON reminders(sent_status);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(loan_id, sent_status) WHERE sent_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminder_configs_loan_id ON reminder_configs(loan_id);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reminders table
-- Users can view reminders for their own loans
CREATE POLICY "Users can view their own reminders" ON reminders
  FOR SELECT USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can create reminders for their own loans
CREATE POLICY "Users can create reminders for their loans" ON reminders
  FOR INSERT WITH CHECK (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can update reminders for their own loans
CREATE POLICY "Users can update their own reminders" ON reminders
  FOR UPDATE USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can delete reminders for their own loans
CREATE POLICY "Users can delete their own reminders" ON reminders
  FOR DELETE USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- RLS Policies for reminder_configs table
-- Users can view configs for their own loans
CREATE POLICY "Users can view their own reminder configs" ON reminder_configs
  FOR SELECT USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can create configs for their own loans
CREATE POLICY "Users can create reminder configs for their loans" ON reminder_configs
  FOR INSERT WITH CHECK (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can update configs for their own loans
CREATE POLICY "Users can update their own reminder configs" ON reminder_configs
  FOR UPDATE USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Users can delete configs for their own loans
CREATE POLICY "Users can delete their own reminder configs" ON reminder_configs
  FOR DELETE USING (
    loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid())
  );

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for reminders table (if not exists)
DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for reminder_configs table (if not exists)
DROP TRIGGER IF EXISTS update_reminder_configs_updated_at ON reminder_configs;
CREATE TRIGGER update_reminder_configs_updated_at
  BEFORE UPDATE ON reminder_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
