/*
 * Rich scene artwork for Crime Scene Detective.
 * Loaded after scenarios.js; replaces Scenarios.decor with detailed layers:
 * gradients, ceiling lights with cones, furniture shadows, patterned floors,
 * wallpaper, and small crime-scene touches (numbered evidence tents, chalk, dust).
 */
(function () {
  'use strict';
  if (typeof Scenarios === 'undefined') return;

  var sh = function (x, y, rx, ry, o) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity="' + (o || 0.22) + '"/>';
  };
  // ceiling lamp with hanging cord, shade, and a light cone + floor pool
  function lamp(cx, floorY, scale) {
    scale = scale || 1;
    var top = 0, shadeY = 110 * scale, coneW = 150 * scale;
    return '<line x1="' + cx + '" y1="' + top + '" x2="' + cx + '" y2="' + shadeY + '" stroke="#20242b" stroke-width="4"/>' +
      '<path d="M' + (cx - 46 * scale) + ' ' + shadeY + ' L' + (cx + 46 * scale) + ' ' + shadeY + ' L' + (cx + 22 * scale) + ' ' + (shadeY + 40 * scale) + ' L' + (cx - 22 * scale) + ' ' + (shadeY + 40 * scale) + ' Z" fill="#333b45" stroke="#20242b" stroke-width="3"/>' +
      '<ellipse cx="' + cx + '" cy="' + (shadeY + 42 * scale) + '" rx="' + (16 * scale) + '" ry="' + (6 * scale) + '" fill="#f8e2a0"/>' +
      '<path d="M' + (cx - 22 * scale) + ' ' + (shadeY + 44 * scale) + ' L' + (cx - coneW) + ' ' + floorY + ' L' + (cx + coneW) + ' ' + floorY + ' L' + (cx + 22 * scale) + ' ' + (shadeY + 44 * scale) + ' Z" fill="url(#lightcone)"/>' +
      '<ellipse cx="' + cx + '" cy="' + floorY + '" rx="' + (coneW * 1.05) + '" ry="' + (40 * scale) + '" fill="url(#lightpool)"/>';
  }
  function wallLamp(cx, cy) {
    return '<rect x="' + (cx - 4) + '" y="' + (cy - 34) + '" width="8" height="20" fill="#2b2f36"/>' +
      '<path d="M' + (cx - 26) + ' ' + (cy - 14) + ' L' + (cx + 26) + ' ' + (cy - 14) + ' L' + (cx + 14) + ' ' + (cy + 12) + ' L' + (cx - 14) + ' ' + (cy + 12) + ' Z" fill="#3a424d"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy + 13) + '" rx="12" ry="5" fill="#f8e2a0"/>' +
      '<path d="M' + (cx - 14) + ' ' + (cy + 14) + ' L' + (cx - 60) + ' ' + (cy + 150) + ' L' + (cx + 60) + ' ' + (cy + 150) + ' L' + (cx + 14) + ' ' + (cy + 14) + ' Z" fill="url(#lightcone)"/>';
  }
  // numbered evidence tent (little yellow triangle marker)
  function tent(x, y, n) {
    return '<path d="M' + x + ' ' + y + ' L' + (x + 22) + ' ' + y + ' L' + (x + 11) + ' ' + (y - 26) + ' Z" fill="#e8c33c" stroke="#8a6d2f" stroke-width="2"/>' +
      '<text x="' + (x + 11) + '" y="' + (y - 6) + '" font-size="14" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#4a3a12">' + n + '</text>';
  }
  function defs() {
    return '<defs>' +
      '<linearGradient id="lightcone" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#f5d98a" stop-opacity="0.22"/><stop offset="1" stop-color="#f5d98a" stop-opacity="0.03"/></linearGradient>' +
      '<radialGradient id="lightpool"><stop offset="0" stop-color="#f5d98a" stop-opacity="0.18"/><stop offset="1" stop-color="#f5d98a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="roomShade" cx="0.5" cy="0.42" r="0.85">' +
      '<stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.42"/></radialGradient>' +
      '<linearGradient id="fire" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0" stop-color="#e2633c"/><stop offset="0.5" stop-color="#f5a23c" stop-opacity="0.8"/><stop offset="1" stop-color="#f5d98a" stop-opacity="0"/></linearGradient>' +
      '</defs>';
  }
  // full-room vignette applied on top of every scene
  var shade = '<rect width="1600" height="900" fill="url(#roomShade)"/>';
  // dust motes drifting in the light
  function dust(seedList) {
    var s = '';
    for (var i = 0; i < seedList.length; i++) {
      var p = seedList[i];
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#fff" opacity="0.14"/>';
    }
    return s;
  }

  Scenarios.decor.office = defs() +
    // ceiling + walls + floor
    '<rect width="1600" height="70" fill="#39424c"/><line x1="0" y1="70" x2="1600" y2="70" stroke="#2b333c" stroke-width="5"/>' +
    '<rect y="70" width="1600" height="540" fill="#4d5864"/>' +
    '<rect y="70" width="1600" height="540" fill="url(#walltex)"/>' +
    '<defs><pattern id="walltex" width="120" height="120" patternUnits="userSpaceOnUse">' +
    '<rect width="120" height="120" fill="none"/><rect x="0" y="0" width="120" height="2" fill="#465160" opacity="0.5"/><rect x="0" y="0" width="2" height="120" fill="#465160" opacity="0.5"/></pattern></defs>' +
    '<rect y="596" width="1600" height="16" fill="#39434d"/>' +
    '<rect y="612" width="1600" height="288" fill="#5a4936"/>' +
    (function () { var s = ''; for (var i = 0; i < 7; i++) s += '<line x1="0" y1="' + (640 + i * 38) + '" x2="1600" y2="' + (640 + i * 38) + '" stroke="#4a3b2a" stroke-width="2"/>'; for (var j = 0; j < 9; j++) s += '<line x1="' + (90 + j * 190) + '" y1="612" x2="' + (30 + j * 190) + '" y2="900" stroke="#4a3b2a" stroke-width="2"/>'; return s; })() +
    // window: night city, blinds half-drawn, rain
    '<rect x="100" y="120" width="340" height="300" rx="4" fill="#1c2632" stroke="#2f3945" stroke-width="12"/>' +
    (function () { var s = ''; for (var i = 0; i < 7; i++) s += '<rect x="106" y="' + (150 + i * 26) + '" width="328" height="10" fill="#33404e" opacity="0.85"/>'; return s; })() +
    '<rect x="150" y="230" width="60" height="50" fill="#f5d98a" opacity="0.4"/><rect x="250" y="270" width="70" height="60" fill="#f5d98a" opacity="0.3"/><rect x="350" y="220" width="50" height="80" fill="#f5d98a" opacity="0.35"/>' +
    '<path d="M140 260 l14 26 M210 300 l14 26 M320 240 l14 26 M390 330 l14 26" stroke="#7f97ad" stroke-width="2" opacity="0.6"/>' +
    sh(270, 425, 190, 12, 0.3) +
    // corkboard with pinned photos & red string
    '<rect x="560" y="110" width="300" height="180" rx="6" fill="#6d5236" stroke="#573f28" stroke-width="8"/>' +
    '<rect x="585" y="135" width="70" height="52" fill="#e8e0c8" transform="rotate(-3 620 161)"/><rect x="680" y="130" width="70" height="52" fill="#dcd3ba" transform="rotate(2 715 156)"/><rect x="770" y="145" width="60" height="46" fill="#e8e0c8" transform="rotate(-2 800 168)"/>' +
    '<path d="M640 165 L715 155 M730 158 L795 170" stroke="#a33b3b" stroke-width="2"/>' +
    '<circle cx="620" cy="140" r="4" fill="#a33b3b"/><circle cx="715" cy="136" r="4" fill="#a33b3b"/><circle cx="800" cy="150" r="4" fill="#a33b3b"/>' +
    // door, ajar light
    '<rect x="1420" y="140" width="150" height="470" fill="#3a3f47"/><rect x="1432" y="152" width="126" height="446" fill="#4a515b"/>' +
    '<rect x="1450" y="180" width="40" height="90" fill="#2c333c"/><circle cx="1448" cy="390" r="6" fill="#c9a24b"/>' +
    // desk with pulled drawers, tipped monitor, keyboard on floor
    sh(880, 655, 330, 22, 0.3) +
    '<rect x="620" y="430" width="520" height="26" fill="#6d5236"/><rect x="650" y="456" width="26" height="185" fill="#573f28"/><rect x="1090" y="456" width="26" height="185" fill="#573f28"/>' +
    '<rect x="660" y="456" width="190" height="128" fill="#7a5c3d"/><rect x="690" y="478" width="110" height="66" fill="#573f28"/><rect x="705" y="470" width="80" height="10" fill="#8a6a48"/>' +
    '<rect x="880" y="456" width="190" height="128" fill="#7a5c3d"/><rect x="910" y="478" width="110" height="66" fill="#573f28"/>' +
    '<rect x="640" y="380" width="120" height="14" fill="#3a4149" transform="rotate(-14 700 387)"/><rect x="655" y="394" width="90" height="34" rx="4" fill="#2b2f36" transform="rotate(-14 700 411)"/>' +
    '<rect x="600" y="700" width="150" height="26" rx="4" fill="#3a4149"/><circle cx="620" cy="713" r="4" fill="#181b20"/><circle cx="700" cy="713" r="4" fill="#181b20"/>' +
    // fallen chair
    '<path d="M1210 640 L1300 640 M1240 560 L1240 640 M1240 580 L1310 560" stroke="#5b3a24" stroke-width="12" stroke-linecap="round" transform="rotate(78 1260 610)"/>' +
    // filing cabinet with drawers yanked out + spilling files
    sh(330, 640, 130, 16, 0.28) +
    '<rect x="220" y="380" width="150" height="250" rx="6" fill="#565f6b"/>' +
    '<rect x="235" y="400" width="120" height="55" rx="4" fill="#68727f"/><rect x="250" y="540" width="120" height="55" rx="4" fill="#68727f" transform="translate(40 60)"/>' +
    (function () { var s = ''; for (var i = 0; i < 5; i++) s += '<rect x="' + (300 + i * 14) + '" y="' + (600 - i * 12) + '" width="90" height="30" rx="3" fill="#e0d6ba" transform="rotate(' + (-8 + i * 4) + ' 340 600)"/>'; return s; })() +
    '<circle cx="295" cy="430" r="5" fill="#c9a24b"/>' +
    // scattered papers, coffee cup + stain, boxes
    '<path d="M520 700 l90 -12 l8 60 l-92 10 Z" fill="#e8e0c8"/><path d="M640 760 l80 6 l-4 40 l-78 -8 Z" fill="#e0d6ba"/><path d="M820 700 l70 20 l-20 40 l-64 -24 Z" fill="#efe7cf"/>' +
    '<ellipse cx="1150" cy="770" rx="34" ry="12" fill="#4a3a26" opacity="0.6"/><path d="M1130 730 a20 14 0 1 0 40 0 a20 14 0 1 0 -40 0" fill="#e8e0c8"/><rect x="1122" y="706" width="56" height="26" rx="4" fill="#e8e0c8"/><path d="M1178 712 q16 4 0 14" stroke="#e8e0c8" stroke-width="6" fill="none"/>' +
    '<rect x="90" y="660" width="110" height="90" fill="#8a6a48" stroke="#6d5236" stroke-width="4"/><path d="M90 700 L200 700" stroke="#6d5236" stroke-width="4"/>' +
    // wall clock + radiator + plant
    '<circle cx="1000" cy="180" r="34" fill="#e8e4da" stroke="#3a4149" stroke-width="6"/><path d="M1000 180 L1000 160 M1000 180 L1014 188" stroke="#3a4149" stroke-width="4" stroke-linecap="round"/>' +
    '<rect x="700" y="330" width="110" height="150" rx="8" fill="#7f8996"/>' +
    (function () { var s = ''; for (var i = 0; i < 6; i++) s += '<line x1="710" y1="' + (345 + i * 24) + '" x2="800" y2="' + (345 + i * 24) + '" stroke="#5d6672" stroke-width="6"/>'; return s; })() +
    sh(760, 640, 70, 10, 0.25) +
    '<path d="M1330 560 C1330 540 1370 540 1370 560 L1374 620 L1326 620 Z" fill="#8a4a3a"/><path d="M1300 560 C1310 520 1330 530 1330 555 M1370 555 C1380 515 1400 525 1398 552 M1330 545 C1340 505 1360 505 1362 540" stroke="#3a6a3a" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    sh(1350, 635, 55, 9, 0.25) +
    // evidence tents + tipped coffee
    tent(560, 790, '1') + tent(1250, 700, '2') +
    lamp(480, 612, 1.1) + lamp(1120, 612, 0.9) +
    dust([[300, 200, 2], [520, 320, 2.5], [900, 250, 2], [1240, 380, 3], [700, 480, 2], [1420, 300, 2.5]]) +
    shade,

  Scenarios.decor.hotel = defs() +
    // walls: warm plum wallpaper with damask-ish pattern, patterned carpet
    '<rect width="1600" height="70" fill="#4a3f52"/><line x1="0" y1="70" x2="1600" y2="70" stroke="#3a3040" stroke-width="5"/>' +
    '<rect y="70" width="1600" height="540" fill="#6b5a70"/>' +
    '<defs><pattern id="damask" width="90" height="90" patternUnits="userSpaceOnUse">' +
    '<circle cx="45" cy="45" r="14" fill="none" stroke="#75637a" stroke-width="2"/><circle cx="45" cy="45" r="5" fill="#75637a" opacity="0.6"/>' +
    '<circle cx="0" cy="0" r="8" fill="none" stroke="#75637a" stroke-width="2"/><circle cx="90" cy="0" r="8" fill="none" stroke="#75637a" stroke-width="2"/>' +
    '<circle cx="0" cy="90" r="8" fill="none" stroke="#75637a" stroke-width="2"/><circle cx="90" cy="90" r="8" fill="none" stroke="#75637a" stroke-width="2"/></pattern></defs>' +
    '<rect y="70" width="1600" height="540" fill="url(#damask)"/>' +
    '<rect y="596" width="1600" height="16" fill="#514356"/>' +
    '<rect y="612" width="1600" height="288" fill="#7a6a58"/>' +
    '<defs><pattern id="carpet" width="120" height="60" patternUnits="userSpaceOnUse">' +
    '<path d="M60 6 L114 30 L60 54 L6 30 Z" fill="none" stroke="#665844" stroke-width="2"/>' +
    '<circle cx="60" cy="30" r="4" fill="#665844"/></pattern></defs>' +
    '<rect y="612" width="1600" height="288" fill="url(#carpet)"/>' +
    // headboard + made bed, thrown-back duvet
    '<rect x="140" y="330" width="560" height="120" rx="10" fill="#5a3a48"/><rect x="150" y="340" width="540" height="100" rx="8" fill="#6a4656"/>' +
    sh(430, 660, 320, 20, 0.3) +
    '<rect x="150" y="440" width="560" height="190" rx="12" fill="#e8e0d0"/><rect x="150" y="440" width="560" height="60" fill="#ded4c0"/>' +
    '<path d="M710 440 C640 520 620 560 640 630 L710 630 Z" fill="#c8bcd8"/>' +
    '<rect x="185" y="415" width="130" height="62" rx="12" fill="#f4efe2"/><rect x="185" y="415" width="130" height="20" rx="10" fill="#fdfaf2"/>' +
    '<rect x="345" y="420" width="130" height="58" rx="12" fill="#ece5d4"/><rect x="345" y="420" width="130" height="18" rx="9" fill="#f8f4ea"/>' +
    '<rect x="150" y="630" width="30" height="60" fill="#4a3038"/><rect x="680" y="630" width="30" height="60" fill="#4a3038"/>' +
    // nightstands + lamps + phone + bible
    '<rect x="20" y="440" width="110" height="120" fill="#5a4358"/><rect x="30" y="530" width="90" height="14" fill="#4a3548"/>' +
    '<rect x="720" y="440" width="110" height="120" fill="#5a4358"/><rect x="730" y="530" width="90" height="14" fill="#4a3548"/>' +
    wallLamp(75, 380) +
    '<rect x="748" y="400" width="26" height="40" rx="4" fill="#33383f"/><rect x="742" y="388" width="38" height="14" rx="4" fill="#454b54"/>' +
    '<rect x="50" y="404" width="34" height="34" rx="4" fill="#e8e0c8"/><path d="M56 414 L78 414 M56 422 L74 422" stroke="#8a86b8" stroke-width="2"/>' +
    // wall art + AC unit
    '<rect x="300" y="120" width="90" height="120" fill="#2e2836" stroke="#c2a24b" stroke-width="6"/><path d="M310 210 L340 170 L360 200 L380 160 L382 228 L312 228 Z" fill="#455a70"/>' +
    '<rect x="430" y="140" width="70" height="90" fill="#2e2836" stroke="#c2a24b" stroke-width="6"/><circle cx="465" cy="185" r="22" fill="#6a4656"/>' +
    '<rect x="940" y="90" width="220" height="60" rx="8" fill="#8a93a1"/><rect x="952" y="102" width="196" height="36" fill="#aab4c0"/>' +
    (function () { var s = ''; for (var i = 0; i < 5; i++) s += '<line x1="' + (960 + i * 38) + '" y1="102" x2="' + (960 + i * 38) + '" y2="138" stroke="#8a93a1" stroke-width="3"/>'; return s; })() +
    // window with heavy curtains + rain
    '<rect x="980" y="200" width="300" height="240" rx="6" fill="#1f2a36" stroke="#3a3140" stroke-width="10"/>' +
    '<rect x="1010" y="230" width="70" height="46" fill="#f5d98a" opacity="0.4"/><rect x="1130" y="280" width="80" height="56" fill="#f5d98a" opacity="0.3"/>' +
    '<path d="M960 180 C950 330 960 450 950 590 L1000 590 C995 450 1005 330 998 180 Z" fill="#7a3f5a"/><path d="M1020 180 L1020 590 L1040 590 L1040 180 Z" fill="#6a3550"/>' +
    '<path d="M1300 180 C1310 330 1300 450 1310 590 L1260 590 C1265 450 1255 330 1262 180 Z" fill="#7a3f5a"/><path d="M1240 180 L1240 590 L1260 590 L1260 180 Z" fill="#6a3550"/>' +
    '<path d="M1010 260 l12 24 M1200 320 l12 24 M1250 240 l12 24" stroke="#7f97ad" stroke-width="2" opacity="0.6"/>' +
    // dresser + round mirror + spilled suitcase contents
    sh(1260, 620, 200, 16, 0.28) +
    '<rect x="1080" y="450" width="380" height="160" fill="#5a4358"/><rect x="1110" y="475" width="140" height="50" rx="4" fill="#6f5570"/><rect x="1290" y="475" width="140" height="50" rx="4" fill="#6f5570"/><circle cx="1180" cy="500" r="6" fill="#d8b04a"/><circle cx="1360" cy="500" r="6" fill="#d8b04a"/>' +
    '<ellipse cx="1265" cy="330" rx="80" ry="95" fill="#2e2836" stroke="#c2a24b" stroke-width="7"/>' +
    '<ellipse cx="1265" cy="330" rx="80" ry="95" fill="url(#mirrorShine)"/>' +
    '<defs><linearGradient id="mirrorShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.12"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.06"/></linearGradient></defs>' +
    '<ellipse cx="900" cy="720" rx="95" ry="36" fill="#4a3550"/><ellipse cx="900" cy="716" rx="62" ry="22" fill="#3a2a40"/>' +
    (function () { var s = ''; var cols = ['#7a4a6a', '#4a6a7a', '#8a7a4a', '#5a4a8a']; for (var i = 0; i < 4; i++) s += '<path d="M' + (980 + i * 55) + ' ' + (700 + (i % 2) * 24) + ' q20 -16 44 0 q-20 18 -44 0" fill="' + cols[i] + '"/>'; return s; })() +
    // suitcase open + do-not-disturb sign on floor
    '<rect x="140" y="700" width="180" height="70" rx="8" fill="#4a3550" stroke="#2e2436" stroke-width="4"/><rect x="146" y="706" width="168" height="58" fill="#3a2a40"/>' +
    '<rect x="320" y="740" width="60" height="34" rx="6" fill="#e8e0c8" transform="rotate(-12 350 757)"/><path d="M334 752 L366 752" stroke="#a33b3b" stroke-width="4"/>' +
    // bathroom door ajar with light spilling out
    '<rect x="1450" y="180" width="120" height="430" fill="#3a3140"/><rect x="1360" y="190" width="96" height="420" fill="#574458" transform="rotate(-6 1408 400)"/>' +
    '<path d="M1360 610 L1470 610 L1560 610 L1560 900 L1360 900 Z" fill="#f8e9bc" opacity="0.16"/>' +
    '<rect x="1398" y="200" width="4" height="400" fill="#3a3140" transform="rotate(-6 1400 400)"/>' +
    // "204" plaque
    '<rect x="1330" y="120" width="70" height="44" rx="6" fill="#c2a24b"/><text x="1365" y="150" font-size="24" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#3a2c14">204</text>' +
    tent(820, 860, '3') +
    lamp(700, 612, 1) +
    dust([[260, 200, 2], [560, 300, 2], [880, 240, 2.5], [1180, 420, 2], [1420, 260, 2]]) +
    shade,

  Scenarios.decor.mansion = defs() +
    // dark panelled walls with wainscot, old wood floor
    '<rect width="1600" height="70" fill="#262b34"/><line x1="0" y1="70" x2="1600" y2="70" stroke="#1c2027" stroke-width="5"/>' +
    '<rect y="70" width="1600" height="540" fill="#3a3f4a"/>' +
    '<defs><pattern id="panel" width="160" height="540" patternUnits="userSpaceOnUse">' +
    '<rect x="10" y="90" width="140" height="440" fill="none" stroke="#333945" stroke-width="4" rx="4"/>' +
    '<rect x="26" y="110" width="108" height="180" fill="none" stroke="#333945" stroke-width="3" rx="3"/>' +
    '<rect x="26" y="310" width="108" height="200" fill="none" stroke="#333945" stroke-width="3" rx="3"/></pattern></defs>' +
    '<rect y="70" width="1600" height="540" fill="url(#panel)"/>' +
    '<rect y="560" width="1600" height="50" fill="#2e343e"/><rect y="600" width="1600" height="12" fill="#242932"/>' +
    '<rect y="612" width="1600" height="288" fill="#4a3a2c"/>' +
    (function () { var s = ''; for (var i = 0; i < 7; i++) s += '<line x1="0" y1="' + (644 + i * 38) + '" x2="1600" y2="' + (644 + i * 38) + '" stroke="#3a2c20" stroke-width="2"/>'; for (var j = 0; j < 9; j++) s += '<line x1="' + (90 + j * 190) + '" y1="612" x2="' + (30 + j * 190) + '" y2="900" stroke="#3a2c20" stroke-width="2"/>'; return s; })() +
    // long red runner rug with border
    '<rect x="380" y="612" width="700" height="288" fill="#5e2d33"/><rect x="396" y="612" width="668" height="288" fill="none" stroke="#7a4a50" stroke-width="4"/>' +
    '<path d="M420 900 L520 612 M620 900 L720 612 M820 900 L920 612" stroke="#7a4a50" stroke-width="3" opacity="0.6"/>' +
    // tall moonlit windows + shafts
    '<rect x="120" y="90" width="140" height="330" rx="60" fill="#111926" stroke="#2a303c" stroke-width="10"/><rect x="310" y="90" width="140" height="330" rx="60" fill="#111926" stroke="#2a303c" stroke-width="10"/>' +
    '<circle cx="190" cy="170" r="36" fill="#dfe8f2" opacity="0.85"/><path d="M190 148 C218 134 230 170 190 170 C162 172 168 146 190 148" fill="#b8c6d6" opacity="0.7"/>' +
    '<line x1="190" y1="90" x2="190" y2="420" stroke="#2a303c" stroke-width="6"/><line x1="120" y1="255" x2="380" y2="255" stroke="#2a303c" stroke-width="6"/>' +
    '<path d="M150 420 L350 420 L430 612 L90 612 Z" fill="#b8cde0" opacity="0.08"/>' +
    // fireplace with fire + mantel with candlestick & frame
    sh(700, 612, 240, 18, 0.35) +
    '<rect x="540" y="250" width="330" height="362" fill="#4a4f59"/><rect x="560" y="290" width="290" height="322" fill="#20242b"/>' +
    '<rect x="530" y="238" width="350" height="24" fill="#5a606b"/><rect x="544" y="560" width="322" height="20" fill="#5a606b"/>' +
    '<path d="M600 612 C590 560 640 560 635 520 C680 570 700 590 690 612 Z" fill="url(#fire)"/>' +
    '<path d="M680 612 C670 570 720 580 715 545 C760 590 770 600 760 612 Z" fill="url(#fire)" opacity="0.85"/>' +
    '<circle cx="668" cy="596" r="10" fill="#2b2f36"/><circle cx="700" cy="600" r="8" fill="#2b2f36"/>' +
    '<path d="M600 612 L770 612" stroke="#15181d" stroke-width="8"/>' +
    '<rect x="640" y="180" width="10" height="58" fill="#e8e0c8"/><path d="M645 174 C637 162 649 154 645 146 C655 156 653 168 645 174 Z" fill="#f5a23c"/>' +
    '<rect x="800" y="170" width="56" height="68" fill="#2e2836" stroke="#8a6d3f" stroke-width="5"/><circle cx="828" cy="196" r="14" fill="#8a7a68"/>' +
    // chandelier with candles
    '<line x1="1050" y1="0" x2="1050" y2="120" stroke="#15181d" stroke-width="5"/>' +
    '<path d="M950 160 C990 130 1110 130 1150 160" stroke="#8a6d3f" stroke-width="7" fill="none"/>' +
    '<line x1="1050" y1="120" x2="1050" y2="160" stroke="#8a6d3f" stroke-width="7"/>' +
    (function () { var s = ''; var xs = [950, 1000, 1050, 1100, 1150]; for (var i = 0; i < xs.length; i++) { s += '<line x1="' + xs[i] + '" y1="160" x2="' + xs[i] + '" y2="205" stroke="#8a6d3f" stroke-width="5"/>' + '<rect x="' + (xs[i] - 4) + '" y="205" width="8" height="22" fill="#e8e0c8"/>' + '<ellipse cx="' + xs[i] + '" cy="200" rx="7" ry="10" fill="#f5a23c" opacity="0.9"/>'; } return s; })() +
    '<ellipse cx="1050" cy="612" rx="220" ry="40" fill="#f5d98a" opacity="0.07"/>' +
    // portraits, tilted
    '<ellipse cx="500" cy="200" rx="72" ry="95" fill="#262c38" stroke="#8a6d3f" stroke-width="8" transform="rotate(-2 500 200)"/>' +
    '<circle cx="500" cy="175" r="25" fill="#8a7a68" transform="rotate(-2 500 200)"/><path d="M464 258 C470 214 530 214 536 258 Z" fill="#3a3245" transform="rotate(-2 500 200)"/>' +
    '<ellipse cx="880" cy="200" rx="72" ry="95" fill="#262c38" stroke="#8a6d3f" stroke-width="8" transform="rotate(2 880 200)"/>' +
    '<circle cx="880" cy="175" r="25" fill="#8a7a68" transform="rotate(2 880 200)"/><path d="M844 258 C850 214 910 214 916 258 Z" fill="#4a3245" transform="rotate(2 880 200)"/>' +
    // grandfather clock w/ pendulum + cobwebs + suit of armor suggestion
    '<rect x="1330" y="250" width="100" height="362" rx="10" fill="#33261a"/><path d="M1345 250 L1415 250 L1408 215 L1352 215 Z" fill="#33261a"/>' +
    '<circle cx="1380" cy="310" r="36" fill="#d8c9a5"/><path d="M1380 310 L1380 286 M1380 310 L1396 318" stroke="#33261a" stroke-width="3"/>' +
    '<rect x="1360" y="380" width="40" height="180" fill="#241a10"/><line x1="1380" y1="380" x2="1390" y2="470" stroke="#8a6d3f" stroke-width="4"/><circle cx="1391" cy="474" r="10" fill="#8a6d3f"/>' +
    '<path d="M1440 70 L1440 200 M1400 90 L1480 130 M1400 130 L1480 90 M1380 70 C1420 120 1460 120 1500 70" stroke="#9aa4b0" stroke-width="2" opacity="0.45" fill="none"/>' +
    '<rect x="90" y="330" width="46" height="282" fill="#565f6b"/><circle cx="113" cy="310" r="16" fill="#565f6b"/><rect x="76" y="352" width="74" height="14" rx="7" fill="#4a525d"/><rect x="76" y="430" width="74" height="14" rx="7" fill="#4a525d"/><rect x="94" y="612" width="38" height="16" fill="#3a4149"/>' +
    // covered furniture + plant + dust
    sh(1060, 660, 90, 12, 0.25) +
    '<path d="M1000 600 C1000 520 1130 520 1130 600 L1130 660 L1000 660 Z" fill="#d8d2c2"/><path d="M1012 600 C1040 560 1090 562 1118 600" stroke="#b8b2a2" stroke-width="4" fill="none"/>' +
    '<path d="M200 560 C200 535 250 535 250 560 L254 612 L196 612 Z" fill="#8a4a3a"/>' +
    '<path d="M160 560 C175 510 200 520 200 552 M240 548 C255 505 275 515 272 548 M200 545 C210 500 235 505 235 540" stroke="#3a6a3a" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    tent(470, 850, '2') + tent(1180, 640, '4') +
    dust([[240, 180, 2], [420, 300, 2.5], [640, 220, 2], [980, 380, 2.5], [1240, 200, 2], [1320, 480, 2], [760, 420, 2]]) +
    shade,

  Scenarios.decor.lab = defs() +
    // bright walls, fluorescent panels, tiled skirting
    '<rect width="1600" height="70" fill="#c2c9d2"/><line x1="0" y1="70" x2="1600" y2="70" stroke="#aab2bd" stroke-width="5"/>' +
    '<rect y="70" width="1600" height="540" fill="#dfe4ea"/>' +
    '<defs><pattern id="walltile" width="80" height="80" patternUnits="userSpaceOnUse">' +
    '<rect width="80" height="80" fill="none" stroke="#d2d8de" stroke-width="2"/></pattern></defs>' +
    '<rect y="70" width="1600" height="540" fill="url(#walltile)"/>' +
    '<rect y="596" width="1600" height="16" fill="#aab4c0"/>' +
    '<rect y="612" width="1600" height="288" fill="#aab4c0"/>' +
    '<defs><pattern id="floortile" width="150" height="46" patternUnits="userSpaceOnUse">' +
    '<rect width="150" height="46" fill="none" stroke="#96a0ac" stroke-width="2"/></pattern></defs>' +
    '<rect y="612" width="1600" height="288" fill="url(#floortile)"/>' +
    // fluorescent ceiling panels
    (function () { var s = ''; var xs = [150, 560, 970, 1380]; for (var i = 0; i < xs.length; i++) { s += '<rect x="' + xs[i] + '" y="6" width="220" height="30" rx="6" fill="#eef2f6" stroke="#aab2bd" stroke-width="3"/>' + '<path d="M' + xs[i] + ' 36 L' + (xs[i] - 40) + ' 300 L' + (xs[i] + 260) + ' 300 L' + (xs[i] + 220) + ' 36 Z" fill="url(#lightcone)" opacity="0.7"/>'; } return s; })() +
    // fume hood with glass and shelves of bottles
    sh(400, 640, 260, 16, 0.25) +
    '<rect x="160" y="220" width="480" height="400" fill="#8a93a1"/><rect x="180" y="240" width="440" height="360" fill="#5d6672"/>' +
    '<rect x="195" y="255" width="410" height="200" fill="#bfe0ef" opacity="0.35" stroke="#8a93a1" stroke-width="4"/>' +
    '<rect x="195" y="470" width="410" height="115" fill="#3a4149"/>' +
    (function () { var s = ''; var cols = ['#5f9e4e', '#c94f4f', '#e2a23c', '#7ba7c9', '#8a5aa8', '#5f9e8e']; for (var i = 0; i < 6; i++) { s += '<rect x="' + (215 + i * 62) + '" y="' + (380 - (i % 3) * 16) + '" width="20" height="' + (60 + (i % 3) * 16) + '" rx="6" fill="' + cols[i] + '" opacity="0.85"/>' + '<rect x="' + (217 + i * 62) + '" y="' + (372 - (i % 3) * 16) + '" width="16" height="10" fill="#3a4149"/>'; } return s; })() +
    '<rect x="210" y="480" width="380" height="8" fill="#565f6b"/>' +
    // microscope + folders on bench
    '<rect x="240" y="410" width="60" height="40" rx="6" fill="#454b54"/><path d="M262 410 C262 380 290 380 290 402" stroke="#454b54" stroke-width="10" fill="none"/>' +
    (function () { var s = ''; var cols = ['#c94f4f', '#e2a23c', '#5f9e4e']; for (var i = 0; i < 3; i++) s += '<path d="M340 ' + (448 - i * 8) + ' l80 -6 l4 ' + (22 + i * 8) + ' l-82 6 Z" fill="' + cols[i] + '"/>'; return s; })() +
    // central bench with beakers + glow
    sh(1000, 660, 300, 18, 0.22) +
    '<rect x="760" y="450" width="500" height="26" fill="#8a93a1"/><rect x="790" y="476" width="26" height="150" fill="#6f7885"/><rect x="1200" y="476" width="26" height="150" fill="#6f7885"/>' +
    '<ellipse cx="1010" cy="450" rx="80" ry="12" fill="#bfe0ef" stroke="#8a93a1" stroke-width="3"/><path d="M1010 415 L1010 438" stroke="#8a93a1" stroke-width="5"/><circle cx="1010" cy="405" r="12" fill="#9fd8e8" opacity="0.85"/>' +
    '<rect x="850" y="398" width="26" height="52" rx="7" fill="#cfe6d8" stroke="#8fb6a8" stroke-width="3"/><rect x="905" y="386" width="30" height="64" rx="8" fill="#e8c8d8" stroke="#b88aa8" stroke-width="3"/>' +
    '<rect x="1090" y="402" width="24" height="48" rx="6" fill="#f5d98a" opacity="0.8" stroke="#b89a4a" stroke-width="3"/>' +
    // evidence lockers
    (function () { var s = ''; for (var i = 0; i < 4; i++) { s += '<rect x="' + (1350 + (i % 2) * 110) + '" y="' + (300 + Math.floor(i / 2) * 150) + '" width="100" height="140" rx="6" fill="#5d6672" stroke="#454b54" stroke-width="4"/>' + '<rect x="' + (1358 + (i % 2) * 110) + '" y="' + (308 + Math.floor(i / 2) * 150) + '" width="84" height="124" rx="4" fill="none" stroke="#454b54" stroke-width="3"/>' + '<circle cx="' + (1428 + (i % 2) * 110) + '" cy="' + (378 + Math.floor(i / 2) * 150) + '" r="5" fill="#c9a24b"/>'; } return s; })() +
    // chalk outline + evidence tents + spilled files
    '<path d="M420 720 C420 690 470 690 470 720 C470 735 455 742 445 742 L445 800 C445 815 425 815 425 800 L425 742 C432 742 420 735 420 720 Z" fill="none" stroke="#eef2f6" stroke-width="6" transform="rotate(8 445 750)"/>' +
    '<path d="M480 780 L560 760" stroke="#eef2f6" stroke-width="5" stroke-dasharray="14 10" opacity="0.7"/>' +
    tent(520, 660, '1') + tent(960, 700, '2') + tent(1300, 780, '3') +
    '<path d="M700 740 l80 -10 l6 50 l-82 8 Z" fill="#e8e0c8"/><path d="M1150 780 l70 8 l-6 40 l-68 -10 Z" fill="#efe7cf"/>' +
    // warning tape across the scene
    '<rect x="0" y="540" width="1600" height="26" fill="#e8c33c" transform="rotate(-1.5 800 553)"/>' +
    '<text x="400" y="559" font-size="18" font-family="monospace" font-weight="bold" fill="#1c1a12" transform="rotate(-1.5 800 553)">— CRIME SCENE — DO NOT CROSS —</text>' +
    '<text x="1050" y="559" font-size="18" font-family="monospace" font-weight="bold" fill="#1c1a12" transform="rotate(-1.5 800 553)">CRIME SCENE — DO NOT CROSS —</text>' +
    // anatomy poster
    '<rect x="1150" y="120" width="220" height="150" rx="6" fill="#f4f6f8" stroke="#96a0ac" stroke-width="4"/>' +
    '<ellipse cx="1260" cy="160" rx="16" ry="20" fill="none" stroke="#b8c4d0" stroke-width="4"/>' +
    '<path d="M1260 180 L1260 230 M1235 200 L1285 200 M1260 230 L1242 262 M1260 230 L1278 262" stroke="#b8c4d0" stroke-width="4" fill="none"/>' +
    dust([[300, 150, 2], [700, 200, 2], [1100, 340, 2], [1450, 220, 2]]) +
    shade;

  // hotel references a mirror gradient defined inline above; nothing else to fix
})();
