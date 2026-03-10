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
    /* Toggle button */
    '#dp-chat-toggle{',
      'position:fixed;bottom:24px;right:24px;z-index:99999;',
      'display:flex;align-items:center;gap:10px;',
      'background:' + DARK_BG + ';',
      'border:1.5px solid ' + GOLD + ';',
      'border-radius:50px;',
      'padding:12px 20px;',
      'cursor:pointer;',
      'box-shadow:0 4px 32px rgba(240,200,74,0.22),0 2px 8px rgba(0,0,0,0.5);',
      'transition:transform 0.2s cubic-bezier(.16,1,.3,1),box-shadow 0.2s;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'user-select:none;',
    '}',
    '#dp-chat-toggle:hover{',
      'transform:translateY(-3px) scale(1.03);',
      'box-shadow:0 8px 40px rgba(240,200,74,0.35),0 2px 12px rgba(0,0,0,0.6);',
    '}',
    '#dp-chat-toggle .dp-toggle-label{',
      'color:' + GOLD + ';',
      'font-size:14px;font-weight:600;letter-spacing:0.01em;white-space:nowrap;',
    '}',
    '#dp-chat-toggle .dp-toggle-avatar{',
      'width:32px;height:32px;border-radius:50%;',
      'background:linear-gradient(135deg,' + GOLD + ' 0%,#c9952a 100%);',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:16px;flex-shrink:0;',
    '}',

    /* Chat window */
    '#dp-chat-window{',
      'position:fixed;bottom:90px;right:24px;z-index:99998;',
      'width:360px;max-width:calc(100vw - 32px);',
      'height:520px;max-height:calc(100vh - 120px);',
      'background:' + DARK_BG + ';',
      'border:1.5px solid ' + BORDER + ';',
      'border-radius:20px;',
      'display:flex;flex-direction:column;',
      'box-shadow:0 8px 64px rgba(0,0,0,0.7),0 2px 16px rgba(240,200,74,0.12);',
      'overflow:hidden;',
      'opacity:0;pointer-events:none;',
      'transform:translateY(16px) scale(0.97);',
      'transition:opacity 0.25s cubic-bezier(.16,1,.3,1),transform 0.25s cubic-bezier(.16,1,.3,1);',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    '}',
    '#dp-chat-window.dp-open{',
      'opacity:1;pointer-events:all;transform:translateY(0) scale(1);',
    '}',

    /* Header */
    '#dp-chat-header{',
      'display:flex;align-items:center;gap:12px;',
      'padding:16px 18px;',
      'border-bottom:1px solid ' + BORDER + ';',
      'flex-shrink:0;',
    '}',
    '#dp-chat-header .dp-header-avatar{',
      'width:38px;height:38px;border-radius:50%;',
      'background:linear-gradient(135deg,' + GOLD + ' 0%,#c9952a 100%);',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:18px;flex-shrink:0;position:relative;',
    '}',
    '#dp-chat-header .dp-online-dot{',
      'position:absolute;bottom:1px;right:1px;',
      'width:9px;height:9px;border-radius:50%;',
      'background:#22c55e;border:2px solid ' + DARK_BG + ';',
    '}',
    '#dp-chat-header .dp-header-info{flex:1;min-width:0;}',
    '#dp-chat-header .dp-header-name{',
      'color:#eeeef8;font-size:15px;font-weight:600;',
    '}',
    '#dp-chat-header .dp-header-sub{',
      'color:rgba(238,238,248,0.5);font-size:11px;margin-top:1px;',
    '}',
    '#dp-chat-close{',
      'background:none;border:none;cursor:pointer;padding:4px;',
      'color:rgba(238,238,248,0.4);font-size:20px;line-height:1;',
      'transition:color 0.15s;display:flex;align-items:center;justify-content:center;',
    '}',
    '#dp-chat-close:hover{color:' + GOLD + ';}',

    /* Messages area */
    '#dp-chat-messages{',
      'flex:1;overflow-y:auto;padding:16px 14px;',
      'display:flex;flex-direction:column;gap:12px;',
      'scroll-behavior:smooth;',
    '}',
    '#dp-chat-messages::-webkit-scrollbar{width:4px;}',
    '#dp-chat-messages::-webkit-scrollbar-track{background:transparent;}',
    '#dp-chat-messages::-webkit-scrollbar-thumb{background:rgba(240,200,74,0.25);border-radius:4px;}',

    /* Bubbles */
    '.dp-msg{display:flex;flex-direction:column;max-width:82%;}',
    '.dp-msg.dp-user{align-self:flex-end;align-items:flex-end;}',
    '.dp-msg.dp-bot{align-self:flex-start;align-items:flex-start;}',
    '.dp-bubble{',
      'padding:10px 14px;border-radius:16px;',
      'font-size:14px;line-height:1.55;word-break:break-word;',
    '}',
    '.dp-msg.dp-user .dp-bubble{',
      'background:' + GOLD + ';',
      'color:#0d0d1e;font-weight:500;',
      'border-bottom-right-radius:4px;',
    '}',
    '.dp-msg.dp-bot .dp-bubble{',
      'background:' + CARD_BG + ';',
      'color:#eeeef8;',
      'border:1px solid rgba(255,255,255,0.07);',
      'border-bottom-left-radius:4px;',
    '}',
    '.dp-msg-time{',
      'font-size:10px;color:rgba(238,238,248,0.3);',
      'margin-top:3px;padding:0 2px;',
    '}',

    /* Typing indicator */
    '#dp-typing{',
      'display:none;align-self:flex-start;',
      'background:' + CARD_BG + ';',
      'border:1px solid rgba(255,255,255,0.07);',
      'border-radius:16px;border-bottom-left-radius:4px;',
      'padding:12px 16px;gap:5px;align-items:center;',
    '}',
    '#dp-typing.dp-visible{display:flex;}',
    '.dp-dot{',
      'width:7px;height:7px;border-radius:50%;',
      'background:rgba(240,200,74,0.6);',
      'animation:dp-bounce 1.2s infinite ease-in-out;',
    '}',
    '.dp-dot:nth-child(2){animation-delay:0.15s;}',
    '.dp-dot:nth-child(3){animation-delay:0.3s;}',
    '@keyframes dp-bounce{',
      '0%,80%,100%{transform:translateY(0);opacity:0.5;}',
      '40%{transform:translateY(-5px);opacity:1;}',
    '}',

    /* Input area */
    '#dp-chat-input-area{',
      'display:flex;align-items:center;gap:8px;',
      'padding:12px 14px;',
      'border-top:1px solid ' + BORDER + ';',
      'flex-shrink:0;',
    '}',
    '#dp-chat-input{',
      'flex:1;background:rgba(255,255,255,0.05);',
      'border:1px solid rgba(255,255,255,0.1);border-radius:12px;',
      'padding:10px 14px;',
      'color:#eeeef8;font-size:14px;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'outline:none;resize:none;',
      'transition:border-color 0.15s;',
      'line-height:1.4;max-height:100px;overflow-y:auto;',
    '}',
    '#dp-chat-input::placeholder{color:rgba(238,238,248,0.3);}',
    '#dp-chat-input:focus{border-color:rgba(240,200,74,0.4);}',
    '#dp-send-btn{',
      'width:38px;height:38px;border-radius:10px;flex-shrink:0;',
      'background:' + GOLD + ';border:none;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;',
      'transition:transform 0.15s,background 0.15s;',
      'color:' + DARK_BG + ';',
    '}',
    '#dp-send-btn:hover{transform:scale(1.08);background:#f5d66e;}',
    '#dp-send-btn:active{transform:scale(0.95);}',
    '#dp-send-btn svg{width:16px;height:16px;fill:currentColor;}',

    /* Footer */
    '#dp-chat-footer{',
      'text-align:center;padding:6px 14px 10px;',
      'font-size:10px;color:rgba(238,238,248,0.25);',
      'letter-spacing:0.04em;flex-shrink:0;',
    '}',
    '#dp-chat-footer a{color:rgba(240,200,74,0.45);text-decoration:none;}',
    '#dp-chat-footer a:hover{color:' + GOLD + ';}',

    /* Notification badge */
    '#dp-notif-badge{',
      'position:absolute;top:-4px;right:-4px;',
      'background:#ef4444;color:#fff;',
      'border-radius:50%;width:16px;height:16px;',
      'font-size:10px;font-weight:700;',
      'display:none;align-items:center;justify-content:center;',
      'border:2px solid ' + DARK_BG + ';',
    '}',
    '#dp-notif-badge.dp-show{display:flex;}',
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
      '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&hair=long&hairColor=blonde&top=longHair&accessories=prescription02&clothe=blazerAndShirt&skin=light&eyes=happy&mouth=smile" style="width:32px;height:32px;border-radius:50%;border:2px solid #f0c84a;">',
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
        '<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&hair=long&hairColor=blonde&top=longHair&accessories=prescription02&clothe=blazerAndShirt&skin=light&eyes=happy&mouth=smile" style="width:36px;height:36px;border-radius:50%;border:2px solid #f0c84a;">',
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
