# MAILGUN SANDBOX SETUP - MINIMUM VIABLE PLAN

**Goal**: Get email confirmations working with the absolute minimum setup. No DNS, no custom domains, just functional emails.

## Part A: Mailgun Sandbox Setup (15 minutes)

### Step 1: Create Mailgun Account
1. Go to [mailgun.com](https://mailgun.com)
2. Sign up with your email
3. Verify your email when they send you a confirmation

### Step 2: Use Sandbox Domain (NO DNS REQUIRED)
1. In Mailgun dashboard, go to **Sending** → **Domains**
2. You'll see a sandbox domain like `sandbox-xyz123.mailgun.org`
3. **Use this - don't create a custom domain**
4. Click on the sandbox domain to see its details

### Step 3: Add Your Email as Authorized Recipient
1. In the sandbox domain settings, find **Authorized Recipients**
2. Click **Add Recipient**
3. Add `rchambers1237@gmail.com`
4. **This is required for sandbox - only authorized emails can receive messages**

### Step 4: Get SMTP Credentials
1. In Mailgun dashboard, go to **Sending** → **Domain settings** 
2. Click on your sandbox domain
3. Go to **SMTP credentials** tab
4. Note down:
   - **SMTP hostname**: `smtp.mailgun.org`
   - **Port**: `587` 
   - **Username**: `postmaster@sandbox-xyz123.mailgun.org` (your actual sandbox domain)
   - **Password**: (click "Reset password" to generate one, copy it)

## Part B: Configure Supabase SMTP (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **SMTP Settings**

### Step 2: Enter Mailgun Credentials
- **Enable SMTP**: Toggle ON
- **SMTP Host**: `smtp.mailgun.org`
- **SMTP Port**: `587`
- **SMTP User**: `postmaster@sandbox-xyz123.mailgun.org` (use your actual sandbox domain)
- **SMTP Pass**: (the password you generated in Mailgun)
- **SMTP Sender Name**: `FitfulAI`
- **SMTP Sender Email**: `no-reply@sandbox-xyz123.mailgun.org` (use your actual sandbox domain)

### Step 3: Save Settings
- Click **Save**
- You should see "Settings saved successfully"

## Part C: Test the Setup (5 minutes)

### Step 1: Test Email Template
1. In Supabase dashboard, go to **Authentication** → **Templates**
2. Select **Confirm signup** template
3. Click **Send test email**
4. Enter `rchambers1237@gmail.com`
5. Click **Send**

### Step 2: Check Email Delivery
1. Check your Gmail inbox (and spam folder)
2. You should receive a test confirmation email
3. **If no email**: Check Mailgun dashboard → **Logs** for error messages

### Step 3: Test Full Signup Flow
1. Run your app: `npm run dev`
2. Try signing up with `rchambers1237@gmail.com` (or `rchambers1237+test1@gmail.com` for multiple tests)
3. Check email, click confirmation link
4. Should redirect back to your app and create profile

## Part D: If Something Goes Wrong

### Email Not Received
1. **Check Mailgun Logs**: Go to Mailgun dashboard → **Logs** → look for your email
2. **Check Authorized Recipients**: Make sure your email is added to the sandbox authorized list
3. **Check Spam Folder**: Gmail often puts auth emails in spam initially
4. **Check Supabase Logs**: Go to Supabase → **Logs** → **Auth** for error messages

### Common Issues & Fixes
- **"Email not authorized"**: Add your email to Mailgun authorized recipients
- **"Authentication failed"**: Double-check SMTP username/password in Supabase
- **"Connection refused"**: Make sure SMTP host is `smtp.mailgun.org` and port is `587`

## Part E: Once Working - What You Have

### Limitations of Sandbox (that's OK for now)
- Can only send to authorized email addresses
- Mailgun logo in emails
- Limited to 300 emails/day

### What Works
- ✅ Email confirmations for signup
- ✅ Password reset emails  
- ✅ Your auth flow with profile creation
- ✅ No DNS configuration needed
- ✅ No custom domain setup

### When You're Ready to Go Production
- Upgrade Mailgun plan ($35/month)
- Add custom domain with DNS records
- Remove authorized recipient restrictions
- Custom email templates

## Success Check
You'll know it's working when:
1. Signup sends confirmation email to your Gmail
2. Clicking confirmation link logs you into the app
3. Profile gets created automatically
4. You see the user profile circle in top-right

**That's it. No DNS, no custom domains, no complexity. Just functional email confirmations.**