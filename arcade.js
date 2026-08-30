(function(){
  const views = {
    menu: document.getElementById('main-menu'),
    hall: document.getElementById('hall-view'),
    utilities: document.getElementById('utilities-view'),
    game: document.getElementById('arcade-screen')
  };
  const hall = document.getElementById('hall');
  const gameMount = document.getElementById('game-mount');
  const gameTitle = document.getElementById('game-title');
  const gameHud = document.getElementById('game-hud');
  const controlsHint = document.getElementById('controls-hint');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlaySub = document.getElementById('overlay-sub');
  const overlayRestart = document.getElementById('overlay-restart');
  const backBtn = document.getElementById('back-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  let activeGame = null;
  function showView(name){
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[name].classList.add('active');
    if(typeof gpOnViewChange === 'function') gpOnViewChange(name);
  }
  function hideOverlay(){ overlay.classList.remove('show'); }
  document.querySelectorAll('.menu-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      if(card.classList.contains('disabled')) return;
      showView(card.dataset.menu === 'games' ? 'hall' : 'utilities');
    });
  });
  document.querySelectorAll('[data-back="menu"]').forEach(btn=>{
    btn.addEventListener('click', ()=> showView('menu'));
  });
  const GAMES = {
    ovo: ['OVO', 'https://gorillazlol.duckdns.org/games/ovo/index.html'],
    karlson: ['KARLSON', 'https://gorillazlol.duckdns.org/gamefile/Karlson.html'],
    deltarune: ['DELTARUNE', 'https://gorillazlol.duckdns.org/games/deltarune/index.html'],
    tombofthemask: ['TOMB OF THE MASK', 'games/tomb.html', 'WEBGL BUILD · CLICK INSIDE TO FOCUS IT'],
    sanicball: ['SANIC BALL', 'https://gorillazlol.duckdns.org/games/ball/index.html'],
    fruitninja: ['FRUIT NINJA', 'https://gorillazlol.duckdns.org/games/fruitninja/index.html'],
    minus3: ['MINUS THREE', 'games/minus3.html', 'WEBGL BUILD · FIRST LOAD CAN TAKE A WHILE'],
    slope: ['SLOPE', 'games/slope.html', 'ARROW KEYS / A-D TO STEER · CLICK INSIDE TO FOCUS IT'],
    slowroads: ['SLOW ROADS', 'https://kongstudioserver.github.io/slowz/'],
    '1v1lol': ['1V1.LOL', 'https://gorillazlol.duckdns.org/gamefile/1v1.html'],
    madalin: ['MADALIN STUNT CARS 3', 'games/madalin.html', 'WEBGL BUILD · CLICK INSIDE TO FOCUS IT'],
    fnaf1: ['FNAF 1', 'https://gorillazlol.duckdns.org/games/fnaf/index.html'],
    celeste: ['CELESTE', 'https://gorillazlol.duckdns.org/games/celeste/index.html'],
    ppg: ['PEOPLE PLAYGROUND', 'https://gorillazlol.duckdns.org/games/ppg/index.html'],
    tof2: ['TANKS OF FREEDOM 2', 'https://w84death.github.io/tanks-of-freedom-ii/', 'WASD / ARROWS TO MOVE · CLICK INSIDE TO FOCUS IT'],
    goosegame: ['UNTITLED GOOSE GAME', 'https://gorillazlol.duckdns.org/games/UntitledGooseGameBog/index.html'],
    superhot: ['SUPERHOT', 'superhot/index.html', 'TIME MOVES WHEN YOU MOVE · WASD + MOUSE · CLICK INSIDE TO FOCUS IT']
  };
  function openGame(id){
    showView('game');
    gameMount.innerHTML = '';
    hideOverlay();
    const g = GAMES[id];
    if(!g) return;
    activeGame = startEmbed(g[0], g[1], g[2]);
  }
  function closeGame(){
    if(activeGame && activeGame.cleanup) activeGame.cleanup();
    activeGame = null;
    hideOverlay();
    showView('hall');
  }
  backBtn.addEventListener('click', closeGame);
  overlayRestart.addEventListener('click', () => { if(activeGame && activeGame.restart) activeGame.restart(); });
  const THEME_KEY = 'murdoc-theme';
  const VALID_THEMES = ['neon', 'green', 'blue', 'yellow'];
  function applyTheme(name){
    if(!VALID_THEMES.includes(name)) name = 'neon';
    document.documentElement.setAttribute('data-theme', name);
    document.querySelectorAll('.theme-swatch').forEach(sw=>{
      sw.classList.toggle('active', sw.dataset.setTheme === name);
    });
    try { localStorage.setItem(THEME_KEY, name); } catch(e){}
  }
  let savedTheme = 'neon';
  try { savedTheme = localStorage.getItem(THEME_KEY) || 'neon'; } catch(e){}
  applyTheme(savedTheme);
  document.querySelectorAll('.theme-swatch').forEach(sw=>{
    sw.addEventListener('click', ()=> applyTheme(sw.dataset.setTheme));
  });
  const fullscreenSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled);
  if(!fullscreenSupported) fullscreenBtn.style.display = 'none';
  fullscreenBtn.addEventListener('click', () => {
    const frame = gameMount.querySelector('iframe');
    if(!frame) return;
    if(frame.requestFullscreen) frame.requestFullscreen().catch(()=>{});
    else if(frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
  });
  hall.querySelectorAll('.cab').forEach(cab=>{
    cab.addEventListener('click', ()=>{
      if(cab.classList.contains('disabled')) return;
      openGame(cab.dataset.game);
    });
  });
  function startEmbed(title, url, hint){
    gameTitle.textContent = title;
    controlsHint.textContent = hint || 'CONTROLS ARE SET BY THE GAME · CLICK INSIDE TO FOCUS IT';
    gameHud.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.className = 'embed-frame';
    iframe.src = url;
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'fullscreen; gamepad; pointer-lock');
    gameMount.appendChild(iframe);
    return { restart: ()=>{ iframe.src = url; }, cleanup: ()=>{} };
  }
  const gamepadBadge = document.getElementById('gamepad-badge');
  let gpFocusIndex = 0;
  let gpPrevButtons = {};
  let gpAxisReleased = {};
  let gpConnectedCount = 0;
  window.addEventListener('gamepadconnected', ()=>{
    gpConnectedCount++;
    gamepadBadge.classList.add('show');
    gpFocusIndex = 0;
    updateGamepadFocusVisual();
  });
  window.addEventListener('gamepaddisconnected', ()=>{
    gpConnectedCount = Math.max(0, gpConnectedCount - 1);
    if(gpConnectedCount === 0){
      gamepadBadge.classList.remove('show');
      clearGamepadFocusVisual();
    }
  });
  function currentViewName(){
    if(views.menu.classList.contains('active')) return 'menu';
    if(views.hall.classList.contains('active')) return 'hall';
    if(views.utilities.classList.contains('active')) return 'utilities';
    if(views.game.classList.contains('active')) return 'game';
    return null;
  }
  function getFocusableItems(){
    const view = currentViewName();
    if(view === 'menu') return Array.from(document.querySelectorAll('#main-menu .menu-card'));
    if(view === 'hall') return Array.from(hall.querySelectorAll('.cab'));
    return [];
  }
  function clearGamepadFocusVisual(){
    document.querySelectorAll('.gp-focus').forEach(el => el.classList.remove('gp-focus'));
  }
  function updateGamepadFocusVisual(){
    clearGamepadFocusVisual();
    const items = getFocusableItems();
    if(!items.length) return;
    if(gpFocusIndex >= items.length) gpFocusIndex = items.length - 1;
    if(gpFocusIndex < 0) gpFocusIndex = 0;
    const el = items[gpFocusIndex];
    el.classList.add('gp-focus');
    el.scrollIntoView({ block:'nearest', behavior:'smooth' });
  }
  function gpOnViewChange(){
    gpFocusIndex = 0;
    if(gpConnectedCount > 0) updateGamepadFocusVisual();
    else clearGamepadFocusVisual();
  }
  function moveFocus(delta){
    const items = getFocusableItems();
    if(!items.length) return;
    gpFocusIndex = (gpFocusIndex + delta + items.length) % items.length;
    updateGamepadFocusVisual();
  }
  function confirmFocus(){
    const view = currentViewName();
    if(view === 'game'){
      if(overlay.classList.contains('show')) overlayRestart.click();
      return;
    }
    const items = getFocusableItems();
    if(!items.length) return;
    const el = items[gpFocusIndex];
    if(el && !el.classList.contains('disabled')) el.click();
  }
  function backAction(){
    const view = currentViewName();
    if(view === 'game') closeGame();
    else if(view === 'hall' || view === 'utilities') showView('menu');
  }
  function pollGamepads(){
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for(let i = 0; i < pads.length; i++){
      const pad = pads[i];
      if(!pad) continue;
      if(!gpConnectedCount){
        gpConnectedCount = 1;
        gamepadBadge.classList.add('show');
        updateGamepadFocusVisual();
      }
      const prev = gpPrevButtons[i] || [];
      const buttons = pad.buttons.map(b => b.pressed);
      const pressedEdge = (idx) => buttons[idx] && !prev[idx];
      if(pressedEdge(0)) confirmFocus();
      if(pressedEdge(1)) backAction();
      if(pressedEdge(12) || pressedEdge(14)) moveFocus(-1);
      if(pressedEdge(13) || pressedEdge(15)) moveFocus(1);
      const axisY = pad.axes[1] || 0;
      const axisX = pad.axes[0] || 0;
      const released = gpAxisReleased[i] !== false;
      if(Math.abs(axisY) > 0.5 || Math.abs(axisX) > 0.5){
        if(released){
          if(axisY < -0.5 || axisX < -0.5) moveFocus(-1);
          else moveFocus(1);
          gpAxisReleased[i] = false;
        }
      } else {
        gpAxisReleased[i] = true;
      }
      gpPrevButtons[i] = buttons;
    }
    requestAnimationFrame(pollGamepads);
  }
  requestAnimationFrame(pollGamepads);
})();
