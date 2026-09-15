export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ----- CORS preflight -----
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json"
    };

    // ========== HEALTH CHECK ==========
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Green Life LTD AI Assistant",
        contractor: "Shaq",
        phone: "(647) 966-1894",
        email: "shaq@greenlifeltd.com",
        instagram: "@green.life_contractingltd"
      }), { headers: corsHeaders });
    }

    // ========== LEAD CAPTURE ROUTE ==========
    if (url.pathname === "/submit-lead" && request.method === "POST") {
      try {
        const body = await request.json();
        const lead = body.lead || body;
        const name = lead.name || body.name || "Website Visitor";
        const email = lead.email || body.email || "";
        const phone = lead.phone || body.phone || "";
        const service = lead.service || body.service || "Landscaping / Property Care";
        const city = lead.city || lead.address || body.city || "Oakville / GTA";
        const sqft = lead.sqft || body.sqft || "Not provided";
        const message = lead.notes || lead.message || body.message || "Requested quote via website";

        if (!email && !phone) {
          return new Response(JSON.stringify({ error: "Please provide an email or phone number." }), {
            status: 400, headers: corsHeaders
          });
        }

        // Send notification via Purelymail / Resend
        if (env.RESEND_API_KEY) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "onboarding@resend.dev",
              to: ["arj416@gmail.com"],
              subject: `🌿 New Lead: ${name} — ${service} (${city})`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <div style="background: #1A5C2A; color: #ffffff; padding: 20px; border-bottom: 4px solid #5CB85C;">
                    <h1 style="margin: 0; font-size: 20px;">🌿 Green Life LTD — New Project Lead</h1>
                    <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.75); font-size: 14px;">Quote Request via greenlifeltd.com</p>
                  </div>
                  <div style="padding: 24px; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 8px 0; color: #64748b; width: 160px; font-weight: bold;">Client Name:</td><td style="padding: 8px 0; color: #0f172a; font-size: 16px;"><strong>${name}</strong></td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Phone:</td><td style="padding: 8px 0; color: #0f172a;"><a href="tel:${phone}" style="color: #1A5C2A; font-weight: bold; text-decoration: none;">${phone || 'Not provided'}</a></td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Email:</td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email || 'Not provided'}</a></td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Service Needed:</td><td style="padding: 8px 0; color: #0f172a;"><strong>${service}</strong></td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">City / Area:</td><td style="padding: 8px 0; color: #0f172a;">${city}</td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Property Size:</td><td style="padding: 8px 0; color: #0f172a;">${sqft}</td></tr>
                      <tr><td style="padding: 12px 0 4px 0; color: #64748b; font-weight: bold;" colspan="2">Project Notes:</td></tr>
                      <tr><td colspan="2" style="background: #f8fafc; padding: 12px; border-radius: 6px; color: #334155; font-size: 14px; line-height: 1.5;">${message}</td></tr>
                    </table>
                  </div>
                  <div style="background: #f0fdf4; padding: 14px 20px; font-size: 12px; color: #4D6651; text-align: center; border-top: 1px solid #d1fae5;">
                    Green Life LTD &bull; Shaq: (647) 966-1894 &bull; shaq@greenlifeltd.com &bull; Oakville, Burlington, Mississauga
                  </div>
                </div>
              `
            })
          });
        }

        return new Response(JSON.stringify({ success: true, message: "Lead received successfully" }), {
          status: 200, headers: corsHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Internal error", detail: error.message }), {
          status: 500, headers: corsHeaders
        });
      }
    }

    // ========== CHAT ROUTE (DeepSeek) ==========
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { question, history = [] } = await request.json();
      if (!question || typeof question !== "string") {
        return new Response(JSON.stringify({ error: "Missing 'question' field" }), {
          status: 400, headers: corsHeaders
        });
      }

      const trimmedHistory = history.slice(-14);

      const SYSTEM_PROMPT = `You are Shaq, the owner and founder of Green Life LTD (greenlifeltd.com), a professional landscaping and contracting company based in Oakville, Ontario, Canada.

Your primary service area: Oakville, Burlington, and Mississauga — with coverage across the greater GTA (Toronto, Brampton, Milton, Etobicoke, Hamilton).
Direct phone: (647) 966-1894
Direct email: shaq@greenlifeltd.com
Instagram: @green.life_contractingltd

