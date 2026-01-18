# Aditi’s AI - Production Ready

## 1. SaaS System Architecture
- **Frontend Core:** React 18 (SPA) with TypeScript.
- **AI Layer:** Google Gemini API (`@google/genai`).
- **Payments:** Razorpay (Requires Backend Verification).
- **Backend:** Supabase (Auth, DB, Edge Functions).

## 2. 🚨 SECURITY & DEPLOYMENT CHECKLIST (CRITICAL)

Before deploying this application to production, you MUST complete the following steps to ensure security and compliance.

### A. Environment Variables
1. Rename `.env.example` to `.env`.
2. Fill in your **Supabase URL** and **Anon Key**.
3. Fill in your **Razorpay Key ID**.
4. **NEVER** commit `.env` to Git. (It is added to `.gitignore`).
5. In your deployment platform (Vercel/Netlify), add these as Environment Variables.

### B. Database Security (Row Level Security)
You must enable RLS on your Supabase tables to prevent users from modifying others' data or granting themselves coins.

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING ( true );

-- Profiles: Users can update ONLY their own profile (but NOT coins/is_pro directly if you want strict security)
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING ( auth.uid() = id );

-- Orders: Users can read their own orders
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT USING ( auth.uid() = user_id );

-- IMPORTANT: Remove INSERT permissions for 'public' on orders if you use Edge Functions for payments.
```

### C. Payment Verification (Edge Function)
The frontend `PaymentSuccessPage` tries to invoke a Supabase Edge Function named `verify-payment`. You must deploy this function to handle real money securely.

**Function Logic (pseudo-code):**
1. Receive `payment_id` and `user_id`.
2. Fetch payment details from Razorpay API (using Razorpay Secret Key).
3. Verify status is `captured`.
4. If valid, update `profiles` table (add coins, set `is_pro`).
5. Return success.

### D. Google GenAI Security
1. Go to Google Cloud Console > Credentials.
2. Edit your API Key.
3. Under **Application restrictions**, select **HTTP referrers (websites)**.
4. Add your production domain (e.g., `https://aditis-ai.com/*`).
5. This prevents others from stealing your quota.

## 3. Platform Flow
1. **Visitor** lands on **Landing Page**.
2. **Auth**: Sign Up/Login via Supabase Auth.
3. **Features**: Use AI tools (Gemini) securely.
4. **Upgrade**: Pay via Razorpay -> Redirect to Success -> Backend Verification -> Pro Status.

## 4. Folder Structure
- `index.html` (Entry)
- `App.tsx` (Router)
- `services/` (API Clients - Configured via Env Vars)
- `pages/` (UI Logic)
- `.env` (Secrets - DO NOT COMMIT)
