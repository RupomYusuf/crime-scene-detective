/* Crime Scene Detective — client */
(function () {
  'use strict';

  var socket = io();
  var myName = localStorage.getItem('csd_name') || '';
  var room = null;          // current room state from server
  var amHost = false;
  var myId = null;
  var hintCooldownUntil = 0;
  var hintTimer = null;

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function show(screen) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $('screen-' + screen).classList.add('active');
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtClock(sec) {
    sec = Math.max(0, sec);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function appendChat(el, line, cls) {
    var div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.innerHTML = line;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    while (el.children.length > 120) el.removeChild(el.firstChild);
  }

  function toast(text, bad) {
    var box = $('toasts');
    var t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : '');
    t.innerHTML = text;
    box.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 3200);
    setTimeout(function () { t.remove(); }, 3700);
  }

  // ---------- home ----------
  $('name-input').value = myName;
  $('btn-create').addEventListener('click', function () {
    var name = $('name-input').value.trim();
    if (!name) return showHomeError('Enter a detective name first.');
    myName = name; localStorage.setItem('csd_name', name);
    socket.emit('createRoom', { name: name }, function (res) {
      if (!res.ok) showHomeError(res.error || 'Could not create room.');
    });
  });
  $('btn-join').addEventListener('click', function () {
    var name = $('name-input').value.trim();
    var code = $('join-code').value.trim().toUpperCase();
    if (!name) return showHomeError('Enter a detective name first.');
    if (code.length !== 4) return showHomeError('Room codes are 4 characters.');
    myName = name; localStorage.setItem('csd_name', name);
    socket.emit('joinRoom', { code: code, name: name }, function (res) {
      if (!res.ok) showHomeError(res.error || 'Could not join room.');
    });
  });
  $('join-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('btn-join').click(); });
  $('name-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('btn-create').click(); });
  function showHomeError(msg) { $('home-error').textContent = msg; }

  // personal stats from game history
  fetch('/api/history').then(function (r) { return r.json(); }).then(function (history) {
    if (!history.length) { $('home-stats').innerHTML = 'No cases on file yet. Create a room and start investigating.'; return; }
    var games = history.length;
    var wins = 0, plays = 0, fastest = null;
    history.forEach(function (g) {
      if (!g.scores || !g.scores.length) return;
      var me = g.scores.find(function (s) { return s.name === myName; });
      if (!me) return;
      plays++;
      if (g.scores[0].name === myName && g.scores[0].score > 0) wins++;
      g.timeline.forEach(function (t) {
        if (t.by === myName && (fastest === null || t.at < fastest)) fastest = t.at;
      });
    });
    $('home-stats').innerHTML = plays
      ? 'On file: <b>' + plays + '</b> cases played · <b>' + wins + '</b> wins (' + Math.round(wins / plays * 100) + '%)' +
        (fastest !== null ? ' · fastest find <b>' + (fastest / 1000).toFixed(1) + 's</b>' : '')
      : 'No cases on file under this name yet.';
  }).catch(function () {});

  // ---------- lobby ----------
  $('btn-copy-code').addEventListener('click', function () {
    if (!room) return;
    var code = room.code;
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    $('btn-copy-code').textContent = 'Copied!';
    setTimeout(function () { $('btn-copy-code').textContent = 'Copy'; }, 1500);
  });
  $('btn-leave-lobby').addEventListener('click', leaveRoom);
  $('btn-ready').addEventListener('click', function () { socket.emit('toggleReady'); });
  $('btn-start').addEventListener('click', function () {
    socket.emit('startGame', function (res) {
      if (!res.ok) toast(esc(res.error), true);
    });
  });

  // settings controls
  var setCount = $('set-count'), setDuration = $('set-duration'), setMultiplier = $('set-multiplier');
  setCount.addEventListener('input', function () { $('set-count-val').textContent = setCount.value; });
  setDuration.addEventListener('input', function () { $('set-duration-val').textContent = setDuration.value + ' min'; });
  setMultiplier.addEventListener('input', function () { $('set-multiplier-val').textContent = '×' + setMultiplier.value; });
  function pushSettings(extra) {
    if (!amHost || !room) return;
    socket.emit('updateSettings', Object.assign({
      scenarioId: $('set-scenario').value,
      elementCount: parseInt(setCount.value),
      durationMinutes: parseInt(setDuration.value),
      pointMultiplier: parseFloat(setMultiplier.value),
      hintsEnabled: $('set-hints').checked,
      wrongClickPenalty: $('set-wrongclicks').checked ? 5 : 0
    }, extra || {}));
  }
  ['set-count', 'set-duration', 'set-multiplier'].forEach(function (id) {
    $(id).addEventListener('change', function () { pushSettings(); });
  });
  $('set-scenario').addEventListener('change', function () { pushSettings(); });
  $('set-hints').addEventListener('change', function () { pushSettings(); });
  $('set-wrongclicks').addEventListener('change', function () { pushSettings(); });
  document.querySelectorAll('.preset-btns .chip').forEach(function (b) {
    b.addEventListener('click', function () { pushSettings({ preset: b.dataset.preset }); });
  });

  function renderLobby() {
    $('lobby-code').textContent = room.code;
    $('lobby-count').textContent = room.players.length + '/4';
    var list = $('player-list');
    list.innerHTML = '';
    room.players.forEach(function (p) {
      var li = document.createElement('li');
      li.className = p.ready ? 'ready' : '';
      li.innerHTML = '<span class="dot"></span><span class="p-name">' + esc(p.name) + '</span>' +
        (p.isHost ? '<span class="p-tag">Host</span>' : '') +
        '<span class="p-ready">' + (p.ready ? 'Ready' : 'Not ready') + '</span>';
      list.appendChild(li);
    });
    var me = room.players.find(function (p) { return p.id === myId; });
    amHost = !!(me && me.isHost);
    $('settings-readonly-tag').style.display = amHost ? 'none' : 'inline';
    lockSettings(!amHost);
    $('btn-start').classList.toggle('hidden', !amHost);
    $('btn-ready').classList.toggle('hidden', amHost && false);
    $('btn-ready').textContent = me && me.ready ? "I'm not ready" : 'Ready Up';
    $('btn-ready').classList.toggle('primary', !(me && me.ready));
    var allReady = room.players.length >= 2 && room.players.every(function (p) { return p.ready; });
    $('lobby-hint').textContent = room.players.length < 2
      ? 'Waiting for at least one more detective… share the room code!'
      : (allReady ? (amHost ? 'Everyone is ready. Start the investigation!' : 'Waiting for the host to start…') : 'Players must ready up before the host can start.');
    // reflect settings
    var s = room.settings;
    if (document.activeElement !== setCount) { setCount.value = s.elementCount; $('set-count-val').textContent = s.elementCount; }
    if (document.activeElement !== setDuration) { setDuration.value = s.durationMinutes; $('set-duration-val').textContent = s.durationMinutes + ' min'; }
    if (document.activeElement !== setMultiplier) { setMultiplier.value = s.pointMultiplier; $('set-multiplier-val').textContent = '×' + s.pointMultiplier; }
    $('set-scenario').value = s.scenarioId;
    $('set-hints').checked = s.hintsEnabled;
    $('set-wrongclicks').checked = s.wrongClickPenalty > 0;
  }
  function lockSettings(lock) {
    ['set-scenario', 'set-count', 'set-duration', 'set-multiplier', 'set-hints', 'set-wrongclicks'].forEach(function (id) { $(id).disabled = lock; });
    document.querySelectorAll('.preset-btns .chip').forEach(function (b) { b.disabled = lock; });
  }

  // populate scenario dropdown
  fetch('/api/scenarios').then(function (r) { return r.json(); }).then(function (list) {
    var sel = $('set-scenario');
    sel.innerHTML = '<option value="random">🎲 Random scenario</option>';
    list.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      sel.appendChild(o);
    });
  });

  // chat
  function bindChat(formId, inputId, logId) {
    $(formId).addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $(inputId).value.trim();
      if (!v) return;
      socket.emit('chat', { text: v });
      $(inputId).value = '';
    });
  }
  bindChat('lobby-chat-form', 'lobby-chat-input', 'lobby-chat');
  bindChat('game-chat-form', 'game-chat-input', 'game-log');

  // ---------- game ----------
  var clueEls = {};       // elementId -> DOM node

  socket.on('gameStarted', function (data) {
    room = data;
    clueEls = {};
    hintCooldownUntil = 0;
    $('game-scenario').textContent = Scenarios.get(data.scenarioId).name;
    $('game-log').innerHTML = '';
    show('game');
    renderScene(data.elements);
    renderScoreboard(room.players);
    $('remaining').textContent = room.settings.elementCount;
    startTimerLoop();
    updateHintBtn();
  });

  function renderScene(elements) {
    var svg = $('scene-svg');
    svg.innerHTML = Scenarios.decor[room.scenarioId] || Scenarios.decor.office;
    var layer = $('elements-layer');
    layer.innerHTML = '';
    $('found-layer').innerHTML = '';
    $('click-ripple-layer').innerHTML = '';
    elements.forEach(function (el) {
      var item = Scenarios.itemById[el.itemId];
      var btn = document.createElement('button');
      btn.className = 'clue';
      btn.style.left = el.x + '%';
      btn.style.top = el.y + '%';
      btn.title = '';
      btn.innerHTML = '<svg viewBox="0 0 24 24">' + item.icon + '</svg>';
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        socket.emit('clickElement', { elementId: el.id });
      });
      layer.appendChild(btn);
      clueEls[el.id] = btn;
    });
  }

  $('scene').addEventListener('click', function (ev) {
    if (ev.target.closest('.clue')) return;
    // clicked the scenery — register a wrong click
    var r = $('scene').getBoundingClientRect();
    var rip = document.createElement('div');
    rip.className = 'ripple';
    rip.style.left = (ev.clientX - r.left) + 'px';
    rip.style.top = (ev.clientY - r.top) + 'px';
    $('click-ripple-layer').appendChild(rip);
    setTimeout(function () { rip.remove(); }, 500);
    if (room && room.settings.wrongClickPenalty) socket.emit('wrongClick');
  });

  socket.on('elementFound', function (data) {
    var btn = clueEls[data.elementId];
    if (btn) {
      btn.classList.add('found', 'just-found');
      btn.style.opacity = '0.18';
      btn.style.filter = 'grayscale(1)';
      var tag = document.createElement('div');
      tag.className = 'found-tag';
      tag.style.left = btn.style.left;
      tag.style.top = btn.style.top;
      tag.innerHTML = '<b>' + esc(data.byName) + '</b> · ' + esc(data.name) + ' +' + data.points;
      $('found-layer').appendChild(tag);
    }
    $('remaining').textContent = data.remaining;
    renderScoreboard(data.scores);
    if (data.by === myId) {
      toast('You found the <b>' + esc(data.name) + '</b>! +' + data.points + ' pts');
    } else {
      toast('<b>' + esc(data.byName) + '</b> found the ' + esc(data.name) + '! ' + data.remaining + ' left');
    }
  });

  socket.on('wrongClickResult', function (data) {
    toast('Nothing there… −' + data.penalty + ' pts', true);
    var meEntry = document.querySelector('#game-scoreboard li.me .s-score');
    if (meEntry) meEntry.textContent = data.score;
  });

  // hints
  $('btn-hint').addEventListener('click', function () {
    socket.emit('useHint', function (res) {
      if (!res.ok) { toast(esc(res.error), true); return; }
    });
  });
  socket.on('hintResult', function (data) {
    hintCooldownUntil = Date.now() + data.cooldown * 1000;
    if (!hintTimer) hintTimer = setInterval(updateHintBtn, 500);
    var btn = clueEls[data.elementId];
    if (btn) {
      btn.classList.add('hinted');
      setTimeout(function () { btn.classList.remove('hinted'); }, 6000);
    }
    toast('Forensics marked a clue for you (−' + data.cost + ' pts). It fades in 6s!');
  });
  function updateHintBtn() {
    var left = Math.ceil((hintCooldownUntil - Date.now()) / 1000);
    var b = $('btn-hint');
    if (left > 0) {
      b.classList.add('cooldown');
      b.textContent = '💡 Cooldown ' + left + 's';
      b.disabled = true;
    } else {
      b.classList.remove('cooldown');
      var s = room && room.settings;
      if (s && !s.hintsEnabled) { b.textContent = '💡 Hints off'; b.disabled = true; }
      else { b.textContent = '💡 Hint (−' + (s ? s.hintCost : 15) + ')'; b.disabled = !s || !s.hintsEnabled; }
      clearInterval(hintTimer); hintTimer = null;
    }
  }
  updateHintBtn();

  // timer
  var timerInterval = null;
  function startTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      if (!room || !room.endsAt) return;
      var left = Math.ceil((room.endsAt - Date.now()) / 1000);
      $('timer').textContent = fmtClock(left);
      $('timer-box').classList.toggle('urgent', left <= 30);
    }, 500);
  }
  socket.on('timeLeft', function (sec) {
    $('timer').textContent = fmtClock(sec);
    $('timer-box').classList.toggle('urgent', sec <= 30);
  });

  function renderScoreboard(players) {
    var sorted = players.slice().sort(function (a, b) { return b.score - a.score || b.foundCount - a.foundCount; });
    var ul = $('game-scoreboard');
    ul.innerHTML = '';
    sorted.forEach(function (p, i) {
      var li = document.createElement('li');
      if (p.id === myId) li.className = 'me';
      li.innerHTML = '<span class="rank">' + (i + 1) + '</span><span class="s-name">' + esc(p.name) + '</span>' +
        '<span class="s-found">' + p.foundCount + ' found</span><span class="s-score">' + p.score + '</span>';
      ul.appendChild(li);
    });
  }

  $('btn-leave-game').addEventListener('click', leaveRoom);

  // logs & chat routing
  socket.on('log', function (line) {
    appendChat($('game-log'), esc(line.text), line.kind);
    appendChat($('lobby-chat'), esc(line.text), 'sys');
  });
  socket.on('chat', function (msg) {
    appendChat($('game-log'), '<b>' + esc(msg.name) + ':</b> ' + esc(msg.text));
    appendChat($('lobby-chat'), '<b>' + esc(msg.name) + ':</b> ' + esc(msg.text));
  });

  // ---------- results ----------
  socket.on('gameEnded', function (data) {
    room.state = 'ended';
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    show('results');
    var winner = data.scores[0];
    $('results-title').textContent = data.reason === 'cleared' ? 'Case Closed!' : 'Time\'s Up — Case Cold';
    $('results-sub').textContent = winner && winner.score > 0
      ? winner.name + ' cracked the case with ' + winner.score + ' points!'
      : 'Nobody found enough evidence this time.';
    var ul = $('results-scores');
    ul.innerHTML = '';
    data.scores.forEach(function (s, i) {
      var li = document.createElement('li');
      if (i === 0 && s.score > 0) li.className = 'winner';
      li.innerHTML = '<span class="rank">' + ['🥇', '🥈', '🥉', '4'][i] + '</span>' +
        '<span class="s-name">' + esc(s.name) + '</span>' +
        '<span class="s-found">' + s.found + ' clues · ' + s.hintsUsed + ' hints · ' + s.wrongClicks + ' misses</span>' +
        '<span class="s-score">' + s.score + '</span>';
      ul.appendChild(li);
    });
    var tl = $('results-timeline');
    tl.innerHTML = '';
    if (!data.timeline.length) {
      tl.innerHTML = '<li><span class="t-item muted">No evidence was recovered.</span></li>';
    }
    data.timeline.forEach(function (t) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="t-time">' + (t.at / 1000).toFixed(1) + 's</span>' +
        '<span class="t-item">' + esc(t.name) + '</span><span class="t-by">' + esc(t.by) + '</span>' +
        '<span class="t-pts">+' + t.points + '</span>';
      tl.appendChild(li);
    });
    $('btn-play-again').classList.toggle('hidden', !amHost);
    // reveal everything on the scene behind results? keep results simple
  });

  $('btn-play-again').addEventListener('click', function () { socket.emit('playAgain'); });
  $('btn-results-home').addEventListener('click', leaveRoom);

  socket.on('backToLobby', function (st) {
    room = st;
    show('lobby');
    renderLobby();
  });

  // ---------- room state routing ----------
  socket.on('joined', function (data) {
    myId = socket.id;
    room = data;
    room.players = data.players;
    $('lobby-chat').innerHTML = '';
    (data.log || []).forEach(function (l) { appendChat($('lobby-chat'), esc(l.text), 'sys'); });
    show('lobby');
    renderLobby();
  });

  socket.on('roomState', function (st) {
    if (!room) return;
    var wasPlaying = room.state === 'playing';
    room = st;
    if (st.state === 'lobby' || st.state === 'ended') {
      if (!wasPlaying || st.state === 'lobby') {
        if ($('screen-lobby').classList.contains('active') || st.state === 'lobby') {
          show('lobby');
          renderLobby();
        }
      }
    }
  });

  function leaveRoom() {
    socket.disconnect();
    socket.connect();
    room = null;
    show('home');
  }
})();
