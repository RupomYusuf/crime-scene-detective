const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const Scenarios = require('./public/js/scenarios.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/scenarios', (req, res) => {
  res.json(Scenarios.scenarios.map(s => ({ id: s.id, name: s.name, desc: s.desc })));
});

// ---------------------------------------------------------------- persistence
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
function loadHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8')); } catch { return []; }
}
function saveGameResult(result) {
  const history = loadHistory();
  history.push(result);
  if (history.length > 200) history.splice(0, history.length - 200);
  try { fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2)); } catch (e) { console.error('history save failed', e); }
}
app.get('/api/history', (req, res) => res.json(loadHistory().slice(-20).reverse()));

// ---------------------------------------------------------------- room config
const DEFAULT_SETTINGS = {
  scenarioId: 'random',       // 'random' or a scenario id
  elementCount: 10,           // 5 - 25
  durationMinutes: 5,         // 2 - 10
  hintsEnabled: true,
  hintCooldownSec: 30,
  hintCost: 15,
  wrongClickPenalty: 5,       // 0 disables
  pointMultiplier: 1
};
const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const POINTS = [100, 80, 60, 40];
const ROOM_TTL_AFTER_END = 5 * 60 * 1000;

const rooms = new Map();      // code -> room
const socketRoom = new Map(); // socketId -> code

function makeCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  } while (rooms.has(code));
  return code;
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function normalizeSettings(s) {
  const out = { ...DEFAULT_SETTINGS };
  if (!s) return out;
  const scenarioIds = Scenarios.scenarios.map(x => x.id);
  if (s.scenarioId === 'random' || scenarioIds.includes(s.scenarioId)) out.scenarioId = s.scenarioId;
  out.elementCount = clamp(parseInt(s.elementCount) || out.elementCount, 5, 25);
  out.durationMinutes = clamp(parseInt(s.durationMinutes) || out.durationMinutes, 2, 10);
  out.hintsEnabled = !!s.hintsEnabled;
  out.hintCooldownSec = clamp(parseInt(s.hintCooldownSec) || out.hintCooldownSec, 10, 120);
  out.hintCost = clamp(parseInt(s.hintCost ?? DEFAULT_SETTINGS.hintCost), 0, 100);
  out.wrongClickPenalty = clamp(parseInt(s.wrongClickPenalty ?? DEFAULT_SETTINGS.wrongClickPenalty), 0, 50);
  out.pointMultiplier = clamp(parseFloat(s.pointMultiplier) || 1, 0.5, 5);
  return out;
}

// Difficulty presets map to element counts.
const PRESETS = { easy: [5, 8], medium: [10, 15], hard: [20, 25] };

function publicPlayer(p) {
  return { id: p.id, name: p.name, ready: p.ready, score: p.score, isHost: p.isHost, foundCount: p.found.length, hintsUsed: p.hintsUsed };
}
function roomState(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    players: Object.values(room.players).map(publicPlayer),
    settings: room.settings,
    scenarioId: room.scenarioId,
    endsAt: room.endsAt,
    found: room.state === 'playing'
      ? room.elements.filter(e => e.foundBy).map(e => ({ id: e.id, name: e.name, x: e.x, y: e.y, by: e.foundBy, byName: room.players[e.foundBy] ? room.players[e.foundBy].name : '?', order: e.order }))
      : []
  };
}

function generateElements(scenarioId, count) {
  const scenario = Scenarios.get(scenarioId);
  const pool = [...scenario.items];
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const elements = [];
  for (let i = 0; i < count; i++) {
    const itemId = pool[i % pool.length];
    const item = Scenarios.itemById[itemId];
    // position with rejection sampling so clues never overlap
    let x = 50, y = 50;
    for (let tries = 0; tries < 300; tries++) {
      x = 7 + Math.random() * 86;          // % of stage width
      y = 14 + Math.random() * 72;         // % of stage height (below HUD)
      const ok = elements.every(e => Math.hypot(e.x - x, e.y - y) > 11);
      if (ok) break;
    }
    elements.push({ id: 'el' + i, itemId, name: item.name, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, foundBy: null, foundAt: null, order: null });
  }
  return elements;
}

