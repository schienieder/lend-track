# LendTrack - Database Schema Design

## Overview
This document outlines the database schema for the LendTrack application. The schema is designed to efficiently store and manage loan information, user data, payment records, and reminder settings.

## Database Technology
- **Database**: PostgreSQL (via Supabase)
- **Connection**: Secure connection with SSL
- **Backup**: Automated daily backups
- **Security**: Row-level security for multi-tenant support

## Schema Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     Users       │       │      Loans       │       │    Payments     │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)          │───┐   │ id (PK)         │
│ email           │   │   │ user_id (FK)     │   │   │ loan_id (FK)    │
│ password_hash   │   │   │ borrower_name    │   │   │ amount          │
│ first_name      │   │   │ borrower_email   │   │   │ payment_date    │
│ last_name       │   │   │ borrower_phone   │   │   │ payment_method  │
│ email_verified  │   │   │ principal_amount │   │   │ notes           │
│ created_at      │   │   │ interest_rate    │   │   │ created_at      │
│ updated_at      │   │   │ due_date         │   │   │ updated_at      │
└─────────────────┘   │   │ payment_schedule │   │   └─────────────────┘
                      │   │ status           │   │
                      │   │ notes            │   │
                      │   │ created_at       │   │
                      │   │ updated_at       │   │
                      │   └──────────────────┘   │
                      │                          │
                      └──────────────────────────┘
                                 │
                                 ▼
┌─────────────────┐       ┌──────────────────┐
│   Reminders     │       │  LoanBalances    │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ loan_id (FK)    │──────▶│ loan_id (FK)     │
│ reminder_type   │       │ remaining_amount │
│ reminder_date   │       │ calculated_at    │
│ sent_status     │       │ interest_accrued │
│ sent_at         │       │ total_paid       │
│ created_at      │       │ last_payment_date│
└─────────────────┘       └─────────────────┘
```

## Table Definitions

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Loans Table
```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrower_name VARCHAR(255) NOT NULL,
    borrower_email VARCHAR(255),
    borrower_phone VARCHAR(50),
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- Percentage (e.g., 5.5 for 5.5%)
    due_date DATE NOT NULL,
    payment_schedule VARCHAR(20) NOT NULL DEFAULT 'one-time' CHECK (payment_schedule IN ('one-time', 'monthly', 'weekly', 'custom')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_due_date ON loans(due_date);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_borrower_name ON loans(borrower_name);
CREATE INDEX idx_loans_created_at ON loans(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Reminders Table
```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('due_date', 'overdue', 'custom')),
    reminder_date DATE NOT NULL,
    sent_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (sent_status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reminders_loan_id ON reminders(loan_id);
CREATE INDEX idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_sent_status ON reminders(sent_status);
CREATE INDEX idx_reminders_created_at ON reminders(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Loan Balances View (Calculated View)
```sql
CREATE VIEW loan_balances AS
SELECT 
    l.id AS loan_id,
    l.user_id,
    l.principal_amount,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    (l.principal_amount + (l.principal_amount * l.interest_rate / 100)) - COALESCE(SUM(p.amount), 0) AS remaining_amount,
    l.interest_rate,
    (l.principal_amount * l.interest_rate / 100) AS total_interest,
    l.due_date,
    l.status
FROM loans l
LEFT JOIN payments p ON l.id = p.loan_id
GROUP BY l.id, l.user_id, l.principal_amount, l.interest_rate, l.due_date, l.status;
```

## Security Considerations

### Row-Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY user_access_policy ON users FOR ALL TO authenticated
    USING (auth.uid() = id);

CREATE POLICY loan_access_policy ON loans FOR ALL TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY payment_access_policy ON payments FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM loans WHERE loans.id = payments.loan_id AND loans.user_id = auth.uid()));

CREATE POLICY reminder_access_policy ON reminders FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM loans WHERE loans.id = reminders.loan_id AND loans.user_id = auth.uid()));
```

### Data Encryption
- Sensitive data like passwords are stored as encrypted hashes
- Connection to database uses SSL encryption
- Consider column-level encryption for highly sensitive data

## Performance Considerations

### Indexing Strategy
- Primary keys are automatically indexed
- Foreign key columns are indexed for join performance
- Frequently queried columns (due_date, status) are indexed
- Full-text search indexes for name fields if needed

### Partitioning
- Consider time-based partitioning for payments table if data volume grows
- Partition by user_id for better query performance in multi-tenant scenarios

## Data Integrity Constraints

### Check Constraints
- Payment amounts must be positive
- Interest rates must be non-negative
- Due dates must be in the future
- Status values are restricted to predefined values

### Foreign Key Constraints
- All foreign keys have appropriate CASCADE options
- Referential integrity is enforced at the database level

## Migration Strategy

### Initial Setup
1. Create the database schema
2. Set up Row-Level Security policies
3. Create indexes for performance
4. Set up triggers for audit trails

### Future Migrations
- Use a migration tool like Supabase CLI or Flyway
- Maintain backward compatibility where possible
- Test migrations on staging environment first

## Backup and Recovery

### Automated Backups
- Daily automated backups via Supabase
- Point-in-time recovery options
- Backup retention policy (30 days by default)

### Disaster Recovery
- Regular backup verification
- Cross-region backup options
- Recovery time objectives (RTO) and recovery point objectives (RPO)