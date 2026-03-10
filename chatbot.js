/**
 * DealerPost AI — Ava Chatbot Widget
 * Drop-in floating chatbot for dealerpostai.com
 * Usage: <script src="chatbot.js"></script> before </body>
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var ENDPOINT = 'https://nzsabhwodjlkumzlmmxf.supabase.co/functions/v1/chat';
  var BOT_NAME = 'Ava';
  var GOLD     = '#f0c84a';
  var DARK_BG  = '#0d0d1e';
  var CARD_BG  = '#13132b';
  var BORDER   = 'rgba(240,200,74,0.18)';

  var WELCOME_MSG = "Hey there! I'm Ava 👋 I'm here to help with anything — whether it's about DealerPost AI or just a question you've got. What's on your mind?";

  // Conversation history sent to the API
  var history = [];

  // Track how many times user directly asked if Ava is human/AI
  var identityPressCount = 0;

  // ─── Inject styles ────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [

    /* ── Keyframes ─────────────────────────────────────────────────────────── */
    '@keyframes dp-bounce{0%,80%,100%{transform:translateY(0);opacity:0.4;}40%{transform:translateY(-6px);opacity:1;}}',
    '@keyframes dp-msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '@keyframes dp-pulse-ring{0%{box-shadow:0 0 0 0 rgba(240,200,74,0.4)}70%{box-shadow:0 0 0 8px rgba(240,200,74,0)}100%{box-shadow:0 0 0 0 rgba(240,200,74,0)}}',
    '@keyframes dp-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}',

    /* ── Toggle button ─────────────────────────────────────────────────────── */
    '#dp-chat-toggle{',
      'position:fixed;bottom:24px;right:24px;z-index:99999;',
      'display:flex;align-items:center;gap:10px;',
      'background:linear-gradient(135deg,#0d0d1e 0%,#111128 100%);',
      'border:1px solid rgba(240,200,74,0.35);',
      'border-radius:50px;',
      'padding:10px 18px 10px 10px;',
      'cursor:pointer;',
      'box-shadow:0 4px 24px rgba(0,0,0,0.6),0 0 0 1px rgba(240,200,74,0.08),0 8px 40px rgba(240,200,74,0.15);',
      'transition:transform 0.3s cubic-bezier(.16,1,.3,1),box-shadow 0.3s;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'user-select:none;backdrop-filter:blur(12px);',
    '}',
    '#dp-chat-toggle:hover{',
      'transform:translateY(-3px) scale(1.04);',
      'box-shadow:0 12px 48px rgba(0,0,0,0.7),0 0 32px rgba(240,200,74,0.22);',
      'border-color:rgba(240,200,74,0.6);',
    '}',
    '#dp-chat-toggle .dp-toggle-label{',
      'color:#eeeef8;',
      'font-size:13px;font-weight:500;letter-spacing:0.02em;white-space:nowrap;',
    '}',
    '#dp-chat-toggle .dp-toggle-avatar{',
      'width:36px;height:36px;border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
      'position:relative;',
      'box-shadow:0 0 0 2px rgba(240,200,74,0.5),0 0 16px rgba(240,200,74,0.2);',
    '}',

    /* ── Chat window ───────────────────────────────────────────────────────── */
    '#dp-chat-window{',
      'position:fixed;bottom:86px;right:24px;z-index:99998;',
      'width:380px;max-width:calc(100vw - 16px);',
      'height:540px;max-height:calc(100vh - 110px);',
      'background:linear-gradient(160deg,#0d0d1f 0%,#080815 100%);',
      'border:1px solid rgba(240,200,74,0.2);',
      'border-radius:24px;',
      'display:flex;flex-direction:column;',
      'box-shadow:0 24px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06),0 0 60px rgba(240,200,74,0.06);',
      'overflow:hidden;',
      'opacity:0;pointer-events:none;',
      'transform:translateY(20px) scale(0.96);',
      'transition:opacity 0.3s cubic-bezier(.16,1,.3,1),transform 0.3s cubic-bezier(.16,1,.3,1);',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'backdrop-filter:blur(24px);',
    '}',
    '#dp-chat-window.dp-open{opacity:1;pointer-events:all;transform:translateY(0) scale(1);}',

    /* ── Header ────────────────────────────────────────────────────────────── */
    '#dp-chat-header{',
      'display:flex;align-items:center;gap:13px;',
      'padding:16px 18px;',
      'background:linear-gradient(90deg,rgba(200,146,42,0.1) 0%,rgba(13,13,31,0) 100%);',
      'border-bottom:1px solid rgba(240,200,74,0.1);',
      'flex-shrink:0;',
    '}',
    '#dp-chat-header .dp-header-avatar{',
      'width:42px;height:42px;border-radius:50%;',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:18px;flex-shrink:0;position:relative;overflow:visible;',
      'box-shadow:0 0 0 2px rgba(240,200,74,0.4),0 0 20px rgba(240,200,74,0.15);',
    '}',
    '#dp-chat-header .dp-online-dot{',
      'position:absolute;bottom:1px;right:1px;',
      'width:10px;height:10px;border-radius:50%;',
      'background:#22c55e;border:2px solid #0d0d1f;',
      'animation:dp-pulse-ring 2.5s ease-out infinite;',
    '}',
    '#dp-chat-header .dp-header-info{flex:1;min-width:0;}',
    '#dp-chat-header .dp-header-name{',
      'color:#eeeef8;font-size:15px;font-weight:600;letter-spacing:0.01em;',
    '}',
    '#dp-chat-header .dp-header-sub{',
      'color:rgba(238,238,248,0.4);font-size:10.5px;margin-top:2px;letter-spacing:0.02em;',
    '}',
    '#dp-chat-header .dp-header-badge{',
      'display:inline-block;background:rgba(34,197,94,0.15);',
      'color:#22c55e;font-size:9px;letter-spacing:1px;text-transform:uppercase;',
      'padding:2px 7px;border-radius:20px;border:1px solid rgba(34,197,94,0.25);',
      'margin-left:6px;vertical-align:middle;',
    '}',
    '#dp-chat-close{',
      'width:30px;height:30px;border-radius:8px;',
      'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);',
      'cursor:pointer;color:rgba(238,238,248,0.4);font-size:16px;line-height:1;',
      'transition:all 0.15s;display:flex;align-items:center;justify-content:center;',
      'flex-shrink:0;',
    '}',
    '#dp-chat-close:hover{color:#f0c84a;background:rgba(240,200,74,0.08);border-color:rgba(240,200,74,0.2);}',

    /* ── Messages area ─────────────────────────────────────────────────────── */
    '#dp-chat-messages{',
      'flex:1;overflow-y:auto;padding:18px 16px;',
      'display:flex;flex-direction:column;gap:14px;',
      'scroll-behavior:smooth;',
    '}',
    '#dp-chat-messages::-webkit-scrollbar{width:3px;}',
    '#dp-chat-messages::-webkit-scrollbar-track{background:transparent;}',
    '#dp-chat-messages::-webkit-scrollbar-thumb{background:rgba(240,200,74,0.2);border-radius:3px;}',

    /* ── Message bubbles ───────────────────────────────────────────────────── */
    '.dp-msg{display:flex;flex-direction:column;max-width:84%;animation:dp-msg-in 0.25s cubic-bezier(.16,1,.3,1) forwards;}',
    '.dp-msg.dp-user{align-self:flex-end;align-items:flex-end;}',
    '.dp-msg.dp-bot{align-self:flex-start;align-items:flex-start;}',
    '.dp-bubble{',
      'padding:11px 15px;border-radius:18px;',
      'font-size:14px;line-height:1.6;word-break:break-word;',
    '}',
    '.dp-msg.dp-user .dp-bubble{',
      'background:linear-gradient(135deg,#c8922a 0%,#f0c84a 100%);',
      'color:#07070f;font-weight:500;',
      'border-bottom-right-radius:5px;',
      'box-shadow:0 4px 16px rgba(200,146,42,0.3);',
    '}',
    '.dp-msg.dp-bot .dp-bubble{',
      'background:rgba(255,255,255,0.05);',
      'color:#eeeef8;',
      'border:1px solid rgba(255,255,255,0.08);',
      'border-bottom-left-radius:5px;',
      'border-left:2px solid rgba(240,200,74,0.3);',
      'box-shadow:0 2px 12px rgba(0,0,0,0.3);',
    '}',
    '.dp-msg-time{',
      'font-size:9.5px;color:rgba(238,238,248,0.25);',
      'margin-top:4px;padding:0 3px;letter-spacing:0.03em;',
    '}',

    /* ── Typing indicator ──────────────────────────────────────────────────── */
    '#dp-typing{',
      'display:none;align-self:flex-start;',
      'background:rgba(255,255,255,0.05);',
      'border:1px solid rgba(255,255,255,0.08);',
      'border-left:2px solid rgba(240,200,74,0.3);',
      'border-radius:18px;border-bottom-left-radius:5px;',
      'padding:13px 18px;gap:6px;align-items:center;',
    '}',
    '#dp-typing.dp-visible{display:flex;}',
    '.dp-dot{',
      'width:6px;height:6px;border-radius:50%;',
      'background:rgba(240,200,74,0.7);',
      'animation:dp-bounce 1.3s infinite ease-in-out;',
    '}',
    '.dp-dot:nth-child(2){animation-delay:0.18s;}',
    '.dp-dot:nth-child(3){animation-delay:0.36s;}',

    /* ── Input area ────────────────────────────────────────────────────────── */
    '#dp-chat-input-area{',
      'display:flex;align-items:flex-end;gap:10px;',
      'padding:12px 14px 14px;',
      'border-top:1px solid rgba(240,200,74,0.08);',
      'background:rgba(0,0,0,0.2);',
      'flex-shrink:0;',
    '}',
    '#dp-chat-input{',
      'flex:1;background:rgba(255,255,255,0.06);',
      'border:1px solid rgba(255,255,255,0.1);border-radius:14px;',
      'padding:11px 15px;',
      'color:#eeeef8;font-size:16px;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'outline:none;resize:none;',
      'transition:border-color 0.2s,background 0.2s;',
      'line-height:1.45;max-height:100px;overflow-y:auto;',
    '}',
    '#dp-chat-input::placeholder{color:rgba(238,238,248,0.25);font-size:14px;}',
    '#dp-chat-input:focus{border-color:rgba(240,200,74,0.35);background:rgba(255,255,255,0.08);}',
    '#dp-send-btn{',
      'width:40px;height:40px;border-radius:12px;flex-shrink:0;',
      'background:linear-gradient(135deg,#c8922a 0%,#f0c84a 100%);',
      'border:none;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:transform 0.15s,box-shadow 0.15s;',
      'color:#07070f;',
      'box-shadow:0 4px 16px rgba(200,146,42,0.35);',
    '}',
    '#dp-send-btn:hover{transform:scale(1.08);box-shadow:0 6px 22px rgba(200,146,42,0.5);}',
    '#dp-send-btn:active{transform:scale(0.94);}',
    '#dp-send-btn svg{width:16px;height:16px;fill:currentColor;}',

    /* ── Footer ────────────────────────────────────────────────────────────── */
    '#dp-chat-footer{',
      'text-align:center;padding:5px 14px 9px;',
      'font-size:9.5px;color:rgba(238,238,248,0.18);',
      'letter-spacing:0.06em;flex-shrink:0;text-transform:uppercase;',
    '}',
    '#dp-chat-footer a{color:rgba(240,200,74,0.35);text-decoration:none;transition:color 0.15s;}',
    '#dp-chat-footer a:hover{color:#f0c84a;}',

    /* ── Notification badge ─────────────────────────────────────────────────── */
    '#dp-notif-badge{',
      'position:absolute;top:-3px;right:-3px;',
      'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;',
      'border-radius:50%;width:17px;height:17px;',
      'font-size:10px;font-weight:700;',
      'display:none;align-items:center;justify-content:center;',
      'border:2px solid #0d0d1f;',
      'box-shadow:0 2px 8px rgba(239,68,68,0.5);',
    '}',
    '#dp-notif-badge.dp-show{display:flex;}',

    /* ── Mobile ─────────────────────────────────────────────────────────────── */
    '@media(max-width:480px){',
      '#dp-chat-window{',
        'right:8px;left:8px;width:auto;max-width:none;',
        'bottom:80px;height:calc(100vh - 140px);max-height:none;',
        'border-radius:20px;',
      '}',
      '#dp-chat-toggle{right:16px;bottom:16px;padding:9px 16px 9px 9px;}',
      '#dp-chat-toggle .dp-toggle-label{font-size:12px;}',
      '#dp-chat-toggle .dp-toggle-avatar{width:32px;height:32px;}',
      '#dp-chat-input{font-size:16px;}',
    '}',

  ].join('');
  document.head.appendChild(style);

  // ─── Build DOM ────────────────────────────────────────────────────────────

  // Toggle button
  var toggle = document.createElement('div');
  toggle.id = 'dp-chat-toggle';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('aria-label', 'Open chat with Ava');
  toggle.innerHTML = [
    '<div class="dp-toggle-avatar" style="background:none;overflow:hidden;">',
      '<img src="https://raw.githubusercontent.com/JaeStudio/DealerPost/master/ava.jpg" style="width:32px;height:32px;border-radius:50%;border:2px solid #f0c84a;object-fit:cover;object-position:center 15%;">',
      '<div id="dp-notif-badge">1</div>',
    '</div>',
    '<span class="dp-toggle-label">Chat with Ava 👋</span>',
  ].join('');
  document.body.appendChild(toggle);

  // Chat window
  var win = document.createElement('div');
  win.id = 'dp-chat-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Chat with Ava from DealerPost AI');
  win.innerHTML = [
    '<div id="dp-chat-header">',
      '<div class="dp-header-avatar" style="background:none;overflow:hidden;">',
        '<img src="https://raw.githubusercontent.com/JaeStudio/DealerPost/master/ava.jpg" style="width:36px;height:36px;border-radius:50%;border:2px solid #f0c84a;object-fit:cover;object-position:center 15%;">',
        '<div class="dp-online-dot"></div>',
      '</div>',
      '<div class="dp-header-info">',
        '<div class="dp-header-name">' + BOT_NAME + '</div>',
        '<div class="dp-header-sub">DealerPost AI • Usually replies instantly</div>',
      '</div>',
      '<button id="dp-chat-close" aria-label="Close chat">&#x2715;</button>',
    '</div>',

    '<div id="dp-chat-messages">',
      '<div id="dp-typing">',
        '<div class="dp-dot"></div>',
        '<div class="dp-dot"></div>',
        '<div class="dp-dot"></div>',
      '</div>',
    '</div>',

    '<div id="dp-chat-input-area">',
      '<textarea id="dp-chat-input" placeholder="Ask me anything..." rows="1" aria-label="Type your message"></textarea>',
      '<button id="dp-send-btn" aria-label="Send message">',
        '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
      '</button>',
    '</div>',

    '<div id="dp-chat-footer">',
      'Powered by <a href="https://dealerpostai.com" target="_blank" rel="noopener">DealerPost AI</a>',
    '</div>',
  ].join('');
  document.body.appendChild(win);

  // ─── Element refs ─────────────────────────────────────────────────────────
  var messagesEl  = win.querySelector('#dp-chat-messages');
  var typingEl    = win.querySelector('#dp-typing');
  var inputEl     = win.querySelector('#dp-chat-input');
  var sendBtn     = win.querySelector('#dp-send-btn');
  var closeBtn    = win.querySelector('#dp-chat-close');
  var notifBadge  = toggle.querySelector('#dp-notif-badge');

  var isOpen = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function timeLabel() {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  function appendMsg(role, text) {
    // Remove typing indicator from DOM flow before adding new message
    var typing = messagesEl.querySelector('#dp-typing');

    var wrapper = document.createElement('div');
    wrapper.className = 'dp-msg ' + (role === 'user' ? 'dp-user' : 'dp-bot');

    var bubble = document.createElement('div');
    bubble.className = 'dp-bubble';
    bubble.textContent = text;

    var timeEl = document.createElement('div');
    timeEl.className = 'dp-msg-time';
    timeEl.textContent = timeLabel();

    wrapper.appendChild(bubble);
    wrapper.appendChild(timeEl);

    // Always append before the typing indicator
    messagesEl.insertBefore(wrapper, typing);
    scrollBottom();
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    typingEl.classList.add('dp-visible');
    scrollBottom();
  }

  function hideTyping() {
    typingEl.classList.remove('dp-visible');
  }

  function openChat() {
    isOpen = true;
    win.classList.add('dp-open');
    toggle.setAttribute('aria-expanded', 'true');
    notifBadge.classList.remove('dp-show');
    // Focus input after animation
    setTimeout(function () { inputEl.focus(); }, 260);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('dp-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  // Detect identity-probing questions
  function isIdentityQuestion(text) {
    var lower = text.toLowerCase();
    return /\b(are you (a )?(bot|robot|ai|machine|human|real|person)|are you human|you('re| are) (a )?bot|you('re| are) (an )?ai|are you (an )?ai)\b/.test(lower);
  }

  // ─── API call ─────────────────────────────────────────────────────────────

  function fetchWithTimeout(url, options, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('Request timed out after ' + timeoutMs + 'ms'));
      }, timeoutMs);

      fetch(url, options).then(function (res) {
        clearTimeout(timer);
        resolve(res);
      }).catch(function (err) {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  function callAPI(payload, attempt) {
    return fetchWithTimeout(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 15000).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error('HTTP ' + res.status + ': ' + body);
        });
      }
      return res.json();
    });
  }

  function sendMessage(userText) {
    if (!userText.trim()) return;

    // Check identity pressure
    if (isIdentityQuestion(userText)) {
      identityPressCount++;
    }

    // Add to local history
    history.push({ role: 'user', content: userText });

    appendMsg('user', userText);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    showTyping();
    sendBtn.disabled = true;

    var payload = {
      messages: history,
    };

    callAPI(payload, 1)
      .then(function (data) {
        hideTyping();
        var reply = (data && data.reply) ? data.reply : "Sorry, I hit a snag — try again in a sec!";
        history.push({ role: 'assistant', content: reply });
        appendMsg('bot', reply);
        sendBtn.disabled = false;
      })
      .catch(function (err) {
        console.warn('[DealerPost AI Chat] First attempt failed:', err);
        // Show a soft "hold on" message and auto-retry once after 2 seconds
        hideTyping();
        var thinkingMsg = appendTempMsg('bot', 'Hmm, give me just a sec... \uD83E\uDD14');
        setTimeout(function () {
          if (thinkingMsg && thinkingMsg.parentNode) {
            thinkingMsg.parentNode.removeChild(thinkingMsg);
          }
          showTyping();
          callAPI(payload, 2)
            .then(function (data) {
              hideTyping();
              var reply = (data && data.reply) ? data.reply : "Sorry, I hit a snag — try again in a sec!";
              history.push({ role: 'assistant', content: reply });
              appendMsg('bot', reply);
            })
            .catch(function (retryErr) {
              hideTyping();
              console.warn('[DealerPost AI Chat] Retry also failed:', retryErr);
              appendMsg('bot', "Sorry about that — something went sideways on my end. Mind trying again?");
            })
            .finally(function () {
              sendBtn.disabled = false;
            });
        }, 2000);
      });
  }

  // Like appendMsg but returns the wrapper element so it can be removed
  function appendTempMsg(role, text) {
    var typing = messagesEl.querySelector('#dp-typing');
    var wrapper = document.createElement('div');
    wrapper.className = 'dp-msg ' + (role === 'user' ? 'dp-user' : 'dp-bot');

    var bubble = document.createElement('div');
    bubble.className = 'dp-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messagesEl.insertBefore(wrapper, typing);
    scrollBottom();
    return wrapper;
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  toggle.addEventListener('click', function () {
    isOpen ? closeChat() : openChat();
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeChat();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (isOpen && !win.contains(e.target) && !toggle.contains(e.target)) {
      closeChat();
    }
  });

  // Keyboard: Enter to send (Shift+Enter for newline)
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  sendBtn.addEventListener('click', function () {
    sendMessage(inputEl.value);
  });

  // Escape key closes chat
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // ─── Init: show welcome message after short delay ─────────────────────────
  setTimeout(function () {
    appendMsg('bot', WELCOME_MSG);
    history.push({ role: 'assistant', content: WELCOME_MSG });
    // Show notification badge to draw attention
    notifBadge.classList.add('dp-show');
  }, 800);

})();
