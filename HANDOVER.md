# Green Life LTD (`greenlifeltd.com`) — Project Handover Briefing

> **Purpose:**  
> This file is a comprehensive handover briefing for Green Life LTD website development, configuration, and deployment.  
> It contains the live status, architecture specifications, file manifest, credentials checklist, and operational commands.

---

## 1. Project Overview & Current State

* **Business Name:** Green Life LTD
* **Primary Contact / Owner:** **Shaq**
* **Direct Telephone:** **(647) 966-1894**
* **Business Emails:**
  * **`shaq@greenlifeltd.com`** (password: `greenshaq`)
  * **`amanda@greenlifeltd.com`** (password: `greenamanda`)
  * **Webmail Portal:** https://purelymail.com/login
* **Live Website URLs:**
  * Primary: **https://greenlifeltd.com**
  * Subdomain: **https://www.greenlifeltd.com**
  * Direct Worker / Pages Edge URL: **https://greenlife-website.arj416.workers.dev**
* **GitHub Repository:**
  * **https://github.com/arj416/greenlife-website** (Branch: `main`)
* **AI Chatbot Backend:**
  * Live Cloudflare Worker: **https://greenlife-ai-chat.arj416.workers.dev**
  * Model: **DeepSeek Chat** (`deepseek-chat` via DeepSeek API)
* **Instagram Profile:**
  * **https://www.instagram.com/green.life_contractingltd** (`@green.life_contractingltd`)
* **Primary Service Areas:**
  * **Oakville, Burlington, and Mississauga** (Core)
  * Greater Toronto Area (Toronto, Brampton, Milton, Etobicoke, Hamilton)
* **Core Services:**
  1. 🌿 **Landscaping & Lawn Care:** Weekly/biweekly mowing, edging, garden bed design, mulch, sodding, grading, spring/fall cleanup.
  2. 🪨 **Hardscaping & Interlock:** Custom interlocking driveways, backyard patios, walkways, retaining walls, steps, coping, armor stone.
  3. 🏗️ **Concrete Work:** Stamped decorative concrete, smooth brushed finishes, exposed aggregate driveways, sidewalks, and pads.
  4. 🌳 **Tree Planting & Care:** Shade and ornamental tree planting, shrub and hedge installation, pruning, shaping, removal.
  5. ❄️ **Snow Removal Contracts:** 24/7 winter snow and ice management for residential and commercial properties (seasonal flat-rate).
  6. 📋 **Year-Round Contracts:** Single combined contract covering summer landscaping (Apr–Oct) and winter snow removal (Nov–Apr).

---

## 2. Current Implementation Status: **100% Code Complete & Live**

| Component | Status | Details |
| :--- | :--- | :--- |
| **Website Pages** | ✅ Live | `index.html`, `services.html`, `portfolio.html`, `contact.html` |
| **Styling & Design System** | ✅ Complete | `style.css` (Green nature palette: `#0F2218`, `#1A5C2A`, `#5CB85C`) |
| **Client Application Logic** | ✅ Live | `app.js` (AI chat widget, before/after slider, lead submission) |
| **AI Images & Branding** | ✅ Generated | `logo.png` + 8 high-res photorealistic project photos in `images/` |
| **Before/After Interactive Slider** | ✅ Active | Lawn Before (`lawn-before.jpg`) vs Lawn After (`lawn-after.jpg`) |
| **Instagram Reel Feed** | ✅ Integrated | Direct links & preview cards linked to `@green.life_contractingltd` |
| **Mobile Sticky Action Dock** | ✅ Active | 5 quick actions: Call, SMS, Email, WhatsApp, Instagram |
| **Cloudflare Worker (AI Chat)** | ✅ Deployed | `greenlife-ai-chat.arj416.workers.dev` connected to DeepSeek API |
| **DeepSeek Secret** | ✅ Configured | `DEEPSEEK_API_KEY` uploaded as encrypted Cloudflare Worker secret |
| **PurelyMail Setup** | ✅ Configured | `greenlifeltd.com` registered, `shaq` & `amanda` mailboxes created |
| **Cloudflare DNS Records** | ✅ Active | MX (`mail.purelymail.com`), SPF, 3x DKIM CNAMEs, DMARC TXT |
| **Custom Domain Edge SSL** | ✅ Active | `greenlifeltd.com` and `www.greenlifeltd.com` serve with HTTP/2 SSL |
| **GitHub Repository** | ✅ Pushed | Clean git history at `https://github.com/arj416/greenlife-website.git` |
| **Asset Security Protection** | ✅ Active | `entry.js` blocks public web access to `.git`, `.env`, `scripts/`, etc. |

---

## 3. File & Directory Manifest

