export function destination(value) {
  const text = value.trim();
  if (!text) throw new Error('Enter a website or search.');
  const looksLikeHost = /^(?:localhost|(?:[a-z\d-]+\.)+[a-z\d-]+|\[[a-f\d:]+\])(?::\d+)?(?:[/?#]|$)/i.test(text);
  const hasScheme = !looksLikeHost && /^[a-z][a-z\d+.-]*:/i.test(text);
  if (!hasScheme && !looksLikeHost) return `https://duckduckgo.com/?q=${encodeURIComponent(text)}`;
  const url = new URL(hasScheme ? text : `https://${text}`);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS websites are supported.');
  if (url.username || url.password) throw new Error('Enter the website address without a username or password.');
  return url.href;
}

export function relayAddress(value) {
  const url = new URL(value.trim());
  if (url.protocol === 'https:') url.protocol = 'wss:';
  if (url.protocol !== 'wss:') throw new Error('Use a secure Wisp address beginning with wss://.');
  if (url.username || url.password || url.hash) throw new Error('Use a Wisp address without login details or a fragment.');
  return url.href;
}
