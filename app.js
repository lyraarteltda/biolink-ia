/**
 * Link na Bio IA — construtor de página de links (link-in-bio).
 *
 * Núcleo 100% client-side: monta e RENDERIZA uma página HTML autossuficiente
 * (o artefato), com prévia ao vivo num celular. A IA (BYOK, opcional) só escreve
 * a cópia (título/bio/rótulos). Nada é enviado ao nosso backend — a chave do
 * membro fica no localStorage e fala direto com o provedor de IA dele.
 *
 * Globais disponíveis:
 *   window.ApiKeyManager  — getActiveKey()/getModel()/renderModelPicker()
 *   window.MembershipGate — getSession()
 */

const App = (function () {
  'use strict';

  // ---- state --------------------------------------------------------------
  var state = {
    profile: { name: '', handle: '', avatar: '', bio: '' },
    theme: 'meianoite',
    accent: '#ff4d5e',
    links: []
  };
  var LS_KEY = 'biolink-ia_page_v1';
  var uid = 0;
  var wired = false;

  // ---- icon library (inline SVG, 24x24, currentColor) ---------------------
  var ICONS = {
    link:      '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/>',
    whatsapp:  '<path d="M20.5 3.5A11 11 0 0 0 3.2 17L2 22l5.2-1.2A11 11 0 1 0 20.5 3.5z"/><path d="M8.5 8.7c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.3.5.9 1.3 1.7 1.8.8.5 1 .5 1.3.4.2-.1.5-.5.7-.8.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4 0 .5-.2 1.3-.6 1.5-.4.3-1 .5-1.7.4-1.2-.2-2.9-.9-4.4-2.4S8.6 11.3 8.3 10c-.1-.6 0-1 .2-1.3z" fill="currentColor" stroke="none"/>',
    youtube:   '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/>',
    tiktok:    '<path d="M15 4c.4 2.3 1.8 3.7 4 4v3c-1.5 0-2.9-.5-4-1.3V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.6 2.3V4z"/>',
    x:         '<path d="M4 4l16 16M20 4L4 20"/>',
    twitter:   '<path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.6.8-2.5 1a3.9 3.9 0 0 0-6.7 3.6A11 11 0 0 1 4 4.9a3.9 3.9 0 0 0 1.2 5.2c-.6 0-1.2-.2-1.7-.5a3.9 3.9 0 0 0 3.1 3.9c-.5.1-1.1.2-1.7.1a3.9 3.9 0 0 0 3.7 2.7A7.9 7.9 0 0 1 3 18.1 11 11 0 0 0 20 8.7c.8-.6 1.5-1.3 2-2.1z" fill="currentColor" stroke="none"/>',
    facebook:  '<path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.4C11.9 3 11 4.4 11 6.6v1.9H9V11h2v10h3V11h2.2l.4-2.5z" fill="currentColor" stroke="none"/>',
    linkedin:  '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" stroke-width="2"/>',
    telegram:  '<path d="M21 4L3 11l5 2 2 6 3-4 5 4z" fill="currentColor" stroke="none"/>',
    spotify:   '<circle cx="12" cy="12" r="9"/><path d="M8 10c2.5-.7 5.5-.4 7.5 1M8.5 13c2-.5 4-.2 5.5.8M9 15.7c1.5-.3 3-.1 4 .6"/>',
    site:      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/>',
    email:     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
    phone:     '<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 14l2 5v0a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    location:  '<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    cart:      '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L21 8H6"/>',
    pix:       '<path d="M12 3l4 4-4 4-4-4z"/><path d="M3 12l4-4 4 4-4 4z"/><path d="M21 12l-4-4-4 4 4 4z"/><path d="M12 21l-4-4 4-4 4 4z"/>',
    calendar:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    star:      '<path d="M12 3l2.6 6.3L21 10l-5 4.3L17.4 21 12 17.4 6.6 21 8 14.3 3 10l6.4-.7z"/>'
  };
  var ICON_KEYS = Object.keys(ICONS);
  function iconSvg(key, size) {
    var body = ICONS[key] || ICONS.link;
    var s = size || 24;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  // ---- themes for the GENERATED page (chrome-vs-artifact: clean, system fonts) ----
  var THEMES = {
    meianoite: { name: 'Meia-noite', bg: '#0e0f14', card: '#1a1c24', text: '#f4f4f6', sub: '#a6a8b3', border: 'rgba(255,255,255,.10)', btnText: '#0e0f14', preview: 'linear-gradient(160deg,#0e0f14,#1a1c24)' },
    neve:      { name: 'Neve',       bg: '#f6f7f9', card: '#ffffff', text: '#16181d', sub: '#5b616e', border: 'rgba(0,0,0,.09)',    btnText: '#ffffff', preview: 'linear-gradient(160deg,#ffffff,#eef0f4)' },
    marquise:  { name: 'Marquise',   bg: '#120f17', card: '#1d1926', text: '#f7f1e6', sub: '#b6a9c2', border: 'rgba(255,207,107,.22)', btnText: '#120f17', preview: 'linear-gradient(160deg,#120f17,#2a2136)' },
    creme:     { name: 'Creme',      bg: '#f4efe4', card: '#fffdf7', text: '#2a2216', sub: '#7a6f5c', border: 'rgba(0,0,0,.08)',    btnText: '#fffdf7', preview: 'linear-gradient(160deg,#f7f2e8,#eadfca)' },
    oceano:    { name: 'Oceano',     bg: '#071a2b', card: '#0e2c45', text: '#eaf4fb', sub: '#9db8ca', border: 'rgba(255,255,255,.10)', btnText: '#071a2b', preview: 'linear-gradient(160deg,#071a2b,#0e2c45)' },
    aurora:    { name: 'Aurora',     bg: 'radial-gradient(120% 90% at 50% 0%, #2a1550, #0b0716)', card: 'rgba(255,255,255,.08)', text: '#f3eefb', sub: '#c3b6dd', border: 'rgba(255,255,255,.14)', btnText: '#160c2b', preview: 'linear-gradient(160deg,#2a1550,#0b0716)', glass: true }
  };
  var THEME_KEYS = Object.keys(THEMES);

  var ACCENTS = ['#ff4d5e', '#ffcf6b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // ---- helpers ------------------------------------------------------------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function cleanField(v) {
    var s = String(v == null ? '' : v).trim();
    if (/^(null|undefined|n\/a|na|-|—)$/i.test(s)) return '';
    return s;
  }
  function safeUrl(u) {
    var s = cleanField(u);
    if (!s) return '';
    if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
    if (/^[\w.-]+@[\w.-]+\.\w+$/.test(s)) return 'mailto:' + s;   // bare email
    if (/^\+?\d[\d\s()-]{6,}$/.test(s)) return 'tel:' + s.replace(/[^\d+]/g, ''); // bare phone
    if (/^javascript:|^data:/i.test(s)) return '';                 // never
    return 'https://' + s.replace(/^\/+/, '');                     // assume web
  }
  function initials(name) {
    var parts = cleanField(name).split(/\s+/).filter(Boolean);
    if (!parts.length) return '★';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function isEmoji(s) { return /\p{Extended_Pictographic}/u.test(s || ''); }

  function toast(msg, isErr) {
    var t = $('toast'); if (!t) return;
    t.textContent = msg; t.className = isErr ? 'err show' : 'show';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = t.className.replace('show', '').trim(); }, 2600);
  }

  // ---- persistence --------------------------------------------------------
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function load() {
    try { var raw = localStorage.getItem(LS_KEY); if (raw) { var d = JSON.parse(raw); if (d && d.profile) state = d; } } catch (e) {}
  }

  function newLink(partial) {
    return Object.assign({ id: 'l' + (++uid), label: '', url: '', icon: 'link', highlighted: false, description: '' }, partial || {});
  }

  function seedIfEmpty() {
    if (state.links && state.links.length) return;
    state.profile.name = state.profile.name || 'Seu nome ou marca';
    state.profile.bio = state.profile.bio || 'O que você faz, em uma linha.';
    state.links = [
      newLink({ label: 'Instagram', icon: 'instagram', url: '', highlighted: true }),
      newLink({ label: 'WhatsApp', icon: 'whatsapp', url: '' }),
      newLink({ label: 'Meu site', icon: 'site', url: '' })
    ];
  }

  // ========================================================================
  //  RENDER: the generated bio page (the artifact) — returned as full HTML
  // ========================================================================
  function buildPageHTML() {
    var t = THEMES[state.theme] || THEMES.meianoite;
    var accent = state.accent || '#ff4d5e';
    var p = state.profile;
    var name = esc(cleanField(p.name) || 'Sua página');
    var handle = cleanField(p.handle).replace(/^@+/, '');
    var bio = esc(cleanField(p.bio));
    var av = cleanField(p.avatar);

    // avatar
    var avatarHtml;
    if (/^https?:\/\//i.test(av)) {
      avatarHtml = '<img class="avatar" src="' + esc(av) + '" alt="' + name + '" referrerpolicy="no-referrer">';
    } else if (isEmoji(av)) {
      avatarHtml = '<div class="avatar avatar-emoji">' + esc(av) + '</div>';
    } else {
      var ini = av ? esc(av.slice(0, 2).toUpperCase()) : esc(initials(p.name));
      avatarHtml = '<div class="avatar avatar-ini">' + ini + '</div>';
    }

    var linksHtml = (state.links || []).map(function (l) {
      var url = safeUrl(l.url);
      var href = url ? ' href="' + esc(url) + '"' : ''; // sem URL: <a> inerte (sem script inline p/ não quebrar o sandbox da prévia)
      var rel = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      var label = esc(cleanField(l.label) || 'Link');
      var desc = esc(cleanField(l.description));
      var cls = 'btn' + (l.highlighted ? ' btn-feat' : '');
      return '<a class="' + cls + '"' + href + rel + '>' +
        '<span class="btn-ic">' + iconSvg(l.icon, 21) + '</span>' +
        '<span class="btn-tx"><span class="btn-lb">' + label + '</span>' +
        (desc ? '<span class="btn-ds">' + desc + '</span>' : '') + '</span>' +
        '<span class="btn-ar" aria-hidden="true">→</span></a>';
    }).join('\n      ');

    var glassCard = t.glass ? 'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' : '';

    var css =
      ':root{--ac:' + accent + '}' +
      '*{box-sizing:border-box;margin:0}' +
      'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:' + t.bg + ';color:' + t.text + ';min-height:100vh;padding:36px 18px 48px;-webkit-font-smoothing:antialiased}' +
      '.wrap{max-width:520px;margin:0 auto;text-align:center}' +
      '.avatar{width:92px;height:92px;border-radius:50%;margin:0 auto 16px;display:grid;place-items:center;object-fit:cover;border:3px solid var(--ac);box-shadow:0 6px 22px rgba(0,0,0,.28);font-weight:700}' +
      '.avatar-ini{background:var(--ac);color:' + t.btnText + ';font-size:32px;letter-spacing:.5px}' +
      '.avatar-emoji{background:' + t.card + ';font-size:44px;border-color:' + t.border + '}' +
      '.name{font-size:22px;font-weight:800;letter-spacing:-.2px}' +
      '.handle{font-size:14px;color:var(--ac);font-weight:600;margin-top:3px}' +
      '.bio{font-size:14.5px;color:' + t.sub + ';margin:12px auto 0;max-width:420px;line-height:1.55}' +
      '.links{display:flex;flex-direction:column;gap:13px;margin-top:26px}' +
      '.btn{display:flex;align-items:center;gap:13px;text-decoration:none;color:' + t.text + ';background:' + t.card + ';border:1px solid ' + t.border + ';border-radius:15px;padding:15px 16px;' + glassCard + 'transition:transform .12s ease,box-shadow .12s ease;box-shadow:0 2px 10px rgba(0,0,0,.10)}' +
      '.btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.16)}' +
      '.btn-feat{background:var(--ac);color:' + t.btnText + ';border-color:transparent}' +
      '.btn-feat .btn-ds{color:' + t.btnText + ';opacity:.82}' +
      '.btn-ic{flex:0 0 24px;display:grid;place-items:center}' +
      '.btn-tx{flex:1;text-align:left;display:flex;flex-direction:column;gap:2px;min-width:0}' +
      '.btn-lb{font-weight:700;font-size:15px}' +
      '.btn-ds{font-size:12px;color:' + t.sub + '}' +
      '.btn-ar{opacity:.5;font-size:16px}' +
      '.ft{margin-top:32px;font-size:11.5px;color:' + t.sub + ';opacity:.7}' +
      '.ft a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor}' +
      '@media(max-width:420px){.name{font-size:20px}}';

    var footer = '<div class="ft">feito com <a href="https://comunidade.maestrosdaia.com" target="_blank" rel="noopener noreferrer">Maestros da IA</a></div>';

    return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + name + (handle ? ' (@' + esc(handle) + ')' : '') + '</title>\n' +
      '<meta name="description" content="' + (bio || name) + '">\n' +
      '<style>\n' + css + '\n</style>\n</head>\n<body>\n' +
      '  <main class="wrap">\n    ' + avatarHtml + '\n' +
      '    <h1 class="name">' + name + '</h1>\n' +
      (handle ? '    <div class="handle">@' + esc(handle) + '</div>\n' : '') +
      (bio ? '    <p class="bio">' + bio + '</p>\n' : '') +
      '    <nav class="links">\n      ' + (linksHtml || '') + '\n    </nav>\n' +
      '    ' + footer + '\n  </main>\n</body>\n</html>';
  }

  function renderPreview() {
    var frame = $('preview-frame');
    if (frame) frame.srcdoc = buildPageHTML();
    var count = (state.links || []).length;
    var pc = $('preview-count'); if (pc) pc.textContent = count + (count === 1 ? ' link' : ' links');
  }

  // ========================================================================
  //  RENDER: the editor UI (left rail)
  // ========================================================================
  function renderThemes() {
    var grid = $('theme-grid'); if (!grid) return;
    grid.innerHTML = '';
    THEME_KEYS.forEach(function (k) {
      var t = THEMES[k];
      var chip = document.createElement('div');
      chip.className = 'theme-chip' + (state.theme === k ? ' on' : '');
      chip.innerHTML = '<div class="theme-swatch" style="background:' + t.preview + '"></div><div class="theme-name">' + t.name + '</div>';
      chip.addEventListener('click', function () { state.theme = k; renderThemes(); renderPreview(); save(); });
      grid.appendChild(chip);
    });
  }

  function renderAccents() {
    var wrap = $('accent-swatches'); if (!wrap) return;
    wrap.innerHTML = '';
    ACCENTS.forEach(function (c) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'accent-dot' + (state.accent.toLowerCase() === c.toLowerCase() ? ' on' : '');
      d.style.background = c;
      d.title = c;
      d.addEventListener('click', function () { state.accent = c; var cc = $('accent-custom'); if (cc) cc.value = c; renderAccents(); renderPreview(); save(); });
      wrap.appendChild(d);
    });
  }

  function renderLinks() {
    var list = $('links-list'); if (!list) return;
    list.innerHTML = '';
    state.links.forEach(function (l, idx) {
      var card = document.createElement('div');
      card.className = 'link-card' + (l.highlighted ? ' highlighted' : '');

      var top = document.createElement('div');
      top.className = 'link-top';

      var iconBtn = document.createElement('button');
      iconBtn.type = 'button'; iconBtn.className = 'link-icon-pick'; iconBtn.title = 'Trocar ícone';
      iconBtn.innerHTML = iconSvg(l.icon, 22);

      var grow = document.createElement('div'); grow.className = 'link-grow';
      var lbl = document.createElement('input');
      lbl.type = 'text'; lbl.className = 'input'; lbl.placeholder = 'Rótulo (ex.: Instagram)'; lbl.value = l.label || ''; lbl.maxLength = 40;
      lbl.addEventListener('input', function () { l.label = lbl.value; renderPreview(); save(); });
      var url = document.createElement('input');
      url.type = 'text'; url.className = 'input mono'; url.placeholder = 'URL, @usuario, e-mail ou telefone'; url.value = l.url || '';
      url.addEventListener('input', function () { l.url = url.value; renderPreview(); save(); });
      grow.appendChild(lbl); grow.appendChild(url);

      var actions = document.createElement('div'); actions.className = 'link-actions';
      var up = mkIcon('M12 5l-6 6h12z', 'Subir'); up.addEventListener('click', function () { move(idx, -1); });
      var dn = mkIcon('M12 19l6-6H6z', 'Descer'); dn.addEventListener('click', function () { move(idx, 1); });
      var del = mkIcon('M6 6l12 12M18 6L6 18', 'Remover', true); del.addEventListener('click', function () { state.links.splice(idx, 1); renderLinks(); renderPreview(); save(); });
      actions.appendChild(up); actions.appendChild(dn); actions.appendChild(del);

      top.appendChild(iconBtn); top.appendChild(grow); top.appendChild(actions);
      card.appendChild(top);

      // meta row: highlight toggle + description
      var meta = document.createElement('div'); meta.className = 'link-meta';
      var tog = document.createElement('label'); tog.className = 'mini-toggle';
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!l.highlighted;
      cb.addEventListener('change', function () { l.highlighted = cb.checked; renderLinks(); renderPreview(); save(); });
      tog.appendChild(cb); tog.appendChild(document.createTextNode('Destacar'));
      var desc = document.createElement('input');
      desc.type = 'text'; desc.className = 'input'; desc.placeholder = 'Descrição curta (opcional)'; desc.value = l.description || ''; desc.maxLength = 60;
      desc.style.flex = '1'; desc.style.minWidth = '140px';
      desc.addEventListener('input', function () { l.description = desc.value; renderPreview(); save(); });
      meta.appendChild(tog); meta.appendChild(desc);
      card.appendChild(meta);

      // icon menu (toggle)
      var menu = document.createElement('div'); menu.className = 'icon-menu'; menu.hidden = true;
      ICON_KEYS.forEach(function (k) {
        var b = document.createElement('button'); b.type = 'button'; b.title = k; b.innerHTML = iconSvg(k, 20);
        b.addEventListener('click', function () { l.icon = k; iconBtn.innerHTML = iconSvg(k, 22); menu.hidden = true; renderPreview(); save(); });
        menu.appendChild(b);
      });
      iconBtn.addEventListener('click', function () { menu.hidden = !menu.hidden; });
      card.appendChild(menu);

      list.appendChild(card);
    });
  }

  function mkIcon(path, title, danger) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'icon-btn-sm' + (danger ? ' danger' : ''); b.title = title;
    b.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
    return b;
  }

  function move(idx, dir) {
    var j = idx + dir;
    if (j < 0 || j >= state.links.length) return;
    var tmp = state.links[idx]; state.links[idx] = state.links[j]; state.links[j] = tmp;
    renderLinks(); renderPreview(); save();
  }

  function syncProfileInputs() {
    if ($('p-name')) $('p-name').value = state.profile.name || '';
    if ($('p-handle')) $('p-handle').value = state.profile.handle || '';
    if ($('p-avatar')) $('p-avatar').value = state.profile.avatar || '';
    if ($('p-bio')) { $('p-bio').value = state.profile.bio || ''; updateBioChar(); }
    if ($('accent-custom')) $('accent-custom').value = /^#/.test(state.accent) ? state.accent : '#ff4d5e';
  }
  function updateBioChar() {
    var el = $('p-bio-char'); if (!el) return;
    var n = (state.profile.bio || '').length;
    el.textContent = n + '/160'; el.className = 'char' + (n > 160 ? ' over' : '');
  }

  function renderAll() { renderThemes(); renderAccents(); renderLinks(); renderPreview(); }

  // ========================================================================
  //  AI (BYOK, optional) — write copy
  // ========================================================================
  function fetchContent(messages, active, temperature, maxTokens, noReasoning) {
    var model = ApiKeyManager.getModel();
    var url, headers, body;
    if (active.service === 'openrouter') {
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + active.key, 'HTTP-Referer': 'https://biolinkia.maestrosdaia.com', 'X-Title': 'Link na Bio IA' };
      body = { model: model, messages: messages, temperature: temperature, max_tokens: maxTokens };
      var isDeepSeek = model.indexOf('deepseek/') === 0;
      if (!noReasoning && !isDeepSeek) body.reasoning = { effort: 'low' };
    } else { // openai native
      var oaModel = model.indexOf('openai/') === 0 ? model.slice(7) : 'gpt-5-mini';
      url = 'https://api.openai.com/v1/chat/completions';
      headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + active.key };
      body = { model: oaModel, messages: messages, temperature: temperature, max_tokens: maxTokens };
    }
    return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          var msg = (data && data.error && (data.error.message || data.error)) || ('HTTP ' + r.status);
          var e = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)); e.status = r.status; throw e;
        }
        var content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!content || !content.trim()) { var em = new Error('empty'); em.emptyContent = true; throw em; }
        return content;
      });
    });
  }

  function fetchResilient(messages, active, temperature, maxTokens) {
    return fetchContent(messages, active, temperature, maxTokens, false).catch(function (e) {
      if (e && e.emptyContent && active.service === 'openrouter') return fetchContent(messages, active, temperature, maxTokens, true);
      throw e;
    });
  }

  function parseJSON(text) {
    if (!text) throw new Error('vazio');
    var s = String(text).replace(/^﻿/, '').trim();
    s = s.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    var a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
    // ladder
    try { return JSON.parse(s); } catch (e) {}
    try { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); } catch (e) {}
    var repaired = s.replace(/[\x00-\x1f]+/g, ' ').replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(repaired);
  }

  function aiGenerate() {
    var active = ApiKeyManager.getActiveKey();
    var note = $('ai-note');
    if (!active) {
      if (note) { note.textContent = 'Configure uma chave de IA (ícone da chave no topo) para usar este recurso.'; note.className = 'ai-note err'; }
      toast('Sem chave de IA — configure no ícone da chave', true);
      return;
    }
    var brief = ($('ai-brief') ? $('ai-brief').value : '').trim();
    if (!brief) { if (note) { note.textContent = 'Escreva uma frase sobre o seu negócio primeiro.'; note.className = 'ai-note err'; } return; }

    var btn = $('ai-generate');
    btn.disabled = true; var old = btn.textContent; btn.textContent = 'Escrevendo...';
    if (note) { note.textContent = 'A IA está escrevendo sua página...'; note.className = 'ai-note'; }

    var iconList = ICON_KEYS.join(', ');
    var sys = 'Você é um redator de bio de creators brasileiros. Responda SEMPRE em português do Brasil, com naturalidade e sem exageros. Devolve APENAS um objeto JSON válido, sem markdown, com aspas normais.';
    var usr = 'Negócio: "' + brief + '".\n' +
      'Crie o conteúdo de uma página de "link na bio". Devolva um JSON com EXATAMENTE este formato:\n' +
      '{"name": "nome curto de exibição (marca ou pessoa)", "handle": "arroba sugerido sem @ (opcional, pode ser vazio)", "bio": "uma frase de até 150 caracteres, calorosa e clara", "links": [{"label":"rótulo curto","icon":"UMA das opções","description":"3-5 palavras (opcional)","highlighted":true/false}]}\n' +
      'Regras: 4 a 6 links úteis e coerentes com o negócio (ex.: Instagram, WhatsApp, site/loja, YouTube/TikTok, e-mail). NÃO invente URLs — deixe o membro preencher. "icon" DEVE ser uma destas: ' + iconList + '. Marque highlighted:true apenas no link mais importante (1). Sem emojis no name/bio.';

    fetchResilient([{ role: 'system', content: sys }, { role: 'user', content: usr }], active, 0.7, 4000)
      .then(function (txt) { return parseJSON(txt); })
      .catch(function () {
        // reroll once, stricter + lower temp
        return fetchResilient([
          { role: 'system', content: sys },
          { role: 'user', content: usr },
          { role: 'user', content: 'Sua resposta anterior NÃO era um JSON válido. Responda novamente APENAS com o objeto JSON pedido, aspas normais, sem markdown, sem texto fora do JSON.' }
        ], active, 0.4, 4000).then(function (txt) { return parseJSON(txt); });
      })
      .then(function (data) { applyAI(data); if (note) { note.textContent = 'Pronto! Ajuste o que quiser e preencha os links.'; note.className = 'ai-note'; } toast('Conteúdo criado pela IA'); })
      .catch(function (err) {
        var m = (err && err.message) || 'Falha';
        if (/invalid|unauthor|401/i.test(m)) m = 'Chave inválida — confira no ícone da chave.';
        else if (/quota|billing|credit|402|429/i.test(m)) m = 'Sua conta de IA está sem créditos/limite atingido.';
        else m = 'Não consegui gerar agora. Tente de novo.';
        if (note) { note.textContent = m; note.className = 'ai-note err'; }
        toast(m, true);
      })
      .then(function () { btn.disabled = false; btn.textContent = old; });
  }

  function applyAI(data) {
    if (!data || typeof data !== 'object') return;
    if (cleanField(data.name)) state.profile.name = cleanField(data.name);
    var h = cleanField(data.handle).replace(/^@+/, ''); if (h) state.profile.handle = h;
    if (cleanField(data.bio)) state.profile.bio = cleanField(data.bio).slice(0, 160);
    if (Array.isArray(data.links) && data.links.length) {
      state.links = data.links.slice(0, 8).map(function (x) {
        var icon = cleanField(x.icon).toLowerCase();
        if (ICON_KEYS.indexOf(icon) < 0) icon = guessIcon(x.label);
        return newLink({ label: cleanField(x.label) || 'Link', icon: icon, highlighted: !!x.highlighted, description: cleanField(x.description) });
      });
    }
    syncProfileInputs(); renderAll(); save();
  }

  function guessIcon(label) {
    var s = (label || '').toLowerCase();
    if (/insta/.test(s)) return 'instagram';
    if (/whats|zap/.test(s)) return 'whatsapp';
    if (/tiktok/.test(s)) return 'tiktok';
    if (/you ?tube|canal/.test(s)) return 'youtube';
    if (/face/.test(s)) return 'facebook';
    if (/linkedin/.test(s)) return 'linkedin';
    if (/telegram/.test(s)) return 'telegram';
    if (/spotify|podcast/.test(s)) return 'spotify';
    if (/mail|e-?mail|contato/.test(s)) return 'email';
    if (/loja|shop|store|compr|carrinho|catálogo|catalogo/.test(s)) return 'cart';
    if (/pix|pagar|pagamento/.test(s)) return 'pix';
    if (/tel|fone|liga/.test(s)) return 'phone';
    if (/local|endereç|endereco|mapa/.test(s)) return 'location';
    if (/site|web|portf/.test(s)) return 'site';
    if (/agenda|marcar|hor[aá]rio|calend/.test(s)) return 'calendar';
    if (/x|twitter/.test(s)) return 'x';
    return 'link';
  }

  // ========================================================================
  //  EXPORT
  // ========================================================================
  function fileName() {
    var n = cleanField(state.profile.handle) || cleanField(state.profile.name) || 'link-na-bio';
    n = n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (n || 'link-na-bio') + '.html';
  }
  function exportDownload() {
    var html = buildPageHTML();
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'index.html';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
    toast('Baixado: index.html');
  }
  function exportCopy() {
    var html = buildPageHTML();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(html).then(function () { toast('HTML copiado'); }, function () { fallbackCopy(html); });
    } else { fallbackCopy(html); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('HTML copiado'); } catch (e) { toast('Não consegui copiar', true); }
    ta.remove();
  }
  function exportOpen() {
    var html = buildPageHTML();
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var w = window.open(url, '_blank');
    if (!w) toast('Permita pop-ups para abrir a prévia', true);
    setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
  }

  // ========================================================================
  //  WIRE
  // ========================================================================
  function wire() {
    if (wired) return; wired = true;

    load(); seedIfEmpty();
    // session greeting into name if empty
    try { var s = MembershipGate.getSession(); if (s && !cleanField(state.profile.name)) { /* keep placeholder */ } } catch (e) {}

    syncProfileInputs();
    renderAll();

    if ($('model-select')) ApiKeyManager.renderModelPicker('model-select');

    bind('p-name', 'input', function (v) { state.profile.name = v; renderPreview(); save(); });
    bind('p-handle', 'input', function (v) { state.profile.handle = v; renderPreview(); save(); });
    bind('p-avatar', 'input', function (v) { state.profile.avatar = v; renderPreview(); save(); });
    bind('p-bio', 'input', function (v) { state.profile.bio = v; updateBioChar(); renderPreview(); save(); });

    var ac = $('accent-custom');
    if (ac) ac.addEventListener('input', function () { state.accent = ac.value; renderAccents(); renderPreview(); save(); });

    on('add-link', 'click', function () { state.links.push(newLink({ label: '', icon: 'link' })); renderLinks(); renderPreview(); save(); });
    on('ai-generate', 'click', aiGenerate);
    on('export-download', 'click', exportDownload);
    on('export-copy', 'click', exportCopy);
    on('export-open', 'click', exportOpen);
  }

  function bind(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, function () { fn(el.value); }); }
  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }

  function init() { wire(); }
  return { init: init };
})();

// ---- 3 init triggers (COR-008 + COR-044): event + DOMContentLoaded + observer ----
(function () {
  function go() { try { App.init(); } catch (e) { console.error(e); } }
  document.addEventListener('maestria:app-ready', go);
  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('app-screen');
    if (app && app.classList.contains('active')) go();
    var obs = new MutationObserver(function () {
      var a = document.getElementById('app-screen');
      if (a && a.classList.contains('active')) { go(); }
    });
    if (app) obs.observe(app, { attributes: true, attributeFilter: ['class'] });
  });
})();