function startGame(room) {
  room.scenarioId = room.settings.scenarioId === 'random' ? Scenarios.randomId() : room.settings.scenarioId;
  room.elements = generateElements(room.scenarioId, room.settings.elementCount);
  room.state = 'playing';
  room.startedAt = Date.now();
  room.endsAt = Date.now() + room.settings.durationMinutes * 60 * 1000;
  for (const id in room.players) {
    const p = room.players[id];
    p.score = 0;
    p.found = [];
    p.hintsUsed = 0;
    p.lastHintAt = 0;
    p.wrongClicks = 0;
  }
  if (room.timer) clearInterval(room.timer);
  room.timer = setInterval(() => tickRoom(room), 1000);
  const st = roomState(room);
  io.to(room.code).emit('gameStarted', {
    ...st,
    elements: room.elements.map(e => ({ id: e.id, itemId: e.itemId, x: e.x, y: e.y })), // positions to everyone; names hidden until found
    scenarioId: room.scenarioId
  });
  pushLog(room, `The investigation has begun — ${room.settings.elementCount} clues are hidden. Good luck, detectives.`);
}

function tickRoom(room) {
  const left = room.endsAt - Date.now();
  io.to(room.code).emit('timeLeft', Math.max(0, Math.ceil(left / 1000)));
  if (left <= 0) endGame(room, 'time');
}

function endGame(room, reason) {
  if (room.state !== 'playing') return;
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  room.state = 'ended';
  const found = room.elements.filter(e => e.foundBy);
  const results = {
    roomCode: room.code,
    scenarioId: room.scenarioId,
    reason,                              // 'time' | 'cleared'
    endedAt: Date.now(),
    durationMs: Date.now() - room.startedAt,
    settings: room.settings,
    timeline: found.map(e => ({ name: e.name, by: room.players[e.foundBy]?.name || '?', at: e.foundAt - room.startedAt, points: e.points || 0 })),
    scores: Object.values(room.players).map(p => ({
      name: p.name, score: p.score, found: p.found.length, hintsUsed: p.hintsUsed, wrongClicks: p.wrongClicks
    })).sort((a, b) => b.score - a.score || b.found - a.found)
  };
  saveGameResult(results);
  io.to(room.code).emit('gameEnded', { ...results, elements: room.elements.map(e => ({ id: e.id, name: e.name, itemId: e.itemId, x: e.x, y: e.y, foundBy: e.foundBy })) });
  pushLog(room, reason === 'cleared' ? 'All clues found! Case closed.' : "Time's up! The case goes cold.");
  // keep the room 5 minutes for review, then drop it if everyone left
  setTimeout(() => {
    if (rooms.get(room.code) === room && room.state === 'ended' && Object.keys(room.players).length === 0) {
      rooms.delete(room.code);
    }
  }, ROOM_TTL_AFTER_END);
}

function pushLog(room, text, kind) {
  room.log.push({ text, kind: kind || 'info', at: Date.now() });
  if (room.log.length > 60) room.log.shift();
  io.to(room.code).emit('log', room.log[room.log.length - 1]);
}

