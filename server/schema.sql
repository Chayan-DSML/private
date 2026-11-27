CREATE TABLE IF NOT EXISTS waitlist_signups (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  referral_code VARCHAR(12) NULL,
  referred_by_code VARCHAR(12) NULL,
  reward_credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY waitlist_email (email),
  UNIQUE KEY waitlist_referral_code (referral_code)
);

CREATE TABLE IF NOT EXISTS waitlist_referrals (
  id CHAR(36) NOT NULL PRIMARY KEY,
  referrer_email VARCHAR(320) NOT NULL,
  referral_code VARCHAR(12) NOT NULL,
  referred_email VARCHAR(320) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY referred_email (referred_email),
  KEY referral_code (referral_code)
);

CREATE TABLE IF NOT EXISTS seed_pledges (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  amount_inr INT NOT NULL,
  subscription_months INT NOT NULL,
  note VARCHAR(500) NULL,
  razorpay_order_id VARCHAR(64) NULL,
  razorpay_payment_id VARCHAR(64) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS job_applications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  role_id VARCHAR(80) NOT NULL,
  role_title VARCHAR(200) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(40) NULL,
  linkedin_url VARCHAR(500) NULL,
  experience VARCHAR(80) NOT NULL,
  github_url VARCHAR(500) NULL,
  why_join TEXT NOT NULL,
  resume_filename VARCHAR(255) NOT NULL,
  resume_stored_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS partner_applications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  experience VARCHAR(80) NOT NULL,
  location VARCHAR(200) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS feature_ideas (
  id CHAR(36) NOT NULL PRIMARY KEY,
  body TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS ceo_office_messages (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NULL,
  email VARCHAR(320) NOT NULL,
  topic VARCHAR(80) NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  notified_at TIMESTAMP(3) NULL
);

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  name VARCHAR(200) NULL,
  phone VARCHAR(40) NULL,
  details TEXT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY admin_email (email)
);
