# Matchpoint Custom Email Templates Setup

This guide shows you how to add custom branded email templates to your Supabase authentication flow.

## 📧 Email Templates Included

1. **Confirmation Email** - Sign up verification
2. **Magic Link Email** - Passwordless sign-in
3. **Password Reset Email** - Reset password flow
4. **Email Change Confirmation** - Confirm email address change

## 🎨 Design Features

- 🔥 Matchpoint branding with flame gradient
- 📱 Mobile-responsive design
- 🎯 Clear call-to-action buttons
- 🔒 Security notices and warnings
- ✨ Professional, modern styling

## 📝 How to Add Templates to Supabase

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication → Email Templates**

### Step 2: Add Each Template

For each template type, follow these steps:

#### **1. Confirm Signup Template**

1. Click on **"Confirm signup"** in the left sidebar
2. Open `supabase/email-templates.html`
3. Copy the **CONFIRMATION EMAIL** section (lines 1-97)
4. Paste into the Supabase editor
5. Click **Save**

#### **2. Magic Link Template**

1. Click on **"Magic Link"** in the left sidebar
2. Copy the **MAGIC LINK EMAIL** section (lines 99-192)
3. Paste into the Supabase editor
4. Click **Save**

#### **3. Change Email Address (Password Reset)**

1. Click on **"Change Email Address"** in the left sidebar
2. Copy the **PASSWORD RESET EMAIL** section (lines 194-300)
3. Paste into the Supabase editor
4. Click **Save**

#### **4. Confirm Email Change**

1. Click on **"Confirm Email Change"** in the left sidebar
2. Copy the **EMAIL CHANGE CONFIRMATION** section (lines 302-395)
3. Paste into the Supabase editor
4. Click **Save**

## 🔧 Template Variables

Supabase automatically replaces these variables:

- `{{ .ConfirmationURL }}` - The action link (verify email, reset password, etc.)
- `{{ .Token }}` - The authentication token (if needed)
- `{{ .Email }}` - The user's email address

## ✅ Testing Your Templates

### Test Confirmation Email:
```bash
# Sign up a new user
# Check your inbox for the styled confirmation email
```

### Test Password Reset:
```bash
# Click "Forgot Password" in your app
# Check your inbox for the styled reset email
```

### Test Magic Link (if enabled):
```bash
# Use passwordless sign-in
# Check your inbox for the styled magic link email
```

## 🎨 Customization Options

To customize the templates further:

### Change Colors:
- **Gradient**: `#f97316` → `#dc2626` (orange to red)
- **Background**: `#f9fafb` (light gray)
- **Text**: `#111827` (dark), `#6b7280` (medium), `#9ca3af` (light)

### Change Logo:
Replace the 🔥 emoji with:
```html
<img src="YOUR_LOGO_URL" alt="Matchpoint" style="width: 40px; height: 40px;" />
```

### Change Button Text:
Find the `<a>` tags with the CTA buttons and modify the text inside.

## 📱 Preview

The emails will look like this:

```
┌─────────────────────────────┐
│  🔥 Matchpoint              │
│  Find your next unicorn role │  ← Orange gradient header
├─────────────────────────────┤
│                             │
│  Confirm your email address │  ← Clean white content
│                             │
│  [Confirm Email Address]    │  ← Gradient button
│                             │
│  Or copy and paste...       │
│                             │
├─────────────────────────────┤
│  © 2024 Matchpoint          │  ← Gray footer
└─────────────────────────────┘
```

## 🚀 Production Checklist

- [ ] All 4 email templates uploaded to Supabase
- [ ] Test signup confirmation email
- [ ] Test password reset email  
- [ ] Test magic link email (if using passwordless)
- [ ] Test email change confirmation
- [ ] Verify emails display correctly on mobile
- [ ] Check spam folder (mark as "Not Spam" if needed)

## 📧 Email Deliverability Tips

1. **Use Custom SMTP** (recommended for production):
   - Supabase Dashboard → Project Settings → Auth
   - Configure your own SMTP (SendGrid, AWS SES, etc.)

2. **Set Up SPF/DKIM Records**:
   - Improves deliverability
   - Reduces spam filtering

3. **Test Multiple Email Clients**:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile devices

## 🆘 Troubleshooting

**Emails not sending?**
- Check Supabase email rate limits
- Verify SMTP configuration
- Check spam folder

**Template not updating?**
- Clear browser cache
- Wait 5 minutes for Supabase to propagate
- Check for HTML syntax errors

**Broken links?**
- Verify `{{ .ConfirmationURL }}` variable is present
- Check redirect URLs in Supabase settings

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [HTML Email Best Practices](https://www.emailonacid.com/blog/article/email-development/html-email-best-practices/)
- [Email Client Support](https://www.caniemail.com/)

