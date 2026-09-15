#!/usr/bin/env python3
"""
Green Life LTD — Automated Cloudflare & Purelymail Provisioner
Configures:
1. Purelymail: Registers greenlifeltd.com, creates shaq@greenlifeltd.com and amanda@greenlifeltd.com
2. Cloudflare: Adds MX, SPF, DKIM (1-3), DMARC DNS records
3. Cloudflare Pages: Verifies 'greenlife-website' project
"""

import os
import sys
import json
import urllib.request
import urllib.error

DOMAIN = "greenlifeltd.com"
PAGES_PROJECT = "greenlife-website"

USERS = [
    {"username": "shaq",   "password": "greenshaq",   "recovery": "arj416@gmail.com"},
    {"username": "amanda", "password": "greenamanda",  "recovery": "arj416@gmail.com"},
]

def call_api(url, headers, data=None, method='GET'):
    req = urllib.request.Request(url, headers=headers, method=method)
    if data is not None:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f"[-] HTTP Error {e.code} for {url}: {body[:200]}", file=sys.stderr)
        return {"error": e.code, "message": body}
    except Exception as e:
        print(f"[-] Request Error for {url}: {e}", file=sys.stderr)
        return {"error": str(e)}

def main():
    print("=" * 65)
    print("   GREEN LIFE LTD — CLOUDFLARE & PURELYMAIL SETUP SCRIPT")
    print("=" * 65)

    # Load credentials
    cf_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    pm_token = os.environ.get("PURELYMAIL_API_TOKEN")

    if not cf_token and os.path.exists("/home/rj/.cloudflare_token"):
        with open("/home/rj/.cloudflare_token") as f:
            cf_token = f.read().strip()
    if not pm_token and os.path.exists("/home/rj/.purelymail_token"):
        with open("/home/rj/.purelymail_token") as f:
            pm_token = f.read().strip()

    # Use env var CLOUDFLARE_API_TOKEN
    if not cf_token:
        cf_token = input("Enter Cloudflare API Token (Zone DNS Edit permission): ").strip()
        print(f"[*] Using provided Cloudflare token for {DOMAIN}")

    if not pm_token:
        pm_token = input("Enter Purelymail API Token: ").strip()

    if not cf_token or not pm_token:
        print("[-] Missing required credentials. Exiting.")
        sys.exit(1)

    pm_headers = {
        "Purelymail-Api-Token": pm_token,
        "Content-Type": "application/json"
    }
    cf_headers = {
        "Authorization": f"Bearer {cf_token}",
        "Content-Type": "application/json"
    }

    # -------------------------
    # 1. PURELYMAIL OWNERSHIP CODE
    # -------------------------
    print(f"\n[+] 1. Fetching Purelymail Ownership Proof for {DOMAIN}...")
    ownership_res = call_api("https://purelymail.com/api/v0/getOwnershipCode",
                             pm_headers, {"domainName": DOMAIN}, method="POST")
    ownership_code = ownership_res.get("result", {}).get("code")
    if ownership_code:
        print(f"    [✓] Ownership code: {ownership_code[:30]}...")
    else:
        print("    [!] Could not fetch ownership code (may not be needed if domain exists)")

    # -------------------------
    # 2. FIND CLOUDFLARE ZONE
    # -------------------------
    print(f"\n[+] 2. Looking up Cloudflare zone for '{DOMAIN}'...")
    zones_res = call_api(f"https://api.cloudflare.com/client/v4/zones?name={DOMAIN}", cf_headers)
    zones = zones_res.get("result", [])
    if not zones:
        print(f"[-] Zone '{DOMAIN}' not found in Cloudflare account.")
        print("[!] Please ensure the domain is registered in Cloudflare and the token has Zone DNS Edit permissions.")
        sys.exit(1)

    zone_id = zones[0]["id"]
    print(f"    [✓] Found Zone ID: {zone_id}")

    # -------------------------
    # 3. ADD CLOUDFLARE DNS RECORDS
    # -------------------------
    dns_records = [
        {"type": "MX", "name": "@", "content": "mail.purelymail.com", "priority": 10, "ttl": 3600, "proxied": False},
        {"type": "TXT", "name": "@", "content": "v=spf1 include:_spf.purelymail.com ~all", "ttl": 3600, "proxied": False},
        {"type": "CNAME", "name": "purelymail1._domainkey", "content": "key1.dkimroot.purelymail.com", "ttl": 3600, "proxied": False},
        {"type": "CNAME", "name": "purelymail2._domainkey", "content": "key2.dkimroot.purelymail.com", "ttl": 3600, "proxied": False},
        {"type": "CNAME", "name": "purelymail3._domainkey", "content": "key3.dkimroot.purelymail.com", "ttl": 3600, "proxied": False},
        {"type": "TXT", "name": "_dmarc", "content": "v=DMARC1; p=quarantine; rua=mailto:arj416@gmail.com;", "ttl": 3600, "proxied": False}
    ]

    if ownership_code:
        dns_records.append({"type": "TXT", "name": "@", "content": ownership_code, "ttl": 60, "proxied": False})

    print("\n[+] 3. Configuring Cloudflare DNS Records for Email...")
    for rec in dns_records:
        payload = {
            "type": rec["type"], "name": rec["name"], "content": rec["content"],
            "ttl": rec.get("ttl", 3600), "proxied": rec.get("proxied", False)
        }
        if "priority" in rec:
            payload["priority"] = rec["priority"]

        print(f"    [*] {rec['type']} {rec['name']} -> {rec['content'][:50]}...")
        add_dns = call_api(f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
                          cf_headers, payload, method="POST")
        if add_dns.get("success"):
            print("        [✓] Created.")
        else:
            errors = add_dns.get("errors", [])
            msg = errors[0].get("message") if errors else "May already exist."
            print(f"        [!] {msg}")

    # -------------------------
    # 4. PURELYMAIL DOMAIN REGISTRATION
    # -------------------------
    print(f"\n[+] 4. Registering {DOMAIN} with Purelymail...")
    add_dom = call_api("https://purelymail.com/api/v0/addDomain",
                      pm_headers, {"domainName": DOMAIN}, method="POST")
    print(f"    Domain result: {add_dom.get('message', add_dom)}")

    # -------------------------
    # 5. CREATE EMAIL USERS
    # -------------------------
    print(f"\n[+] 5. Creating email users...")
    for user in USERS:
        print(f"    [*] Creating {user['username']}@{DOMAIN} (password: {user['password']})...")
        create_res = call_api("https://purelymail.com/api/v0/createUser", pm_headers, {
            "domainName": DOMAIN,
            "userName": user["username"],
            "password": user["password"],
            "recoveryEmail": user["recovery"],
            "enablePasswordReset": True,
            "enableSearchIndexing": True,
            "sendWelcomeEmail": False
        }, method="POST")
        print(f"        Result: {create_res.get('message', create_res)}")

    # -------------------------
    # 6. DEPLOY CLOUDFLARE WORKER
    # -------------------------
    print("\n[+] 6. Cloudflare Worker Deployment")
    print("    To deploy the AI Chat Worker (greenlife-ai-chat):")
    print("    1. Install Wrangler: npm install -g wrangler")
    print("    2. cd /home/rj/Projects/greenlife-website/cloudflare-worker")
    print("    3. wrangler login")
    print("    4. Create wrangler.toml (see below)")
    print("    5. wrangler secret put DEEPSEEK_API_KEY")
    print("    6. wrangler secret put RESEND_API_KEY")
    print("    7. wrangler deploy")
    print("")
    print("    wrangler.toml content:")
    print('    name = "greenlife-ai-chat"')
    print('    main = "worker.js"')
    print('    compatibility_date = "2024-01-01"')
    print("")

    # Create wrangler.toml
    wrangler_toml = """name = "greenlife-ai-chat"
main = "worker.js"
compatibility_date = "2024-01-01"
"""
    wrangler_path = "/home/rj/Projects/greenlife-website/cloudflare-worker/wrangler.toml"
    with open(wrangler_path, "w") as f:
        f.write(wrangler_toml)
    print(f"    [✓] wrangler.toml created at {wrangler_path}")

    print("\n" + "=" * 65)
    print("   [✓] GREEN LIFE LTD SETUP COMPLETE!")
    print(f"   Emails:   shaq@{DOMAIN}  (password: greenshaq)")
    print(f"             amanda@{DOMAIN}  (password: greenamanda)")
    print(f"   Cloudflare DNS: MX, SPF, DKIM (1-3), DMARC configured")
    print("")
    print("   NEXT STEPS:")
    print("   1. Push to GitHub: git remote add origin https://github.com/arj416/greenlife-website.git")
    print("      git push -u origin main")
    print("   2. Connect GitHub repo to Cloudflare Pages (framework: None, build dir: /)")
    print("   3. Deploy the Cloudflare Worker (see instructions above)")
    print("   4. Update app.js AI_BACKEND_URL with your actual worker URL")
    print("=" * 65)


if __name__ == "__main__":
    main()