YOUR SERVICES:
1. Landscaping & Lawn Care: Weekly/biweekly mowing, edging, trimming, fertilization, weed control, overseeding, garden bed design & maintenance, sod installation, grading.
2. Hardscaping & Interlock: Custom interlocking stone driveways, patios, walkways, retaining walls, steps and coping. Armor stone installations.
3. Concrete Work: Stamped decorative concrete, smooth brushed finishes, exposed aggregate driveways, sidewalks, and pads.
4. Tree Planting & Care: Shade trees, ornamental trees, shrub planting, pruning, and removal.
5. Snow Removal Contracts: 24/7 residential and commercial snow plowing, shoveling, and salt/ice control. Seasonal contracts available.
6. Year-Round Property Contracts: Single contract covering summer landscaping AND winter snow removal — simplified billing, priority service.

BEHAVIOR RULES:
- Tone: Friendly, confident, professional Canadian contractor. Down to earth, knowledgeable, trustworthy.
- Keep answers concise (under 120 words). Be helpful and direct.
- Pricing: Never quote exact prices sight-unseen. Explain pricing varies based on property size, scope, and season. Always encourage a free on-site estimate.
- Snow contracts: Always highlight 24/7 response, seasonal flat-rate pricing, and priority service for contract clients.
- Year-round contracts: Position as the best value — one contract, simplified billing, dedicated crew.
- Automatic Lead Capture: When a visitor shares their name, phone number, email, or project details, acknowledge it warmly and append at the very end of your reply:
  ---LEAD_DATA: {"name": "...", "phone": "...", "email": "...", "service": "...", "city": "...", "details": "..."}---
  Fill in any details they provided. The server will strip this marker before showing the message to the user.`;

      const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...trimmedHistory,
            { role: "user", content: question }
          ],
          temperature: 0.72,
          max_tokens: 380
        })
      });

      if (!deepseekResponse.ok) {
        const errorText = await deepseekResponse.text();
        return new Response(JSON.stringify({ error: "DeepSeek API error", detail: errorText }), {
          status: 502, headers: corsHeaders
        });
      }

      const completion = await deepseekResponse.json();
      let answer = completion.choices?.[0]?.message?.content || "Thanks for reaching out! Give me a call at (647) 966-1894 and I'll get you set up with a free quote.";

      // ---- AUTOMATIC LEAD EXTRACTION FROM LIVE CHAT ----
      const leadMatch = answer.match(/---LEAD_DATA:\s*({.*?})---/s);
      if (leadMatch) {
        try {
          const leadInfo = JSON.parse(leadMatch[1]);
          if (env.RESEND_API_KEY && (leadInfo.phone || leadInfo.email || leadInfo.name)) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: ["arj416@gmail.com"],
                subject: `💬 Chat Lead: ${leadInfo.name || "Visitor"} — ${leadInfo.service || "Property Inquiry"}`,
                html: `
                  <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d1fae5; border-radius: 8px;">
                    <h2 style="color: #1A5C2A;">🌿 Green Life LTD — New AI Chat Lead</h2>
                    <p><strong>Name:</strong> ${leadInfo.name || "Not provided"}</p>
                    <p><strong>Phone:</strong> ${leadInfo.phone || "Not provided"}</p>
                    <p><strong>Email:</strong> ${leadInfo.email || "Not provided"}</p>
                    <p><strong>Service / Interest:</strong> ${leadInfo.service || "Landscaping / Property Care"}</p>
                    <p><strong>City / Area:</strong> ${leadInfo.city || "Not provided"}</p>
                    <p><strong>Notes:</strong> ${leadInfo.details || "From live AI conversation"}</p>
                    <p><strong>Visitor's Question:</strong> ${question}</p>
                    <hr style="border-color: #d1fae5;">
                    <p style="color: #4D6651; font-size: 13px;">Green Life LTD &bull; Shaq: (647) 966-1894 &bull; shaq@greenlifeltd.com</p>
                  </div>
                `
              })
            });
          }
        } catch (e) {
          console.error("Chat lead forward error:", e);
        }
        answer = answer.replace(/---LEAD_DATA:\s*{.*?}---/s, "").trim();
      }

      return new Response(JSON.stringify({ answer }), { headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal server error", detail: err.message }), {
        status: 500, headers: corsHeaders
      });
    }
  }
};
