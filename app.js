/**
 * Green Life LTD — Main Application Logic & AI Chat
 * Shaq: (647) 966-1894 | shaq@greenlifeltd.com
 */

const AI_BACKEND_URL = "https://greenlife-ai-chat.arj416.workers.dev";
let chatHistory = [];
let isChatOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    // ========================
    // 1. Mobile Menu Navigation
    // ========================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => mobileNav.classList.remove('open'));
        });
    }

    // ========================
    // 2. Before & After Slider
    // ========================
    const compSlider = document.getElementById('beforeAfterSlider');
    const compOverlay = document.getElementById('comparisonOverlay');
    const sliderHandle = document.getElementById('sliderHandle');

    if (compSlider && compOverlay && sliderHandle) {
        const updateSlider = (val) => {
            compOverlay.style.width = `${val}%`;
            sliderHandle.style.left = `${val}%`;
        };
        compSlider.addEventListener('input', (e) => updateSlider(e.target.value));
        // Touch support
        const wrapper = compSlider.closest('.comparison-wrapper');
        if (wrapper) {
            wrapper.addEventListener('touchmove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
                compSlider.value = pct;
                updateSlider(pct);
            }, { passive: true });
        }
    }

    // ========================
    // 3. Instagram Reel Cards — link to profile
    // ========================
    const reelCards = document.querySelectorAll('.reel-card');
    reelCards.forEach(card => {
        card.addEventListener('click', () => {
            window.open('https://www.instagram.com/green.life_contractingltd', '_blank', 'noopener,noreferrer');
        });
    });

    // ========================
    // 4. AI Chat Widget
    // ========================
    const avatarWrapper = document.getElementById('avatar-wrapper');
    const chatBubble = document.getElementById('chat-bubble');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatText = document.getElementById('chat-text');

    const toggleChat = (forceState) => {
        if (!chatBubble) return;
        isChatOpen = forceState !== undefined ? forceState : !isChatOpen;
        if (isChatOpen) {
            chatBubble.classList.add('active');
            if (chatInput) chatInput.focus();
        } else {
            chatBubble.classList.remove('active');
        }
    };

    if (avatarWrapper) {
        avatarWrapper.addEventListener('click', () => toggleChat());
        avatarWrapper.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleChat(); });
    }
    if (chatClose) {
        chatClose.addEventListener('click', (e) => { e.stopPropagation(); toggleChat(false); });
    }

    // Auto-open greeting after 5 seconds
    setTimeout(() => {
        if (!isChatOpen && chatBubble) toggleChat(true);
    }, 5000);

    const handleChatSubmit = async () => {
        if (!chatInput) return;
        const query = chatInput.value.trim();
        if (!query) return;

        chatInput.value = '';
        chatInput.disabled = true;
        if (chatSend) chatSend.disabled = true;

        const userMsgHtml = `<div style="margin-bottom: 0.5rem; text-align: right;"><span style="background: var(--primary-forest); color: #fff; padding: 0.35rem 0.75rem; border-radius: 12px; display: inline-block; font-size: 0.85rem;">${escapeHtml(query)}</span></div>`;
        const thinkingHtml = `<div id="chat-thinking" style="color: var(--text-muted); font-style: italic; font-size: 0.85rem; margin-bottom: 0.5rem;">Shaq is typing...</div>`;

        chatText.innerHTML += userMsgHtml + thinkingHtml;
        chatText.scrollTop = chatText.scrollHeight;

        try {
            const response = await fetch(AI_BACKEND_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: query, history: chatHistory })
            });

            const data = await response.json();
            const thinkingEl = document.getElementById('chat-thinking');
            if (thinkingEl) thinkingEl.remove();

            if (data.answer) {
                chatHistory.push({ role: "user", content: query });
                chatHistory.push({ role: "assistant", content: data.answer });

                const replyHtml = `<div style="margin-bottom: 0.5rem; text-align: left;"><span style="background: var(--green-pale); color: var(--text-main); padding: 0.45rem 0.75rem; border-radius: 12px; display: inline-block; font-size: 0.85rem; border: 1px solid rgba(26,92,42,0.12);">${escapeHtml(data.answer)}</span></div>`;
                chatText.innerHTML += replyHtml;
            } else {
                throw new Error("No answer");
            }
        } catch (err) {
            console.error("AI Error:", err);
            const thinkingEl = document.getElementById('chat-thinking');
            if (thinkingEl) thinkingEl.remove();
            chatText.innerHTML += `<div style="margin-bottom: 0.5rem; color: #DC2626; font-size: 0.85rem;">Direct line: Call Shaq at <strong>(647) 966-1894</strong> or submit the quote form for a free estimate!</div>`;
        } finally {
            chatInput.disabled = false;
            if (chatSend) chatSend.disabled = false;
            chatInput.focus();
            chatText.scrollTop = chatText.scrollHeight;
        }
    };

    if (chatSend) chatSend.addEventListener('click', handleChatSubmit);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleChatSubmit(); }
        });
    }

    // ========================
    // 5. Quote Form Submissions
    // ========================
    const setupFormSubmission = (formId, isDarkTheme) => {
        const formEl = document.getElementById(formId);
        if (!formEl) return;

        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const origText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Request...';

            const formData = new FormData(formEl);
            const data = Object.fromEntries(formData.entries());

            try {
                await fetch(`${AI_BACKEND_URL}/submit-lead`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        business: "Green Life LTD",
                        contact: "Shaq (647-966-1894)",
                        toEmail: "shaq@greenlifeltd.com",
                        lead: data
                    })
                });
            } catch (err) {
                console.log("Fallback notification");
            }

            const titleColor = isDarkTheme ? "#FFFFFF" : "var(--primary-dark)";
            const textColor = isDarkTheme ? "rgba(255,255,255,0.8)" : "var(--text-muted)";

            formEl.innerHTML = `
                <div style="text-align: center; padding: 1.75rem 1rem;">
                    <div style="width: 58px; height: 58px; background: rgba(92,184,92,0.18); color: #5CB85C; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: ${titleColor};">Thank You, ${escapeHtml(data.name || 'Valued Client')}!</h3>
                    <p style="color: ${textColor}; max-width: 480px; margin: 0 auto 1.25rem; font-size: 0.95rem; line-height: 1.5;">
                        Shaq has received your request for <strong>${escapeHtml(data.service || 'Landscaping')}</strong>. We'll contact you at <strong>${escapeHtml(data.phone || '(647) 966-1894')}</strong> within 2 hours.
                    </p>
                    <a href="tel:6479661894" class="btn-primary" style="display: inline-flex; font-size: 0.95rem; padding: 0.65rem 1.25rem;">Call Shaq Direct: (647) 966-1894</a>
                </div>
            `;
        });
    };

    setupFormSubmission('quoteForm', false);
    setupFormSubmission('heroQuoteForm', true);

    // ========================
    // 6. Scroll Header Shadow
    // ========================
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,0.3)' : 'none';
        }, { passive: true });
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}
