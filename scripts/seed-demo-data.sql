-- Peak Client Dashboard - Demo Data Seed Script
-- This script creates a demo admin user with sample data for testing
-- 
-- IMPORTANT: This script was executed on 2026-01-10.
-- The actual IDs created are documented below.

-- ============================================
-- CREATED DEMO DATA REFERENCE
-- ============================================
-- Practice ID:   4a35b6e3-4569-45fb-a71e-bc96e3dc92e7
-- Auth User ID:  13d99734-da18-4396-971e-0422869ecfee
-- User ID:       595370fe-5cda-41a5-8587-2e4c56113174
--
-- Demo Credentials:
--   Email:    admin@peakdental.demo
--   Password: DemoAdmin123!
--   Role:     admin

-- ============================================
-- STEP 1: Create Demo Practice
-- ============================================

INSERT INTO practices (
  name,
  salesforce_id,
  email,
  phone,
  billing_address,
  shipping_address,
  status
) VALUES (
  'Peak Demo Dental Practice',
  'DEMO-SF-001',
  'demo@peakdental.com',
  '(555) 123-4567',
  '123 Demo Street, San Francisco, CA 94102',
  '123 Demo Street, San Francisco, CA 94102',
  'active'
)
ON CONFLICT (salesforce_id) DO UPDATE SET name = EXCLUDED.name
RETURNING id, name, email;

-- ============================================
-- STEP 2: Create Auth User
-- ============================================

-- Creates a user in auth.users with pre-confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@peakdental.demo',
  crypt('DemoAdmin123!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Demo", "last_name": "Administrator"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id, email;

-- ============================================
-- STEP 3: Link Auth User to Practice
-- ============================================

-- Replace placeholders with actual IDs from steps 1 and 2
INSERT INTO users (
  auth_user_id,
  email,
  first_name,
  last_name,
  name,
  practice_id,
  role,
  phone
) VALUES (
  '<AUTH_USER_ID>',  -- from step 2
  'admin@peakdental.demo',
  'Demo',
  'Administrator',
  'Demo Administrator',
  '<PRACTICE_ID>',   -- from step 1
  'admin',
  '(555) 123-4567'
)
RETURNING id, email, role, practice_id;

-- ============================================
-- STEP 4: Seed Demo Cases
-- ============================================

INSERT INTO cases (
  case_number,
  patient_name,
  case_type,
  material,
  shade,
  status,
  practice_id,
  created_at,
  due_date,
  is_priority,
  teeth_numbers
) VALUES 
  ('C-2024-001', 'John Doe', 'Crown', 'Zirconia', 'A2', 'In Production', '<PRACTICE_ID>', NOW(), NOW() + INTERVAL '5 days', false, '8,9'),
  ('C-2024-002', 'Jane Smith', 'Bridge', 'PFM', 'B1', 'Quality Check', '<PRACTICE_ID>', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', true, '14,15,16'),
  ('C-2024-003', 'Bob Johnson', 'Implant Crown', 'Zirconia', 'A3', 'Shipped', '<PRACTICE_ID>', NOW() - INTERVAL '5 days', NOW(), false, '19')
RETURNING id, case_number, patient_name, status;

-- ============================================
-- STEP 5: Seed Demo Invoices
-- ============================================

INSERT INTO invoices (
  invoice_number,
  practice_id,
  amount,
  status,
  due_date,
  description
) VALUES
  ('INV-2024-001', '<PRACTICE_ID>', 1250.00, 'Pending', NOW() + INTERVAL '30 days', 'Zirconia Crown - Case C-2024-001'),
  ('INV-2024-002', '<PRACTICE_ID>', 2800.00, 'Paid', NOW() - INTERVAL '5 days', 'PFM Bridge - Case C-2024-002'),
  ('INV-2024-003', '<PRACTICE_ID>', 1500.00, 'Overdue', NOW() - INTERVAL '5 days', 'Implant Crown - Case C-2024-003')
RETURNING id, invoice_number, amount, status;

-- ============================================
-- STEP 6: Seed Demo Notifications
-- ============================================

INSERT INTO notifications (
  practice_id,
  title,
  message,
  type,
  is_read
) VALUES
  ('<PRACTICE_ID>', 'Case Status Update', 'Case C-2024-002 has moved to Quality Check', 'case_status', false),
  ('<PRACTICE_ID>', 'Invoice Issued', 'New invoice INV-2024-001 has been issued', 'invoice_issued', false),
  ('<PRACTICE_ID>', 'Shipment Delivered', 'Case C-2024-003 has been delivered', 'shipment_delivered', true)
RETURNING id, title, type, is_read;

-- ============================================
-- CLEANUP SCRIPT (Run to remove demo data)
-- ============================================

-- To remove all demo data, run these queries in order:
--
-- Get the demo practice ID first:
-- SELECT id FROM practices WHERE email = 'demo@peakdental.com';
--
-- Then delete in reverse order (respecting foreign keys):
-- DELETE FROM notifications WHERE practice_id = '4a35b6e3-4569-45fb-a71e-bc96e3dc92e7';
-- DELETE FROM invoices WHERE practice_id = '4a35b6e3-4569-45fb-a71e-bc96e3dc92e7';
-- DELETE FROM cases WHERE practice_id = '4a35b6e3-4569-45fb-a71e-bc96e3dc92e7';
-- DELETE FROM users WHERE email = 'admin@peakdental.demo';
-- DELETE FROM practices WHERE email = 'demo@peakdental.com';
-- DELETE FROM auth.users WHERE email = 'admin@peakdental.demo';