// ---------------------------------------------------------------- sockets
io.on('connection', (socket) => {
  socket.on('createRoom', ({ name, settings }, ack) => {
    name = String(name || '').trim().slice(0, 16) || 'Detective';
    const room = {
      code: makeCode(),
      hostId: socket.id,
      state: 'lobby',
      settings: normalizeSettings(settings),
      scenarioId: null,
      players: {},
      elements: [],
      log: [],
      timer: null,
      endsAt: 0,
      startedAt: 0
    };
    rooms.set(room.code, room);
    joinRoom(socket, room, name);
    ack && ack({ ok: true, code: room.code });
  });

  socket.on('joinRoom', ({ code, name }, ack) => {
    code = String(code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) { ack && ack({ ok: false, error: 'Room not found. Check the code.' }); return; }
    if (room.state !== 'lobby' && room.state !== 'ended') { ack && ack({ ok: false, error: 'That game is already in progress.' }); return; }
    if (Object.keys(room.players).length >= MAX_PLAYERS && !room.players[socket.id]) { ack && ack({ ok: false, error: 'Room is full (max 4 detectives).' }); return; }
    name = String(name || '').trim().slice(0, 16) || 'Detective';
    joinRoom(socket, room, name);
    ack && ack({ ok: true, code: room.code });
  });

  socket.on('toggleReady', () => {
    const room = roomOf(socket); if (!room) return;
    const p = room.players[socket.id];
    p.ready = !p.ready;
    io.to(room.code).emit('roomState', roomState(room));
  });

  socket.on('updateSettings', (settings) => {
    const room = roomOf(socket); if (!room) return;
    if (socket.id !== room.hostId) return;
    const preset = settings && settings.preset;
    room.settings = normalizeSettings({ ...room.settings, ...settings });
    if (preset && PRESETS[preset]) {
      room.settings.elementCount = clamp(Math.round((PRESETS[preset][0] + PRESETS[preset][1]) / 2), 5, 25);
    }
    io.to(room.code).emit('roomState', roomState(room));
  });

  socket.on('startGame', (ack) => {
    const room = roomOf(socket); if (!room) return;
    if (socket.id !== room.hostId) { ack && ack({ ok: false, error: 'Only the host can start the game.' }); return; }
    const players = Object.values(room.players);
    if (players.length < MIN_PLAYERS) { ack && ack({ ok: false, error: `Need at least ${MIN_PLAYERS} detectives to start.` }); return; }
    if (!players.every(p => p.ready)) { ack && ack({ ok: false, error: 'Not everyone is ready yet.' }); return; }
    startGame(room);
    ack && ack({ ok: true });
  });

  socket.on('clickElement', ({ elementId }) => {
    const room = roomOf(socket); if (!room || room.state !== 'playing') return;
    const el = room.elements.find(e => e.id === elementId);
    if (!el || el.foundBy) return;
    const p = room.players[socket.id]; if (!p) return;
    el.foundBy = socket.id;
    el.foundAt = Date.now();
    const order = room.elements.filter(e => e.foundBy).length - 1;
    el.order = order;
    const pts = Math.round(POINTS[Math.min(order, POINTS.length - 1)] * room.settings.pointMultiplier);
    el.points = pts;
    p.score += pts;
    p.found.push(el.id);
    io.to(room.code).emit('elementFound', {
      elementId: el.id, by: socket.id, byName: p.name, name: el.name, order, points: pts,
      scores: Object.values(room.players).map(publicPlayer).sort((a, b) => b.score - a.score),
      remaining: room.elements.filter(e => !e.foundBy).length
    });
    pushLog(room, `${p.name} found the ${el.name}! (+${pts})`, 'find');
    if (room.elements.every(e => e.foundBy)) endGame(room, 'cleared');
  });

  socket.on('wrongClick', () => {
    const room = roomOf(socket); if (!room || room.state !== 'playing') return;
    if (!room.settings.wrongClickPenalty) return;
    const p = room.players[socket.id]; if (!p) return;
    p.score = Math.max(0, p.score - room.settings.wrongClickPenalty);
    p.wrongClicks++;
    socket.emit('wrongClickResult', { penalty: room.settings.wrongClickPenalty, score: p.score });
  });

  socket.on('useHint', (ack) => {
    const room = roomOf(socket); if (!room || room.state !== 'playing') return;
    const p = room.players[socket.id]; if (!p) return;
    if (!room.settings.hintsEnabled) { ack && ack({ ok: false, error: 'Hints are disabled in this game.' }); return; }
    const since = (Date.now() - p.lastHintAt) / 1000;
    if (p.lastHintAt && since < room.settings.hintCooldownSec) {
      ack && ack({ ok: false, error: `Hint on cooldown (${Math.ceil(room.settings.hintCooldownSec - since)}s).` });
      return;
    }
    const unfound = room.elements.filter(e => !e.foundBy);
    if (!unfound.length) { ack && ack({ ok: false, error: 'No clues left to reveal.' }); return; }
    p.lastHintAt = Date.now();
    p.hintsUsed++;
    p.score = Math.max(0, p.score - room.settings.hintCost);
    const el = unfound[Math.floor(Math.random() * unfound.length)];
    socket.emit('hintResult', { ok: true, elementId: el.id, cost: room.settings.hintCost, cooldown: room.settings.hintCooldownSec });
    pushLog(room, `${p.name} called in a favor from forensics (-${room.settings.hintCost}).`, 'hint');
    ack && ack({ ok: true, elementId: el.id });
  });

  socket.on('chat', ({ text }) => {
    const room = roomOf(socket); if (!room) return;
    const p = room.players[socket.id]; if (!p) return;
    const msg = String(text || '').trim().slice(0, 200);
    if (!msg) return;
    io.to(room.code).emit('chat', { name: p.name, text: msg, at: Date.now() });
  });

  socket.on('playAgain', () => {
    const room = roomOf(socket); if (!room || room.state !== 'ended') return;
    if (socket.id !== room.hostId) return;
    room.state = 'lobby';
    room.elements = [];
    for (const id in room.players) room.players[id].ready = false;
    io.to(room.code).emit('backToLobby', roomState(room));
  });

  socket.on('disconnect', () => {
    const code = socketRoom.get(socket.id);
    if (!code) return;
    socketRoom.delete(socket.id);
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players[socket.id];
    delete room.players[socket.id];
    if (p) pushLog(room, `${p.name} left the investigation.`);
    const ids = Object.keys(room.players);
    if (ids.length === 0) {
      if (room.timer) clearInterval(room.timer);
      rooms.delete(code);
    } else {
      if (room.hostId === socket.id) {
        room.hostId = ids[0];
        room.players[room.hostId].isHost = true;
        pushLog(room, `${room.players[room.hostId].name} is now the host.`);
      }
      if (room.state === 'playing' && room.elements.every(e => !e.foundBy || e.foundBy === socket.id || room.players[e.foundBy])) {
        // fine — game continues; if the leaving player was mid-find nothing breaks
      }
      io.to(code).emit('roomState', roomState(room));
      if (room.state === 'playing' && room.elements.length && room.elements.every(e => e.foundBy && !room.players[e.foundBy])) {
        endGame(room, 'cleared');
      }
    }
  });

  function joinRoom(socket, room, name) {
    // unique-ify name
    const taken = new Set(Object.values(room.players).map(p => p.name.toLowerCase()));
    let final = name, n = 2;
    while (taken.has(final.toLowerCase())) final = `${name} ${n++}`;
    const rejoin = room.players[socket.id];
    room.players[socket.id] = rejoin || {
      id: socket.id, name: final, ready: false, score: 0, found: [],
      hintsUsed: 0, lastHintAt: 0, wrongClicks: 0, isHost: room.hostId === socket.id
    };
    if (room.hostId === socket.id) room.players[socket.id].isHost = true;
    socket.join(room.code);
    socketRoom.set(socket.id, room.code);
    socket.emit('joined', { ...roomState(room), log: room.log });
    io.to(room.code).emit('roomState', roomState(room));
    pushLog(room, `${final} joined the investigation.`);
  }
  function roomOf(socket) {
    const code = socketRoom.get(socket.id);
    return code ? rooms.get(code) : null;
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Crime Scene Detective running at http://localhost:${PORT}`));
