/* E2E smoke test: simulates 3 players playing a full round. */
const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:3099';
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok -', name); }
  else { fail++; console.log('  FAIL -', name); }
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));

function client() {
  return io(URL, { transports: ['websocket'] });
}

(async () => {
  const a = client(), b = client(), c = client();
  const events = (sock, ev) => new Promise(res => sock.once(ev, res));

  // create room (player A = host)
  const created = await new Promise(res => a.emit('createRoom', { name: 'Ada', settings: { elementCount: 8, durationMinutes: 2, hintsEnabled: true, wrongClickPenalty: 5 } }, res));
  check('room created with 4-char code', created.ok && /^[A-Z0-9]{4}$/.test(created.code));
  const code = created.code;
  a.on('roomState', st => { /* host keeps latest */ });

  // join B and C
  const jb = await new Promise(res => b.emit('joinRoom', { code, name: 'Ben' }, res));
  check('B joined', jb.ok);
  const jc = await new Promise(res => c.emit('joinRoom', { code, name: 'Cleo' }, res));
  check('C joined', jc.ok);

  // capacity: 4th player accepted, 5th rejected
  const d = client();
  const jd4 = await new Promise(res => d.emit('joinRoom', { code, name: 'Dory' }, res));
  check('4th player accepted', jd4.ok);
  const e = client();
  const jd = await new Promise(res => e.emit('joinRoom', { code, name: 'Egon' }, res));
  check('5th player rejected (max 4)', !jd.ok && /full/i.test(jd.error));
  d.close(); e.close();

  // bad code
  const jbad = await new Promise(res => b.emit('joinRoom', { code: 'ZZZZ', name: 'X' }, res));
  check('bad code rejected', !jbad.ok);

  // ready gating: host cannot start until all ready
  const early = await new Promise(res => a.emit('startGame', res));
  check('start blocked when not all ready', !early.ok);
  b.emit('toggleReady'); c.emit('toggleReady'); a.emit('toggleReady');
  await wait(150);

  // settings update by host
  const st = await new Promise(res => {
    b.once('roomState', res);
    a.emit('updateSettings', { elementCount: 8, durationMinutes: 2, preset: null });
  });
  check('host settings applied (count 8, 2 min)', st.settings.elementCount === 8 && st.settings.durationMinutes === 2);
  // non-host cannot update
  const st2 = await new Promise(res => {
    a.once('roomState', res);
    setTimeout(() => res(null), 300);
    b.emit('updateSettings', { elementCount: 25 });
  });
  check('non-host settings ignored', !st2 || st2.settings.elementCount === 8);

  // start game
  const started = new Promise(res => a.once('gameStarted', res));
  const startAck = await new Promise(res => a.emit('startGame', res));
  const game = await started;
  check('game started', startAck.ok && game.elements.length === 8);
  check('all players got identical layout', (() => {
    const gb = events(b, 'gameStarted');
    return gb.then(g => JSON.stringify(g.elements) === JSON.stringify(game.elements));
  })());

  // scoring: first finder 100, second 80
  const found1 = new Promise(res => a.once('elementFound', res));
  b.emit('clickElement', { elementId: game.elements[0].id });
  const f1 = await found1;
  check('first find scores 100', f1.points === 100 && f1.byName === 'Ben');
  const found2 = new Promise(res => a.once('elementFound', res));
  c.emit('clickElement', { elementId: game.elements[1].id });
  const f2 = await found2;
  check('second find scores 80', f2.points === 80 && f2.byName === 'Cleo');

  // duplicate find is ignored
  const dupPromise = new Promise(res => a.once('elementFound', res));
  a.emit('clickElement', { elementId: game.elements[0].id });
  const dup = await Promise.race([dupPromise, wait(300).then(() => null)]);
  check('duplicate find ignored', dup === null);

  // wrong click penalty
  const wrong = new Promise(res => b.once('wrongClickResult', res));
  b.emit('wrongClick');
  const w = await wrong;
  check('wrong click penalized', w.penalty === 5 && w.score === 95);

  // hint: gives element + cooldown for second use
  const hint1 = await new Promise(res => c.emit('useHint', res));
  check('hint returns an unfound element', hint1.ok && !!hint1.elementId);
  const hint2 = await new Promise(res => c.emit('useHint', res));
  check('hint cooldown enforced', !hint2.ok && /cooldown/i.test(hint2.error));

  // chat broadcast
  const chat = new Promise(res => a.once('chat', res));
  b.emit('chat', { text: 'I suspect the butler.' });
  const ch = await chat;
  check('chat broadcast', ch.text === 'I suspect the butler.' && ch.name === 'Ben');

  // clear remaining elements -> game ends 'cleared'
  const ended = new Promise(res => a.once('gameEnded', res));
  for (const el of game.elements.slice(2)) {
    a.emit('clickElement', { elementId: el.id });
    await wait(60);
  }
  const end = await ended;
  check('game ends cleared', end.reason === 'cleared');
  check('timeline recorded all 8 finds', end.timeline.length === 8);
  const ada = end.scores.find(s => s.name === 'Ada'), ben = end.scores.find(s => s.name === 'Ben');
  check('scores sorted desc and winner >0', end.scores[0].score > 0 && end.scores.every((s, i) => i === 0 || end.scores[i - 1].score >= s.score));
  check('Ada (found the rest) wins; Ben has 100-5 penalty', ada.score === 260 && ben.score === 95);
  check('history file written', fs.existsSync(path.join(__dirname, '..', 'data', 'history.json')));

  // play again resets to lobby
  const back = new Promise(res => b.once('backToLobby', res));
  a.emit('playAgain');
  const lobby = await back;
  check('play again returns to lobby', lobby.state === 'lobby');

  // disconnect cleanup
  a.close(); b.close(); c.close();
  await wait(200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('test crashed:', e); process.exit(1); });
