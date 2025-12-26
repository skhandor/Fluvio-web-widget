/**
 * Fluvio Universal Voice Widget
 * Deploy to any website with a single script tag
 * 
 * Usage:
 * <script src="https://your-domain.com/fluvio-universal-widget.js" 
 *         data-webhook="https://hook.us2.make.com/your-webhook"
 *         data-agent-id="agent_your_agent_id"></script>
 */

(function() {
  'use strict';

  // Configuration from script tag attributes
  const currentScript = document.currentScript || document.querySelector('script[src*="fluvio-universal-widget"]');
  const config = {
    webhook: currentScript?.getAttribute('data-webhook') || '',
    // Updated to use project_id instead of agent_id
    projectId: currentScript?.getAttribute('data-project-id') || '',
    // Legacy support for backward compatibility
    agentId: currentScript?.getAttribute('data-agent-id') || '', // Deprecated - use project-id
    voiceAgentId: currentScript?.getAttribute('data-voice-agent-id') || '', // Deprecated - use project-id
    chatAgentId: currentScript?.getAttribute('data-chat-agent-id') || '', // Deprecated - use project-id
    // UI Configuration
    color: currentScript?.getAttribute('data-color') || '#347D9B',
    position: currentScript?.getAttribute('data-position') || 'bottom-right',
    title: currentScript?.getAttribute('data-title') || 'AI Assistant',
    subtitle: currentScript?.getAttribute('data-subtitle') || 'Voice & Chat Support',
    showTranscript: currentScript?.getAttribute('data-show-transcript') === 'true',
    // Mode configuration
    mode: currentScript?.getAttribute('data-mode') || 'dual', // 'voice', 'chat', or 'dual'
    defaultMode: currentScript?.getAttribute('data-default-mode') || 'voice', // Default active mode
    // Dynamic variables support
    companyName: currentScript?.getAttribute('data-company-name') || '',
    companyNumber: currentScript?.getAttribute('data-company-number') || '',
    companyHours: currentScript?.getAttribute('data-company-hours') || '',
    agentName: currentScript?.getAttribute('data-agent-name') || '',
    agentTitle: currentScript?.getAttribute('data-agent-title') || '',
    companyAddress: currentScript?.getAttribute('data-company-address') || '',
    greeting: currentScript?.getAttribute('data-greeting') || ''
  };

  // Prevent multiple instances
  if (window.FluvioWidgetLoaded) {
    console.warn('Fluvio Widget already loaded');
    return;
  }
  window.FluvioWidgetLoaded = true;

  console.log('🎧 Fluvio Universal Widget Loading...');

  // Inject CSS styles
  function injectStyles() {
    const css = `
      #fluvio-fab {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${config.color};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 999999;
        font-size: 24px;
        box-shadow: 0 8px 32px rgba(52, 125, 155, 0.3);
        transition: all 0.3s ease;
        animation: fluvio-float 3s ease-in-out infinite;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
      }

      #fluvio-fab:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 12px 40px rgba(52, 125, 155, 0.4);
      }

      @keyframes fluvio-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }

      #fluvio-panel {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 380px;
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        z-index: 999999;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
        animation: fluvio-slideUp 0.3s ease-out;
      }

      @keyframes fluvio-slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      #fluvio-header {
        background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%);
        color: white;
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #fluvio-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #fluvio-header-icon {
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }

      #fluvio-header-text h4 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.2;
      }

      #fluvio-header-text p {
        margin: 2px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
        font-weight: 400;
      }

      #fluvio-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.2s ease;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #fluvio-close:hover {
        background: rgba(255,255,255,0.1);
      }

      #fluvio-content {
        padding: 32px 24px 24px;
        text-align: center;
      }

      #fluvio-mode-selector {
        display: flex;
        background: #F3F4F6;
        border-radius: 8px;
        padding: 4px;
        margin-bottom: 24px;
        gap: 4px;
      }

      .fluvio-mode-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
        color: #6B7280;
      }

      .fluvio-mode-btn.active {
        background: ${config.color};
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .fluvio-mode-btn:hover:not(.active) {
        background: #E5E7EB;
        color: #374151;
      }

      #fluvio-chat-container {
        display: none;
        text-align: left;
      }

      #fluvio-chat-container.active {
        display: block;
      }

      #fluvio-chat-messages {
        height: 300px;
        overflow-y: auto;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        background: #FAFAFA;
      }

      .fluvio-message {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .fluvio-message.user {
        flex-direction: row-reverse;
      }

      .fluvio-message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }

      .fluvio-message.agent .fluvio-message-avatar {
        background: ${config.color};
        color: white;
      }

      .fluvio-message.user .fluvio-message-avatar {
        background: #6B7280;
        color: white;
      }

      .fluvio-message-content {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 70%;
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid #E5E7EB;
      }

      .fluvio-message.user .fluvio-message-content {
        background: ${config.color};
        color: white;
        border-color: ${config.color};
      }

      #fluvio-chat-input-container {
        display: flex;
        gap: 8px;
      }

      #fluvio-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #D1D5DB;
        border-radius: 8px;
        font-size: 14px;
        resize: none;
        min-height: 20px;
        max-height: 100px;
        font-family: inherit;
      }

      #fluvio-chat-input:focus {
        outline: none;
        border-color: ${config.color};
        box-shadow: 0 0 0 3px ${config.color}20;
      }

      #fluvio-chat-send {
        padding: 12px 16px;
        background: ${config.color};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.2s ease;
      }

      #fluvio-chat-send:hover:not(:disabled) {
        background: ${config.color}dd;
      }

      #fluvio-chat-send:disabled {
        background: #9CA3AF;
        cursor: not-allowed;
      }

      #fluvio-voice-container {
        display: block;
        text-align: center;
      }

      #fluvio-voice-container.active {
        display: block;
      }

      .fluvio-typing-indicator {
        display: none;
        align-items: center;
        gap: 8px;
        color: #6B7280;
        font-size: 14px;
        font-style: italic;
        margin-bottom: 12px;
      }

      .fluvio-typing-indicator.show {
        display: flex;
      }

      .fluvio-typing-dots {
        display: flex;
        gap: 4px;
      }

      .fluvio-typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9CA3AF;
        animation: fluvio-typing 1.4s infinite ease-in-out;
      }

      .fluvio-typing-dot:nth-child(1) { animation-delay: -0.32s; }
      .fluvio-typing-dot:nth-child(2) { animation-delay: -0.16s; }

      @keyframes fluvio-typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      #fluvio-footer {
        padding: 12px 24px 16px;
        text-align: center;
        border-top: 1px solid #F3F4F6;
        background: #FAFAFA;
      }

      #fluvio-branding {
        font-size: 12px;
        color: #9CA3AF;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      #fluvio-branding:hover {
        color: ${config.color};
      }

      #fluvio-footer {
        padding: 12px 24px 16px;
        text-align: center;
        border-top: 1px solid #F3F4F6;
        background: #FAFAFA;
      }

      #fluvio-branding {
        font-size: 12px;
        color: #9CA3AF;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      #fluvio-branding:hover {
        color: ${config.color};
      }

      #fluvio-instruction {
        color: #6B7280;
        font-size: 16px;
        margin-bottom: 32px;
        line-height: 1.5;
      }

      #fluvio-status-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding: 16px 20px;
        background: #F9FAFB;
        border-radius: 12px;
      }

      #fluvio-status-label {
        font-size: 14px;
        color: #6B7280;
        font-weight: 500;
      }

      #fluvio-status {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      #fluvio-status.offline {
        color: #6B7280;
      }

      #fluvio-status.connecting {
        color: #F59E0B;
      }

      #fluvio-status.online {
        color: #10B981;
      }

      #fluvio-call-button {
        width: 100%;
        padding: 16px 24px;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
      }

      #fluvio-call-button.start {
        background: ${config.color};
        color: white;
      }

      #fluvio-call-button.start:hover:not(:disabled) {
        background: ${config.color}dd;
        transform: translateY(-1px);
      }

      #fluvio-call-button.end {
        background: #EF4444;
        color: white;
      }

      #fluvio-call-button.end:hover:not(:disabled) {
        background: #DC2626;
        transform: translateY(-1px);
      }

      #fluvio-call-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
      }

      #fluvio-call-icon {
        font-size: 18px;
      }

      #fluvio-transcript-container {
        margin-top: 24px;
        display: none;
      }

      #fluvio-transcript-container.show {
        display: block;
      }

      #fluvio-transcript-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      #fluvio-transcript-label {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }

      #fluvio-transcript-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        background: #E5E7EB;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s ease;
        border: none;
        outline: none;
      }

      #fluvio-transcript-toggle.active {
        background: ${config.color};
      }

      #fluvio-transcript-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      #fluvio-transcript-toggle.active::after {
        transform: translateX(20px);
      }

      #fluvio-transcript {
        background: #F9FAFB;
        border-radius: 12px;
        padding: 16px;
        max-height: 200px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
        white-space: pre-wrap;
        border: 1px solid #E5E7EB;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        #fluvio-fab {
          width: 56px;
          height: 56px;
          bottom: 16px;
          right: 16px;
          font-size: 22px;
          animation: none;
        }

        #fluvio-panel {
          width: calc(100vw - 32px);
          right: 16px;
          left: 16px;
          bottom: 80px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }

        #fluvio-header {
          padding: 16px 20px;
        }

        #fluvio-content {
          padding: 24px 20px 20px;
        }

        #fluvio-instruction {
          font-size: 15px;
          margin-bottom: 24px;
        }
      }

      @media (max-width: 360px) {
        #fluvio-fab {
          width: 52px;
          height: 52px;
          bottom: 12px;
          right: 12px;
          font-size: 20px;
        }

        #fluvio-panel {
          width: calc(100vw - 24px);
          right: 12px;
          left: 12px;
          bottom: 72px;
          border-radius: 16px;
        }
      }

      /* Position variations */
      .fluvio-position-bottom-left #fluvio-fab {
        left: 20px;
        right: auto;
      }

      .fluvio-position-bottom-left #fluvio-panel {
        left: 20px;
        right: auto;
      }

      .fluvio-position-top-right #fluvio-fab {
        top: 20px;
        bottom: auto;
      }

      .fluvio-position-top-right #fluvio-panel {
        top: 100px;
        bottom: auto;
      }

      .fluvio-position-top-left #fluvio-fab {
        top: 20px;
        left: 20px;
        bottom: auto;
        right: auto;
      }

      .fluvio-position-top-left #fluvio-panel {
        top: 100px;
        left: 20px;
        bottom: auto;
        right: auto;
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Create widget UI
  function createWidget() {
    // Add position class to body
    document.body.classList.add(`fluvio-position-${config.position}`);

    // Create floating button
    const fab = document.createElement('div');
    fab.id = 'fluvio-fab';
    fab.innerHTML = '💬';
    fab.setAttribute('aria-label', 'Open voice assistant');
    fab.setAttribute('role', 'button');
    fab.setAttribute('tabindex', '0');

    // Create panel
    const panel = document.createElement('div');
    panel.id = 'fluvio-panel';
    
    // Determine which modes to show
    const showVoice = config.mode === 'voice' || config.mode === 'dual';
    const showChat = config.mode === 'chat' || config.mode === 'dual';
    const showModeSelector = config.mode === 'dual';
    
    panel.innerHTML = `
      <div id="fluvio-header">
        <div id="fluvio-header-content">
          <div id="fluvio-header-icon">🤖</div>
          <div id="fluvio-header-text">
            <h4>${config.title}</h4>
            <p>${config.subtitle}</p>
          </div>
        </div>
        <button id="fluvio-close" aria-label="Close">×</button>
      </div>
      <div id="fluvio-content">
        ${showModeSelector ? `
        <div id="fluvio-mode-selector">
          <button class="fluvio-mode-btn ${config.defaultMode === 'voice' ? 'active' : ''}" data-mode="voice">
            📞 Voice Call
          </button>
          <button class="fluvio-mode-btn ${config.defaultMode === 'chat' ? 'active' : ''}" data-mode="chat">
            💬 Text Chat
          </button>
        </div>
        ` : ''}
        
        <div id="fluvio-voice-container" class="${!showModeSelector || config.defaultMode === 'voice' ? 'active' : ''}">
          <div id="fluvio-instruction">
            Tap the call button to start talking.
          </div>
          <div id="fluvio-status-section">
            <span id="fluvio-status-label">Status:</span>
            <span id="fluvio-status" class="offline">Loading...</span>
          </div>
          <button id="fluvio-call-button" class="start" disabled>
            <span id="fluvio-call-icon">📞</span>
            <span id="fluvio-call-text">Call</span>
          </button>
          <div id="fluvio-transcript-container">
            <div id="fluvio-transcript-header">
              <span id="fluvio-transcript-label">Live Transcript</span>
              <button id="fluvio-transcript-toggle" class="${config.showTranscript ? 'active' : ''}" 
                      aria-label="Toggle transcript" title="Toggle live transcript"></button>
            </div>
            <div id="fluvio-transcript" style="display: ${config.showTranscript ? 'block' : 'none'}"></div>
          </div>
        </div>

        <div id="fluvio-chat-container" class="${!showModeSelector || config.defaultMode === 'chat' ? 'active' : ''}">
          <div id="fluvio-chat-messages"></div>
          <div class="fluvio-typing-indicator" id="fluvio-typing-indicator">
            <span>AI is typing</span>
            <div class="fluvio-typing-dots">
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
              <div class="fluvio-typing-dot"></div>
            </div>
          </div>
          <div id="fluvio-chat-input-container">
            <textarea id="fluvio-chat-input" placeholder="Type your message..." rows="1"></textarea>
            <button id="fluvio-chat-send">Send</button>
          </div>
        </div>
      </div>
      <div id="fluvio-footer">
        <a href="https://fluvio.ai" target="_blank" id="fluvio-branding">Powered by FluvioAI</a>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    return {
      fab,
      panel,
      statusEl: document.getElementById('fluvio-status'),
      callButton: document.getElementById('fluvio-call-button'),
      callText: document.getElementById('fluvio-call-text'),
      callIcon: document.getElementById('fluvio-call-icon'),
      transcriptContainer: document.getElementById('fluvio-transcript-container'),
      // Chat elements
      chatContainer: document.getElementById('fluvio-chat-container'),
      chatMessages: document.getElementById('fluvio-chat-messages'),
      chatInput: document.getElementById('fluvio-chat-input'),
      chatSend: document.getElementById('fluvio-chat-send'),
      typingIndicator: document.getElementById('fluvio-typing-indicator'),
      // Voice elements
      voiceContainer: document.getElementById('fluvio-voice-container'),
      // Mode selector
      modeSelector: document.getElementById('fluvio-mode-selector')
    };
  }

  // Load Retell SDK
  function loadRetellSDK() {
    return new Promise((resolve, reject) => {
      console.log('🎧 Attempting to load Retell SDK from unpkg...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
      
      script.onload = () => {
        console.log('🎧 Retell SDK loaded from unpkg');
        resolve();
      };
      
      script.onerror = () => {
        console.log('🎧 unpkg failed, trying jsdelivr...');
        // Fallback to jsdelivr
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/dist/retell-client-js-sdk.min.js';
        
        script2.onload = () => {
          console.log('🎧 Retell SDK loaded from jsdelivr');
          resolve();
        };
        
        script2.onerror = () => {
          console.log('🎧 jsdelivr failed, trying skypack...');
          // Fallback to skypack with dynamic import
          import('https://cdn.skypack.dev/retell-client-js-sdk')
            .then(({ RetellWebClient }) => {
              window.RetellWebClient = RetellWebClient;
              console.log('🎧 Retell SDK loaded from skypack');
              resolve();
            })
            .catch(err => {
              console.log('🎧 skypack failed, trying esm.sh...');
              // Final fallback to esm.sh
              import('https://esm.sh/retell-client-js-sdk')
                .then(({ RetellWebClient }) => {
                  window.RetellWebClient = RetellWebClient;
                  console.log('🎧 Retell SDK loaded from esm.sh');
                  resolve();
                })
                .catch(finalErr => {
                  console.error('🎧 All SDK loading methods failed');
                  console.error('unpkg error:', script.error);
                  console.error('jsdelivr error:', script2.error);
                  console.error('skypack error:', err);
                  console.error('esm.sh error:', finalErr);
                  reject(new Error('Failed to load Retell SDK from all sources'));
                });
            });
        };
        
        document.head.appendChild(script2);
      };
      
      document.head.appendChild(script);
    });
  }

  // Initialize widget functionality
  function initializeWidget(elements) {
    let RetellWebClient;
    let client;
    let isCallActive = false;
    let demoMode = false;
    let transcriptEnabled = config.showTranscript;
    let currentMode = config.defaultMode;
    let currentChatId = null;
    let chatHistory = [];

    // Chat functionality
    async function startChatSession() {
      try {
        const response = await fetch(config.webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            project_id: config.projectId,
            mode: 'chat',
            dynamic_variables: {
              ...(config.companyName && { company_name: config.companyName }),
              ...(config.companyNumber && { company_number: config.companyNumber }),
              ...(config.companyHours && { company_hours: config.companyHours }),
              ...(config.agentName && { AI_agent: config.agentName }),
              ...(config.agentTitle && { AI_agent_title: config.agentTitle }),
              ...(config.companyAddress && { company_address: config.companyAddress }),
              ...(config.greeting && { greeting: config.greeting })
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        currentChatId = data.chat_id;
        
        if (!currentChatId) {
          throw new Error('No chat ID received');
        }

        console.log('🎧 Chat session started:', currentChatId);
        return currentChatId;
      } catch (error) {
        console.error('🎧 Failed to start chat session:', error);
        throw error;
      }
    }

    async function sendChatMessage(message) {
      if (!currentChatId) {
        await startChatSession();
      }

      try {
        const response = await fetch('https://api.retellai.com/v2/create-chat-completion', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getRetellApiKey()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: currentChatId,
            content: message
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.messages || [];
      } catch (error) {
        console.error('🎧 Failed to send chat message:', error);
        throw error;
      }
    }

    async function getRetellApiKey() {
      // For demo purposes, we'll simulate the API call
      // In production, you'd need to get the API key from your backend
      throw new Error('Direct API calls require backend implementation');
    }

    function addChatMessage(content, role = 'user') {
      const messageDiv = document.createElement('div');
      messageDiv.className = `fluvio-message ${role}`;
      
      messageDiv.innerHTML = `
        <div class="fluvio-message-avatar">${role === 'agent' ? '🤖' : '👤'}</div>
        <div class="fluvio-message-content">${content}</div>
      `;
      
      elements.chatMessages.appendChild(messageDiv);
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
      
      chatHistory.push({ role, content, timestamp: Date.now() });
    }

    function showTypingIndicator() {
      elements.typingIndicator.classList.add('show');
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
      elements.typingIndicator.classList.remove('show');
    }

    async function handleChatMessage() {
      const message = elements.chatInput.value.trim();
      if (!message) return;

      console.log('Chat message being sent:', message);

      // Add user message
      addChatMessage(message, 'user');
      elements.chatInput.value = '';
      elements.chatInput.style.height = 'auto'; // Reset textarea height
      elements.chatSend.disabled = true;
      
      showTypingIndicator();

      try {
        // For demo mode or missing project ID, simulate AI response
        if (demoMode || !config.projectId || config.projectId.includes('demo')) {
          console.log('Chat running in demo mode');
          setTimeout(() => {
            hideTypingIndicator();
            
            // Generate a more realistic demo response
            const demoResponses = [
              `Thank you for your message! I understand you said: "${message}". How can I help you further?`,
              `I received your message about "${message}". This is a demo response - in production, I would connect to your Retell chat agent.`,
              `Great question! Regarding "${message}" - I'm currently in demo mode. Your actual chat agent would provide real responses here.`,
              `I see you mentioned "${message}". In live mode, this would be handled by your configured Retell chat agent with full AI capabilities.`
            ];
            
            const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
            addChatMessage(randomResponse, 'agent');
            elements.chatSend.disabled = false;
          }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
          return;
        }

        // Real chat implementation using webhook
        console.log('Starting real chat session...');
        
        // First, start a chat session if we don't have one
        if (!currentChatId) {
          console.log('Creating new chat session...');
          await startChatSession();
        }

        // For now, simulate the chat response since we need to implement the full chat completion API
        // In a full implementation, this would call the Retell chat completion API
        setTimeout(() => {
          hideTypingIndicator();
          addChatMessage(`I received your message: "${message}". Chat functionality is working! In production, this would connect to your Retell chat agent for real AI responses.`, 'agent');
          elements.chatSend.disabled = false;
        }, 1500);
        
      } catch (error) {
        console.error('Chat error:', error);
        hideTypingIndicator();
        addChatMessage('Sorry, I encountered an error. Please try again.', 'agent');
        elements.chatSend.disabled = false;
      }
    }

    function switchMode(mode) {
      currentMode = mode;
      console.log('Switching to mode:', mode);
      
      // Update mode selector buttons
      if (elements.modeSelector) {
        elements.modeSelector.querySelectorAll('.fluvio-mode-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mode === mode);
        });
      }
      
      // Show/hide containers
      if (elements.voiceContainer) {
        elements.voiceContainer.style.display = mode === 'voice' ? 'block' : 'none';
        console.log('Voice container display:', elements.voiceContainer.style.display);
      }
      if (elements.chatContainer) {
        elements.chatContainer.style.display = mode === 'chat' ? 'block' : 'none';
        console.log('Chat container display:', elements.chatContainer.style.display);
      }
      
      console.log('Mode switched to:', mode);
    }

    try {
      // Try to find RetellWebClient
      if (window.RetellSDK && window.RetellSDK.RetellWebClient) {
        RetellWebClient = window.RetellSDK.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window.RetellSDK');
      } else if (window.RetellWebClient) {
        RetellWebClient = window.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window');
      } else if (window.Retell && window.Retell.RetellWebClient) {
        RetellWebClient = window.Retell.RetellWebClient;
        console.log('🎧 Found RetellWebClient in window.Retell');
      } else {
        console.warn('🎧 RetellWebClient not found - enabling demo mode');
        demoMode = true;
      }

      if (!demoMode) {
        client = new RetellWebClient();
      }

      // Update status
      elements.statusEl.textContent = demoMode ? 'Demo Mode' : 'Offline';
      elements.statusEl.className = demoMode ? 'connecting' : 'offline';
      elements.callButton.disabled = false;

      console.log('🎧 Widget initialized successfully' + (demoMode ? ' (Demo Mode)' : ''));

    } catch (error) {
      console.warn('🎧 SDK initialization failed, enabling demo mode:', error);
      demoMode = true;
      elements.statusEl.textContent = 'Demo Mode';
      elements.statusEl.className = 'connecting';
      elements.callButton.disabled = false;
    }

    // Event handlers
    elements.fab.addEventListener('click', (e) => {
      console.log('🎧 FAB clicked');
      
      const isVisible = elements.panel.style.display === 'block';
      elements.panel.style.display = isVisible ? 'none' : 'block';
    });

    // Keyboard support
    elements.fab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('🎧 FAB keyboard activated');
        elements.fab.click();
      }
    });

    document.getElementById('fluvio-close').addEventListener('click', (e) => {
      console.log('🎧 Close button clicked');
      elements.panel.style.display = 'none';
    });

    // Mode selector event handlers
    if (elements.modeSelector) {
      elements.modeSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('fluvio-mode-btn')) {
          const mode = e.target.dataset.mode;
          switchMode(mode);
        }
      });
    }

    // Chat event handlers
    if (elements.chatSend) {
      console.log('Attaching chat send button event handler');
      elements.chatSend.addEventListener('click', handleChatMessage);
    } else {
      console.warn('Chat send button not found');
    }

    if (elements.chatInput) {
      console.log('Attaching chat input event handlers');
      elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          console.log('Enter key pressed in chat input');
          handleChatMessage();
        }
      });

      // Auto-resize textarea
      elements.chatInput.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
      });
    } else {
      console.warn('Chat input not found');
    }

    // Initialize chat with welcome message if in chat mode
    if (currentMode === 'chat' || config.mode === 'chat') {
      console.log('Initializing chat with welcome message');
      setTimeout(() => {
        addChatMessage(config.greeting || 'Hello! How can I help you today?', 'agent');
      }, 500);
    }

    console.log('Widget initialization complete', {
      currentMode,
      hasVoiceContainer: !!elements.voiceContainer,
      hasChatContainer: !!elements.chatContainer,
      hasChatSend: !!elements.chatSend,
      hasChatInput: !!elements.chatInput
    });

    // Transcript toggle functionality
    const transcriptToggle = document.getElementById('fluvio-transcript-toggle');
    const transcriptDiv = document.getElementById('fluvio-transcript');
    
    transcriptToggle.addEventListener('click', (e) => {
      e.preventDefault();
      transcriptEnabled = !transcriptEnabled;
      
      // Update toggle appearance
      transcriptToggle.classList.toggle('active', transcriptEnabled);
      
      // Show/hide transcript
      transcriptDiv.style.display = transcriptEnabled ? 'block' : 'none';
      
      console.log('🎧 Transcript toggled:', transcriptEnabled ? 'ON' : 'OFF');
    });

    elements.callButton.addEventListener('click', async (e) => {
      console.log('🎧 Call button clicked');
      
      if (elements.callButton.disabled) {
        console.log('🎧 Call button is disabled, ignoring click');
        return;
      }
      
      if (demoMode) {
        // Demo mode simulation
        if (!isCallActive) {
          console.log('🎧 Demo: Starting simulated call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          setTimeout(() => {
            elements.statusEl.textContent = 'Connected (Demo)';
            elements.statusEl.className = 'online';
            isCallActive = true;
            elements.callButton.className = 'end';
            elements.callButton.disabled = false;
            elements.callText.textContent = 'End Call';
            elements.transcriptContainer.classList.add('show');
            
            if (transcriptEnabled) {
              const transcriptDiv = document.getElementById('fluvio-transcript');
              transcriptDiv.textContent = 'Demo Mode: This is a simulation.\n\nIn production, this would show real-time conversation transcripts between you and the AI agent.\n\nThe actual voice calls work with your Retell AI agent when the SDK loads properly.';
            }
            
            console.log('🎧 Demo: Call connected');
          }, 1500);
        } else {
          console.log('🎧 Demo: Ending simulated call...');
          elements.statusEl.textContent = 'Demo Mode';
          elements.statusEl.className = 'connecting';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Call';
        }
        return;
      }

      // Real Retell functionality
      if (!isCallActive) {
        try {
          console.log('🎧 Starting real call...');
          elements.statusEl.textContent = 'Connecting...';
          elements.statusEl.className = 'connecting';
          elements.callButton.disabled = true;

          // Check if webhook URL is a placeholder
          if (config.webhook.includes('your-webhook') || config.webhook.includes('httpbin.org')) {
            console.log('🎧 Demo webhook detected, simulating call...');
            // Simulate demo call for testing
            setTimeout(() => {
              elements.statusEl.textContent = 'Connected (Demo)';
              elements.statusEl.className = 'online';
              isCallActive = true;
              elements.callButton.className = 'end';
              elements.callButton.disabled = false;
              elements.callText.textContent = 'End Call';
              elements.transcriptContainer.classList.add('show');
              
              if (transcriptEnabled) {
                const transcriptDiv = document.getElementById('fluvio-transcript');
                transcriptDiv.textContent = 'Demo Mode: Voice call simulation.\n\nTo use real voice calls:\n1. Replace webhook URL with your actual Make.com webhook\n2. Configure your voice agent ID\n3. Ensure Retell SDK loads properly\n\nThis demo shows the UI and flow without making real API calls.';
              }
            }, 1500);
            return;
          }

          const response = await fetch(config.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              project_id: config.projectId,
              mode: 'voice',
              dynamic_variables: {
                ...(config.companyName && { company_name: config.companyName }),
                ...(config.companyNumber && { company_number: config.companyNumber }),
                ...(config.companyHours && { company_hours: config.companyHours }),
                ...(config.agentName && { AI_agent: config.agentName }),
                ...(config.agentTitle && { AI_agent_title: config.agentTitle }),
                ...(config.companyAddress && { company_address: config.companyAddress }),
                ...(config.greeting && { greeting: config.greeting })
              }
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const responseText = await response.text();
          let webhookData;
          
          try {
            webhookData = JSON.parse(responseText);
          } catch (e) {
            webhookData = { access_token: responseText.trim() };
          }

          const accessToken = webhookData.access_token || responseText.trim();
          
          if (!accessToken) {
            throw new Error('No access token received from webhook');
          }

          const callOptions = {
            accessToken: accessToken,
            sampleRate: 24000,
            enableUpdate: true
          };

          if (webhookData.call_inbound && webhookData.call_inbound.dynamic_variables) {
            callOptions.retell_llm_dynamic_variables = webhookData.call_inbound.dynamic_variables;
            console.log('🎧 Dynamic variables included:', webhookData.call_inbound.dynamic_variables);
          }

          console.log('🎧 Starting call with options:', callOptions);
          await client.startCall(callOptions);

        } catch (error) {
          console.error('🎧 Call failed:', error);
          
          // Provide more specific error messages
          let errorMessage = 'Connection failed';
          if (error.message.includes('CORS')) {
            errorMessage = 'CORS error - check webhook';
          } else if (error.message.includes('404')) {
            errorMessage = 'Webhook not found';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error';
          }
          
          elements.statusEl.textContent = errorMessage;
          elements.statusEl.className = 'offline';
          elements.callButton.disabled = false;
        }
      } else {
        console.log('🎧 Ending real call...');
        if (client && client.stopCall) {
          client.stopCall();
        } else {
          // Manual cleanup for demo mode
          elements.statusEl.textContent = 'Offline';
          elements.statusEl.className = 'offline';
          isCallActive = false;
          elements.callButton.className = 'start';
          elements.callButton.disabled = false;
          elements.callText.textContent = 'Call';
        }
      }
    });

    // Retell event listeners (only if not in demo mode)
    if (!demoMode && client) {
      client.on('call_started', () => {
        console.log('🎧 Call started');
        elements.statusEl.textContent = 'Connected';
        elements.statusEl.className = 'online';
        isCallActive = true;
        elements.callButton.className = 'end';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'End Call';
        elements.transcriptContainer.classList.add('show');
      });

      client.on('call_ended', () => {
        console.log('🎧 Call ended');
        elements.statusEl.textContent = 'Offline';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
      });

      client.on('agent_start_talking', () => {
        elements.statusEl.textContent = 'Agent speaking...';
        elements.statusEl.className = 'online';
      });

      client.on('agent_stop_talking', () => {
        elements.statusEl.textContent = 'Listening...';
        elements.statusEl.className = 'online';
      });

      client.on('update', (update) => {
        if (transcriptEnabled && update.transcript && update.transcript.length > 0) {
          const transcriptDiv = document.getElementById('fluvio-transcript');
          const transcriptText = update.transcript
            .map(t => `${t.role === 'agent' ? 'Agent' : 'You'}: ${t.content}`)
            .join('\n\n');
          transcriptDiv.textContent = transcriptText;
          transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        }
      });

      client.on('error', (error) => {
        console.error('🎧 Retell error:', error);
        elements.statusEl.textContent = 'Error occurred';
        elements.statusEl.className = 'offline';
        isCallActive = false;
        elements.callButton.className = 'start';
        elements.callButton.disabled = false;
        elements.callText.textContent = 'Call';
      });
    }
  }

  // Main initialization
  async function init() {
    if (!config.webhook) {
      console.error('🎧 Missing data-webhook attribute');
      return;
    }

    // Validate agent configuration
    if (config.mode === 'voice' || config.mode === 'dual' || config.mode === 'chat') {
      if (!config.projectId) {
        console.error('🎧 Missing project ID (data-project-id)');
        return;
      }
    }

    try {
      // Inject styles
      injectStyles();

      // Create UI
      const elements = createWidget();

      // Try to load SDK for voice functionality
      if (config.mode === 'voice' || config.mode === 'dual') {
        try {
          await loadRetellSDK();
          console.log('🎧 SDK loaded successfully, voice functionality enabled');
        } catch (error) {
          console.warn('🎧 SDK loading failed, voice will run in demo mode:', error.message);
        }
      }

      // Initialize widget
      initializeWidget(elements);

      console.log('Fluvio Universal Widget ready!', {
        mode: config.mode,
        projectId: config.projectId,
        defaultMode: config.defaultMode
      });
    } catch (error) {
      console.error('🎧 Widget initialization failed:', error);
    }
  }

  // Start when DOM is ready
  function initWhenReady() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      // DOM is already ready, but let's wait a tick to ensure all scripts are loaded
      setTimeout(init, 0);
    }
  }

  // Call initialization
  initWhenReady();

})();