```
/home/rj/Projects/greenlife-website/
├── index.html                   # Homepage (Hero, Services, Before/After Slider, Instagram Reel, Contracts, Quote Form)
├── services.html                # Detailed breakdown of all 5 service pillars
├── portfolio.html               # Project gallery and Instagram showcase
├── contact.html                 # Direct contact info panel + full free quote request form
├── style.css                    # Complete CSS custom property design system (nature green theme)
├── app.js                       # Frontend logic (mobile menu, slider, AI chat widget, form submission)
├── entry.js                     # Edge worker router protecting sensitive files (.git, scripts)
├── logo.png                     # Official Green Life LTD brand logo (maple leaf monogram)
├── wrangler.jsonc               # Configuration for website deployment via Cloudflare Workers/Pages
├── .gitignore                   # Ignores .wrangler/, node_modules/, *.env
├── images/                      # High-resolution photorealistic imagery:
│   ├── hero-landscaping.jpg     # Oakville estate manicured lawn and interlock path
│   ├── hardscaping-driveway.jpg # Herringbone interlock paver driveway in Mississauga
│   ├── concrete-work.jpg        # Stamped concrete driveway in Burlington
│   ├── tree-planting.jpg        # Crew planting mature trees
│   ├── snow-removal.jpg         # Commercial snow plow truck clearing snow at night
│   ├── lawn-before.jpg          # Neglected overgrown lawn (for slider)
│   ├── lawn-after.jpg           # Manicured Green Life lawn transformation (for slider)
│   └── year-round-contracts.jpg # Split summer landscaping & winter snow removal
├── cloudflare-worker/           # DeepSeek AI Chatbot Worker:
│   ├── worker.js                # Cloudflare Worker script (CORS, Shaq persona, DeepSeek API, lead extraction)
│   └── wrangler.toml            # Deployment configuration for greenlife-ai-chat worker
└── scripts/
    └── setup_domain.py          # Python automation script for PurelyMail + Cloudflare DNS provisioning
```

---

## 4. Credentials & Access Summary

| Service | Identifier / Login | Credential / Location | Notes |
| :--- | :--- | :--- | :--- |
| **Cloudflare API** | Account `7581cf45bd9528f367ba2b89db29b008` | `~/.cloudflare_token` (or env `CLOUDFLARE_API_TOKEN`) | Zone ID: `5a12d67de010a2daa46add90a679cc35` |
| **PurelyMail API** | `greenlifeltd.com` | `~/.purelymail_token` | API Token for mailbox management |
| **Email: Shaq** | `shaq@greenlifeltd.com` | `greenshaq` | Primary business mailbox |
| **Email: Amanda** | `amanda@greenlifeltd.com` | `greenamanda` | Office / secondary mailbox |
| **DeepSeek API** | AI Model for Chatbot | Encrypted in Worker secrets | Configured in `greenlife-ai-chat` |
| **GitHub** | `arj416` | Stored git credentials | Repo: `arj416/greenlife-website` |

---

## 5. What Was Left / Next Steps for the User

### What has just been finished in this session:
1. **Security hardening:** Configured `entry.js` so `.git`, `.env`, and `scripts/` are strictly blocked from public web access.
2. **Domain routing:** Linked `greenlifeltd.com` and `www.greenlifeltd.com` directly to Cloudflare edge with automatic SSL.
3. **End-to-end verification:** Verified 200 OK responses on homepage, clean URL redirects (`/services`, `/portfolio`, `/contact`), images, CSS, and JS.
4. **AI Worker tested:** Live POST queries to `https://greenlife-ai-chat.arj416.workers.dev` return prompt responses in Shaq's persona.

### Optional Follow-ups for the User:
1. **Resend API Key for Email Lead Forwarding (Optional):**
   * The AI chat worker currently accepts lead submissions via `/submit-lead`.
   * To have incoming quote requests automatically forwarded to `shaq@greenlifeltd.com` via Resend email, add your `RESEND_API_KEY`:
     ```bash
     cd /home/rj/Projects/greenlife-website/cloudflare-worker
     CLOUDFLARE_API_TOKEN="your_cf_token" wrangler secret put RESEND_API_KEY
     ```
2. **Cloudflare Pages Git Integration (Optional CI/CD):**
   * The site is already live directly via Cloudflare Workers/Pages static assets.
   * If you also want every `git push` to GitHub to automatically trigger a build:
     * Open **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **Pages** &rarr; **Connect to Git**
     * Select `arj416/greenlife-website`
     * Build command: *(leave blank)*, Build directory: `/`
3. **Email Webmail Verification:**
   * Log into https://purelymail.com/login using `shaq@greenlifeltd.com` / `greenshaq` to confirm webmail inbox access.
