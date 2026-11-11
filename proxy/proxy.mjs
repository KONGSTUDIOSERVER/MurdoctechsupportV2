import { destination, relayAddress } from './url.mjs';

const form = document.getElementById('browse');
const address = document.getElementById('address');
const relay = document.getElementById('wisp');
const go = document.getElementById('go');
const status = document.getElementById('status');
const base = new URL('./', location.href);
let controller, connection, frame, currentRelay, loadingTimer;

function message(text, error = false) {
  status.textContent = text;
  status.classList.toggle('error', error);
}

function checkRelay(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.binaryType = 'arraybuffer';
    const timer = setTimeout(() => finish(new Error('The Wisp relay timed out. Check Connection settings or try again later.')), 12000);
    let finished = false;
    function finish(error) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      socket.close();
      error ? reject(error) : resolve();
    }
    socket.onmessage = event => {
      const data = new Uint8Array(event.data);
      if (data.length >= 5 && [3, 5].includes(data[0])) finish();
      else finish(new Error('This address did not respond as a Wisp server.'));
    };
    socket.onerror = () => finish(new Error('Cannot connect to the Wisp relay. Check Connection settings or try again later.'));
    socket.onclose = () => finish(new Error('The Wisp relay closed the connection.'));
  });
}

async function initialize() {
  if (!('serviceWorker' in navigator) || !('SharedWorker' in window)) {
    throw new Error('This proxy needs service workers and shared workers. Use current Chrome, Edge, or Firefox.');
  }
  const { ScramjetController } = $scramjetLoadController();
  controller = new ScramjetController({
    prefix: new URL('service/', base).pathname,
    files: {
      wasm: new URL('vendor/scramjet/scramjet.wasm.wasm', base).href,
      all: new URL('vendor/scramjet/scramjet.all.js', base).href,
      sync: new URL('vendor/scramjet/scramjet.sync.js', base).href
    }
  });
  await controller.init();
  const registration = await navigator.serviceWorker.register(new URL('sw.js', base), {scope: base.pathname});
  if (registration.active?.state !== 'activated') {
    await new Promise((resolve, reject) => {
      const worker = registration.installing || registration.waiting || registration.active;
      const timer = setTimeout(() => reject(new Error('Proxy setup timed out. Reload this page to retry.')), 15000);
      function check() {
        if (worker.state === 'activated') { clearTimeout(timer); resolve(); }
        if (worker.state === 'redundant') { clearTimeout(timer); reject(new Error('Proxy setup failed. Reload this page to retry.')); }
      }
      worker.addEventListener('statechange', check);
      check();
    });
  }
  if (!crossOriginIsolated) {
    if (sessionStorage.getItem('murdoc-proxy-reloaded')) throw new Error('Browser isolation could not start. Reopen this page in a current browser.');
    sessionStorage.setItem('murdoc-proxy-reloaded', '1');
    location.reload();
    return;
  }
  sessionStorage.removeItem('murdoc-proxy-reloaded');
  connection = new BareMux.BareMuxConnection(new URL('vendor/bare-mux/worker.js', base).href);
  try { relay.value = relayAddress(localStorage.getItem('murdoc-proxy-relay') || relay.value); } catch {}
  go.disabled = false;
  message('Ready. Enter a website or search.');
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  go.disabled = true;
  try {
    const url = destination(address.value);
    if (new URL(url).origin === location.origin) throw new Error('Use the Arcade link to return to this site.');
    const wisp = relayAddress(relay.value);
    if (currentRelay !== wisp) {
      message('Connecting to Wisp…');
      await checkRelay(wisp);
      await connection.setTransport(new URL('vendor/libcurl-transport/index.mjs', base).href, [{websocket: wisp}]);
      currentRelay = wisp;
      try { localStorage.setItem('murdoc-proxy-relay', wisp); } catch {}
    }
    relay.value = wisp;
    if (!frame) {
      frame = controller.createFrame();
      frame.frame.title = 'Proxied website';
      frame.frame.allowFullscreen = true;
      frame.addEventListener('urlchange', event => { address.value = String(event.url); });
      frame.frame.addEventListener('load', () => {
        clearTimeout(loadingTimer);
        message('Page loaded through Wisp.');
      });
      document.getElementById('welcome').hidden = true;
      document.getElementById('viewport').appendChild(frame.frame);
      for (const id of ['back', 'forward', 'reload']) document.getElementById(id).disabled = false;
    }
    clearTimeout(loadingTimer);
    message(`Loading ${new URL(url).hostname}…`);
    loadingTimer = setTimeout(() => message('This website is taking longer than expected. Try Reload or another address.', true), 30000);
    address.value = url;
    frame.go(url);
  } catch (error) {
    message(error instanceof Error ? error.message : 'The proxy could not open this website.', true);
  } finally {
    go.disabled = false;
  }
});
document.getElementById('back').addEventListener('click', () => frame?.back());
document.getElementById('forward').addEventListener('click', () => frame?.forward());
document.getElementById('reload').addEventListener('click', () => frame?.reload());
initialize().catch(error => message(`Proxy setup failed: ${error.message}`, true));
