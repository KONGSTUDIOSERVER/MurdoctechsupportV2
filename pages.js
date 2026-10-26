(() => {
  const dialog = document.getElementById('ai-view');
  const open = document.getElementById('ai-open');
  open.addEventListener('click', () => {
    dialog.showModal();
    dialog.classList.add('active');
    open.setAttribute('aria-expanded', 'true');
    const input = document.getElementById('ai-input');
    if (!input.disabled) input.focus();
  });
  document.getElementById('ai-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.classList.remove('active');
    open.setAttribute('aria-expanded', 'false');
  });

  const arcade = document.getElementById('arcade');
  function addGeometryDash() {
    const doc = arcade.contentDocument;
    const hall = doc?.getElementById('hall');
    if (!hall || doc.getElementById('geometry-dash-card')) return;
    const menuStyle = doc.createElement('style');
    menuStyle.textContent = '#main-menu:not(.active){display:none}';
    doc.head.appendChild(menuStyle);
    const card = doc.createElement('button');
    card.id = 'geometry-dash-card';
    card.className = 'cab';
    card.type = 'button';
    card.dataset.game = 'geometrydash';
    card.innerHTML = `<div class="num">CABINET ${String(hall.children.length + 1).padStart(2, '0')}</div>
      <img class="cab-icon" src="games/geometry-dash/cover.jpeg" alt="Geometry Dash cover">
      <h3>GEOMETRY DASH</h3><div class="screen-strip"></div>`;
    hall.appendChild(card);
    const screen = doc.getElementById('arcade-screen');
    const mount = doc.getElementById('game-mount');
    card.addEventListener('click', () => {
      for (const id of ['main-menu', 'hall-view', 'utilities-view']) {
        doc.getElementById(id).classList.remove('active');
      }
      screen.classList.add('active');
      doc.getElementById('overlay').classList.remove('show');
      doc.getElementById('game-title').textContent = 'GEOMETRY DASH';
      doc.getElementById('game-hud').replaceChildren();
      doc.getElementById('controls-hint').textContent = 'CLICK START · SPACE / CLICK TO JUMP · CHROME OR EDGE REQUIRED · FIRST LOAD ABOUT 290 MB';
      const frame = doc.createElement('iframe');
      frame.id = 'geometry-dash-frame';
      frame.className = 'embed-frame';
      frame.title = 'Geometry Dash';
      frame.src = 'games/geometry-dash/';
      frame.allow = 'fullscreen; autoplay';
      frame.allowFullscreen = true;
      mount.replaceChildren(frame);
      screen.scrollIntoView({block: 'start'});
    });
    // Returning by mouse or gamepad unloads the game and stops its audio.
    new MutationObserver(() => {
      if (!screen.classList.contains('active')) doc.getElementById('geometry-dash-frame')?.remove();
    }).observe(screen, {attributes: true, attributeFilter: ['class']});
  }
  arcade.addEventListener('load', addGeometryDash);
  if (arcade.contentDocument?.readyState === 'complete') addGeometryDash();
})();
