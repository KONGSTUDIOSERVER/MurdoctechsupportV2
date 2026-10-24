(() => {
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const log = document.getElementById('ai-messages');
  const status = document.getElementById('ai-status');
  const send = document.getElementById('ai-send');
  const clear = document.getElementById('ai-clear');
  const endpoint = document.querySelector('meta[name="murdoc-ai-endpoint"]').content.trim();
  let history = [];
  let controller;

  function addMessage(who, text) {
    const item = document.createElement('div');
    item.className = 'ai-message ' + (who === 'You' ? 'ai-user' : 'ai-model');
    const label = document.createElement('strong');
    label.textContent = who;
    const content = document.createElement('p');
    content.textContent = text;
    item.append(label, content);
    log.append(item);
    log.scrollTop = log.scrollHeight;
    return item;
  }

  function reset() {
    controller?.abort();
    controller = null;
    history = [];
    log.replaceChildren();
    addMessage('Murdoc AI', 'Hey, I’m Murdoc AI. Ask me about tech, coding, games, or whatever’s on your mind.');
    status.textContent = endpoint ? '' : 'AI chat is not connected yet.';
    input.value = '';
    input.disabled = send.disabled = !endpoint;
    log.setAttribute('aria-busy', 'false');
    input.focus();
  }

  clear.addEventListener('click', reset);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || controller || !endpoint) return;
    if (location.protocol === 'file:') {
      status.textContent = 'Open the live Murdoc website to use AI chat.';
      return;
    }
    const request = new AbortController();
    controller = request;
    const timeout = setTimeout(() => request.abort(), 35000);
    const userMessage = addMessage('You', text);
    input.value = '';
    input.disabled = send.disabled = true;
    status.textContent = 'Murdoc AI is thinking…';
    log.setAttribute('aria-busy', 'true');
    try {
      const messages = [...history.slice(-16), { role: 'user', text }];
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: request.signal
      });
      const data = await response.json().catch(() => { throw new Error('AI chat is temporarily unavailable. Please try again.'); });
      if (!response.ok) throw new Error(data.error || 'Could not send your message. Try again.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Gemini returned an empty reply. Try again.');
      if (controller !== request) return;
      history = [...messages, { role: 'model', text: data.reply }];
      addMessage('Murdoc AI', data.reply);
      status.textContent = '';
    } catch (error) {
      if (controller !== request) return;
      userMessage.remove();
      input.value = text;
      status.textContent = request.signal.aborted ? 'That took too long. Your message is ready to retry.' : error instanceof TypeError ? 'Could not reach the AI server. Check your connection and try again.' : error.message;
    } finally {
      clearTimeout(timeout);
      if (controller === request) {
        controller = null;
        input.disabled = send.disabled = false;
        log.setAttribute('aria-busy', 'false');
        if (document.getElementById('ai-view').classList.contains('active')) input.focus();
      }
    }
  });
  reset();
})();
