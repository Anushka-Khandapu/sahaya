export const DEFAULT_N8N_WEBHOOK_URL =
  'https://anushkakhandapu04.app.n8n.cloud/webhook/33ec61f5-4555-4851-8fe2-f3b08769090b/chat';

export const TEST_N8N_WEBHOOK_URL =
  'https://anushkakhandapu04.app.n8n.cloud/webhook-test/33ec61f5-4555-4851-8fe2-f3b08769090b/chat';

const SESSION_KEY = 'sahaya_n8n_chat_session_id';
const WEBHOOK_STORAGE_KEY = 'sahaya_n8n_webhook_url';
const CHAT_HISTORY_KEY = 'sahaya_n8n_chat_history';

export interface SendMessageOptions {
  userMessage: string;
  location?: { lat: number | null; lng: number | null };
  userName?: string;
  isOnline: boolean;
}

export interface SendMessageResult {
  reply: string;
  source: 'n8n' | 'n8n_test' | 'offline_fallback';
  warning?: string;
}

export const n8nChatService = {
  getWebhookUrl: (): string => {
    try {
      const stored = localStorage.getItem(WEBHOOK_STORAGE_KEY);
      return stored && stored.trim() ? stored.trim() : DEFAULT_N8N_WEBHOOK_URL;
    } catch {
      return DEFAULT_N8N_WEBHOOK_URL;
    }
  },

  setWebhookUrl: (url: string) => {
    try {
      localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
    } catch {}
  },

  getSessionId: (): string => {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = 'sahaya_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return 'sahaya_guest_' + Date.now();
    }
  },

  resetSession: () => {
    try {
      const id = 'sahaya_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(SESSION_KEY, id);
      return id;
    } catch {
      return 'sahaya_' + Date.now();
    }
  },

  sendMessage: async (options: SendMessageOptions): Promise<SendMessageResult> => {
    const { userMessage, location, userName, isOnline } = options;
    const sessionId = n8nChatService.getSessionId();
    const primaryUrl = n8nChatService.getWebhookUrl();

    // If completely offline, use local safety knowledge base
    if (!isOnline) {
      return {
        reply: n8nChatService.getLocalFallbackResponse(userMessage),
        source: 'offline_fallback',
        warning: 'Device is offline. Showing cached SAHAYA emergency response.',
      };
    }

    const payload = {
      chatInput: userMessage,
      message: userMessage,
      sessionId,
      metadata: {
        platform: 'SAHAYA PWA',
        user: userName || 'Citizen',
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        timestamp: new Date().toISOString(),
      },
    };

    // Helper to send request
    const tryFetch = async (targetUrl: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return res;
    };

    try {
      let response = await tryFetch(primaryUrl);

      // If primary returned 404 (common in n8n when workflow is either inactive or in test mode)
      if (response.status === 404 && primaryUrl.includes('/webhook/')) {
        const testUrl = primaryUrl.replace('/webhook/', '/webhook-test/');
        try {
          const testRes = await tryFetch(testUrl);
          if (testRes.ok) {
            response = testRes;
          }
        } catch {
          // Keep original response for error reporting
        }
      }

      if (!response.ok) {
        let errJson: { message?: string; hint?: string } = {};
        try {
          errJson = await response.json();
        } catch {}

        const isN8nInactive =
          response.status === 404 &&
          (errJson.hint?.includes('workflow must be active') ||
            errJson.hint?.includes('Execute workflow') ||
            errJson.message?.includes('not registered'));

        const fallbackReply = n8nChatService.getLocalFallbackResponse(userMessage);

        if (isN8nInactive) {
          return {
            reply: `${fallbackReply}\n\n*(Note: Your n8n workflow toggle is currently inactive in the n8n Cloud editor. Turn on the active toggle in n8n for live custom logic.)*`,
            source: 'offline_fallback',
            warning:
              'n8n workflow is currently inactive in your editor. Using local safety engine.',
          };
        }

        return {
          reply: fallbackReply,
          source: 'offline_fallback',
          warning: `n8n server returned ${response.status}. Using local safety intelligence.`,
        };
      }

      // Parse successful response
      const data = await response.json();
      let text = '';
      if (typeof data === 'string') {
        text = data;
      } else if (data.output) {
        text = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
      } else if (data.text) {
        text = data.text;
      } else if (data.message) {
        text = data.message;
      } else if (data.response) {
        text = data.response;
      } else {
        text = JSON.stringify(data);
      }

      return {
        reply: text,
        source: 'n8n',
      };
    } catch (err: unknown) {
      console.warn('n8n webhook network error, falling back to local safety rules', err);
      const fallbackReply = n8nChatService.getLocalFallbackResponse(userMessage);
      return {
        reply: fallbackReply,
        source: 'offline_fallback',
        warning: 'Network request to n8n failed. Using local SAHAYA safety engine.',
      };
    }
  },

  // Intelligent local fallback rules when n8n is offline, deactivated, or slow
  getLocalFallbackResponse: (prompt: string): string => {
    const q = prompt.toLowerCase();

    if (
      q.includes('help') ||
      q.includes('danger') ||
      q.includes('emergency') ||
      q.includes('attack') ||
      q.includes('kill') ||
      q.includes('threat')
    ) {
      return `🚨 **EMERGENCY ASSISTANCE PROTOCOL:**
1. **Call 112 immediately** (National Emergency Response for Police, Fire, Ambulance).
2. **Press the red SOS button** on your SAHAYA dashboard to trigger siren & notify contacts.
3. Move toward a crowded, well-lit public space (pharmacy, supermarket, transit hub).
4. If trapped inside a room, lock the door, barricade it, and silence your ringtone.`;
    }

    if (q.includes('follow') || q.includes('stalk') || q.includes('walking')) {
      return `🚶 **IF YOU ARE BEING FOLLOWED:**
1. **Cross the street** intentionally. If the person mirrors your movement, they are tracking you.
2. **Do NOT go home** or head down deserted alleys.
3. Enter the nearest staffed building: shop, restaurant, or bank ATM with a security guard.
4. Pretend to be on a loud phone call: *"I am standing right outside [Store Name], meet me outside now."*
5. Call **112** or **181** (Women Helpline) if they persist.`;
    }

    if (
      q.includes('cyber') ||
      q.includes('fraud') ||
      q.includes('scam') ||
      q.includes('money') ||
      q.includes('1930') ||
      q.includes('bank')
    ) {
      return `💰 **ONLINE FINANCIAL FRAUD & SCAMS:**
1. **Call 1930 immediately.** This is the National Cyber Financial Fraud Helpline.
2. Reporting within the **Golden Hour (first 60 minutes)** enables authorities to freeze stolen funds before scammers withdraw them.
3. Block your ATM cards and UPI handles via your bank app.
4. Lodge the official complaint at **cybercrime.gov.in**.`;
    }

    if (q.includes('cab') || q.includes('taxi') || q.includes('uber') || q.includes('ola') || q.includes('driver')) {
      return `🚕 **CAB / RIDE-SHARE SAFETY:**
1. Check the child lock on the rear doors to ensure you can open doors from the inside.
2. Firmly ask the driver: *"Why are you deviating from the GPS map?"*
3. Tap **Safe Journey** in SAHAYA and share live transit status with your guardian.
4. Make a call aloud stating the cab registration number and your current landmark.
5. If you feel unsafe, demand to be let out at the next traffic light or crowded area.`;
    }

    if (q.includes('sextortion') || q.includes('blackmail') || q.includes('video call') || q.includes('nude')) {
      return `🔐 **SEXTORTION & DIGITAL BLACKMAIL:**
1. **DO NOT PAY ANY MONEY.** Paying does not delete the video—it leads to endless demands.
2. **DO NOT DELETE CHATS.** Take full screenshots of their phone number, profile, and UPI IDs.
3. **Block them immediately** and set all your social media accounts to private.
4. File a confidential complaint on **cybercrime.gov.in** or call **1930**.`;
    }

    if (q.includes('number') || q.includes('helpline') || q.includes('contact')) {
      return `📞 **OFFICIAL EMERGENCY NUMBERS (INDIA):**
- **112:** All-in-one Emergency Response (Police, Fire, Medical)
- **181:** Women Helpline (Domestic distress, stalking, crisis)
- **1090:** Women Power Line (Confidential cyber harassment)
- **1930:** Cyber Financial Fraud Reporting
- **108:** Medical Trauma & Ambulance
- **1098:** Childline India
- **14567:** Senior Citizens Helpline`;
    }

    return `Hello! I am **SAHAYA Safety AI Assistant** (connected via n8n webhook).
I can assist you with:
- Emergency guidance & what to do if in danger
- Stalking & transit safety precautions
- Reporting cyber financial fraud (1930) & online blackmail
- Official emergency numbers (112, 181, 108)
- Safe journey planning & incident documentation.

How can I help you right now?`;
  },
};
