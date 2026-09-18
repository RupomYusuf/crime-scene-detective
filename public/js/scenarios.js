/*
 * Shared scenario definitions — loaded by both the Node server (element
 * generation) and the browser (scene rendering + icons).
 * UMD-style wrapper so it works in both environments.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Scenarios = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Every icon is inner SVG drawn in a 24x24 viewBox.
  var ITEMS = [
    { id: 'knife',     name: 'Kitchen Knife',   icon: '<path d="M3 4 L14 12 L12 15 L4 8 Z" fill="#c8ccd4"/><rect x="12" y="13" width="9" height="3.4" rx="1.6" transform="rotate(33 12 13)" fill="#5b3a24"/><path d="M3 4 L8 7.6" stroke="#f2f4f8" stroke-width="1"/>' },
    { id: 'revolver',  name: 'Revolver',        icon: '<rect x="4" y="10" width="14" height="4" rx="1" fill="#4a4f57"/><path d="M16 10 L22 11 L22 13 L16 13 Z" fill="#3a3e45"/><rect x="7" y="13" width="4" height="6" rx="1" transform="rotate(12 7 13)" fill="#5b3a24"/><circle cx="10" cy="12" r="1.4" fill="#22252a"/>' },
    { id: 'casing',    name: 'Bullet Casing',   icon: '<rect x="9" y="7" width="6" height="12" rx="1" fill="#c9a24b"/><rect x="9" y="7" width="6" height="3" rx="1" fill="#8a6d2f"/><ellipse cx="12" cy="19" rx="3" ry="1.2" fill="#a3823a"/>' },
    { id: 'key',       name: 'Brass Key',       icon: '<circle cx="8" cy="9" r="4.4" fill="none" stroke="#c9a24b" stroke-width="2.4"/><rect x="11" y="8" width="10" height="2.6" fill="#c9a24b"/><rect x="17" y="10.6" width="2.2" height="3.4" fill="#c9a24b"/><rect x="20" y="10.6" width="2" height="2.6" fill="#c9a24b"/>' },
    { id: 'photo',     name: 'Evidence Photo',  icon: '<rect x="4" y="5" width="16" height="14" rx="1" fill="#e8e4da"/><rect x="6" y="7" width="12" height="8" fill="#7c8794"/><path d="M6 15 L10 10 L13 13 L16 9 L18 12 L18 15 Z" fill="#5b6a7a"/><circle cx="9" cy="9" r="1.2" fill="#e8e4da"/><rect x="6" y="16.4" width="8" height="1.2" fill="#b9b2a2"/>' },
    { id: 'note',      name: 'Witness Note',    icon: '<rect x="5" y="4" width="14" height="16" rx="1" fill="#f3ecd8" transform="rotate(-4 12 12)"/><path d="M7.5 8 L16.5 7.4 M7.6 11 L16.6 10.4 M7.7 14 L14 13.6" stroke="#8a86b8" stroke-width="1.1" transform="rotate(-4 12 12)"/><path d="M17 15 L21 19" stroke="#5b3a24" stroke-width="1.6"/>' },
    { id: 'wallet',    name: 'Stolen Wallet',   icon: '<rect x="4" y="7" width="16" height="11" rx="2" fill="#6b4226"/><rect x="13" y="10" width="7" height="5" rx="1.2" fill="#7d4f2d"/><circle cx="16.5" cy="12.5" r="1" fill="#d8b04a"/><rect x="4" y="9" width="16" height="1" fill="#4c2f1b"/>' },
    { id: 'glove',     name: 'Leather Glove',   icon: '<path d="M8 20 L8 12 C8 8 10 4 12 4 C14 4 15 6 15 9 L15 12 L17 11 C18.6 10.4 19.6 12 18.4 13.2 L14 17 L14 20 Z" fill="#3d2b1f"/><path d="M8 20 L14 20" stroke="#241811" stroke-width="1.4"/>' },
    { id: 'fingerprint', name: 'Fingerprint',   icon: '<g fill="none" stroke="#2b2f36" stroke-width="1.3" stroke-linecap="round"><path d="M12 20 C7 20 6 15 6 12 C6 7 9 4 12 4 C15 4 18 7 18 12 C18 15 17 20 12 20"/><path d="M12 17 C9.4 17 9 14 9 12 C9 9 10.4 7.4 12 7.4 C13.6 7.4 15 9 15 12 C15 14 14.6 17 12 17"/><path d="M12 14 C11 14 11.4 11 12 11 C12.8 11 12.8 14 12 14"/></g>' },
    { id: 'lighter',   name: 'Silver Lighter',  icon: '<rect x="8" y="9" width="8" height="12" rx="2" fill="#aeb6c2"/><rect x="8" y="6" width="8" height="4" rx="1" fill="#8a93a1"/><path d="M12 5 C10.6 3 11.6 1.6 12 1 C12.4 1.6 13.4 3 12 5 Z" fill="#e2a23c"/>' },
    { id: 'rope',      name: 'Cut Rope',        icon: '<g fill="none" stroke="#b08d57" stroke-width="2.2" stroke-linecap="round"><path d="M4 16 C7 10 11 9 13 12 C15 15 19 14 20 9"/><path d="M4 19 C8 14 12 13 14 16"/></g><path d="M19 6 L21 12" stroke="#8a6d3f" stroke-width="2.2" stroke-linecap="round"/>' },
    { id: 'vial',      name: 'Poison Vial',     icon: '<path d="M10 3 L14 3 L14 8 L16 11 L16 20 C16 21 15.4 21.6 14.4 21.6 L9.6 21.6 C8.6 21.6 8 21 8 20 L8 11 L10 8 Z" fill="#cfd6de" opacity="0.85"/><rect x="8.6" y="13" width="6.8" height="7.6" rx="1" fill="#5f9e4e"/><rect x="9.4" y="2" width="5.2" height="2.4" rx="0.8" fill="#3a3e45"/>' },
    { id: 'matchbook', name: 'Matchbook',       icon: '<rect x="5" y="6" width="14" height="13" rx="1" fill="#7a4a3a"/><rect x="5" y="6" width="14" height="4" fill="#c8b48a"/><rect x="7" y="12" width="10" height="1.6" fill="#d8c9a5"/><rect x="7" y="15" width="10" height="1.6" fill="#d8c9a5"/>' },
    { id: 'watch',     name: 'Pocket Watch',    icon: '<circle cx="12" cy="13" r="7" fill="#c8ccd4"/><circle cx="12" cy="13" r="5" fill="#f2f4f8"/><path d="M12 13 L12 9.4 M12 13 L14.6 14.6" stroke="#2b2f36" stroke-width="1.2" stroke-linecap="round"/><rect x="10.6" y="3.6" width="2.8" height="2.6" rx="0.8" fill="#8a93a1"/><circle cx="12" cy="4" r="1.2" fill="#8a93a1"/>' },
    { id: 'ring',      name: 'Diamond Ring',    icon: '<circle cx="12" cy="14" r="5.6" fill="none" stroke="#d8b04a" stroke-width="2.4"/><path d="M9 8 L12 4.6 L15 8 L12 10.6 Z" fill="#bcd8e8" stroke="#8fb6cc" stroke-width="0.8"/>' },
    { id: 'usb',       name: 'USB Drive',       icon: '<rect x="4" y="9" width="11" height="7" rx="1.6" fill="#3a3e45"/><rect x="15" y="10" width="6" height="5" fill="#c8ccd4"/><rect x="17" y="11" width="1.4" height="1.4" fill="#3a3e45"/><rect x="19.4" y="11" width="1.4" height="1.4" fill="#3a3e45"/>' },
    { id: 'diary',     name: "Victim's Diary",  icon: '<rect x="5" y="4" width="15" height="17" rx="1.6" fill="#5b3a24"/><rect x="8" y="4" width="1.6" height="17" fill="#3d2716"/><path d="M11 9 L18 9 M11 12 L18 12 M11 15 L16 15" stroke="#d8c9a5" stroke-width="1.1"/><rect x="16" y="16.6" width="6" height="2.4" rx="1" fill="#c9a24b"/>' },
    { id: 'magnifier', name: 'Magnifying Glass',icon: '<circle cx="10.5" cy="10" r="6" fill="#bfe0ef" opacity="0.6" stroke="#8a93a1" stroke-width="2"/><path d="M15 14.8 L20.6 20.4" stroke="#5b3a24" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'fedora',    name: "Suspect's Hat",   icon: '<ellipse cx="12" cy="16" rx="10" ry="3" fill="#4a3b8f"/><path d="M7 15 C7 8 9 5 12 5 C15 5 17 8 17 15 Z" fill="#5b4aa8"/><path d="M7 13.4 C9 14.6 15 14.6 17 13.4 L17 15 C15 16 9 16 7 15 Z" fill="#2e255e"/>' },
    { id: 'bootprint', name: 'Muddy Boot Print',icon: '<ellipse cx="9" cy="16.6" rx="4" ry="4.6" fill="#5b4632"/><ellipse cx="9" cy="7.6" rx="2.6" ry="3.4" fill="#5b4632"/><path d="M16.4 20.6 C14 19 14.4 14 16.4 12.4 C18 11.2 19.6 12.4 19.6 15 C19.6 18 18.6 21 16.4 20.6 Z" fill="#4a3826"/>' },
    { id: 'phone',     name: 'Smashed Phone',   icon: '<rect x="7" y="3" width="10" height="18" rx="2" fill="#2b2f36"/><rect x="8.4" y="5" width="7.2" height="13" fill="#4d5560"/><path d="M9 7 L15 12 M10 14 L14 17" stroke="#181b20" stroke-width="1.2"/><circle cx="12" cy="19.4" r="0.9" fill="#4d5560"/>' },
    { id: 'envelope',  name: 'Threat Letter',   icon: '<rect x="4" y="7" width="16" height="11" rx="1" fill="#f3ecd8"/><path d="M4 8 L12 14 L20 8" fill="none" stroke="#c2b8a0" stroke-width="1.4"/><path d="M9 16.5 L18 16.5" stroke="#a33b3b" stroke-width="1.6"/>' },
    { id: 'map',       name: 'Marked Map',      icon: '<rect x="4" y="5" width="16" height="15" rx="1" fill="#e8e0c8"/><path d="M8 5 L8 20 M12 5 L12 20 M16 5 L16 20" stroke="#c2b8a0" stroke-width="1"/><path d="M6 16 C9 12 12 17 15 10 L18 8" fill="none" stroke="#a33b3b" stroke-width="1.4" stroke-dasharray="2.4 1.8"/><circle cx="18" cy="8" r="1.4" fill="#a33b3b"/>' },
    { id: 'fabric',    name: 'Torn Fabric',     icon: '<path d="M5 8 L10 5 L13 8 L16 5 L19 9 L17 13 L19 18 L13 16 L8 19 L9 13 Z" fill="#7a4a6a"/><path d="M8 11 L15 12" stroke="#5c3650" stroke-width="1.2"/>' },
    { id: 'syringe',   name: 'Syringe',         icon: '<rect x="8" y="6" width="9" height="4.4" rx="0.8" transform="rotate(45 12 8)" fill="#cfd6de"/><path d="M9 15 L15 9" stroke="#5f9e4e" stroke-width="2.4"/><path d="M14.6 9.4 L19.6 4.4" stroke="#8a93a1" stroke-width="1.6"/><path d="M18.6 2 L22 5.4" stroke="#8a93a1" stroke-width="1.6"/>' },
    { id: 'cigarette', name: 'Cigarette Butt',  icon: '<rect x="4" y="11" width="13" height="3" rx="1" fill="#f3ecd8" transform="rotate(-18 12 12)"/><rect x="4.6" y="11.2" width="4.6" height="2.8" rx="1" transform="rotate(-18 12 12)" fill="#d8a24b"/><ellipse cx="17.6" cy="8.2" rx="1.6" ry="1.2" transform="rotate(-18 17 9)" fill="#e2633c"/><path d="M17 6 C16.4 4.6 17.4 4 17.6 3.4 C18.2 4.4 18.8 5 17 6 Z" fill="#e2a23c"/>' },
    { id: 'candle',    name: 'Burnt Candle',    icon: '<rect x="9.6" y="9" width="4.8" height="12" rx="1" fill="#e8e0c8"/><path d="M9.6 9 C9.6 6 14.4 6 14.4 9 Z" fill="#d8c9a5"/><rect x="11.6" y="6.6" width="0.8" height="2.4" fill="#2b2f36"/><path d="M12 5.4 C10.8 4 12.4 2.6 12 1.4 C13.6 2.6 13.4 4.4 12 5.4 Z" fill="#e2a23c"/><ellipse cx="12" cy="21.4" rx="3.4" ry="1.2" fill="#c2b8a0"/>' }
  ];

  // Scene decor painters. Each returns inner SVG for a 1600x900 stage.
  var wall = function (c1, c2, floor) {
    return '<rect width="1600" height="620" fill="' + c1 + '"/>' +
      '<rect y="620" width="1600" height="280" fill="' + floor + '"/>' +
      '<rect y="600" width="1600" height="30" fill="' + c2 + '"/>';
  };
  var plankFloor = function (base, line) {
    var s = '<rect y="620" width="1600" height="280" fill="' + base + '"/>';
    for (var i = 0; i < 7; i++) s += '<line x1="0" y1="' + (650 + i * 38) + '" x2="1600" y2="' + (650 + i * 38) + '" stroke="' + line + '" stroke-width="2"/>';
    for (var j = 0; j < 9; j++) s += '<line x1="' + (90 + j * 190) + '" y1="620" x2="' + (30 + j * 190) + '" y2="900" stroke="' + line + '" stroke-width="2"/>';
    return s;
  };
  var tileFloor = function (base, line) {
    var s = '<rect y="620" width="1600" height="280" fill="' + base + '"/>';
    for (var i = 0; i < 6; i++) s += '<line x1="0" y1="' + (666 + i * 46) + '" x2="1600" y2="' + (666 + i * 46) + '" stroke="' + line + '" stroke-width="2"/>';
    for (var j = 0; j < 12; j++) s += '<line x1="' + (j * 150) + '" y1="620" x2="' + (j * 150) + '" y2="900" stroke="' + line + '" stroke-width="2"/>';
    return s;
  };

  var DECOR = {
    office: wall('#4f5a66', '#39434d', '') + plankFloor('#5b4a36', '#4a3b2a') +
      // window with rain + city
      '<rect x="120" y="80" width="300" height="240" rx="6" fill="#202b38" stroke="#2f3945" stroke-width="10"/>' +
      '<rect x="150" y="110" width="60" height="50" fill="#f5d98a" opacity="0.5"/><rect x="240" y="150" width="70" height="60" fill="#f5d98a" opacity="0.35"/><rect x="340" y="100" width="50" height="80" fill="#f5d98a" opacity="0.4"/>' +
      '<path d="M140 120 l14 26 M200 90 l14 26 M290 140 l14 26 M370 110 l14 26 M240 200 l14 26 M330 240 l14 26" stroke="#7f97ad" stroke-width="2" opacity="0.7"/>' +
      // desk, tipped chair, drawers pulled out, papers
      '<rect x="620" y="420" width="520" height="26" fill="#6d5236"/><rect x="650" y="446" width="26" height="180" fill="#573f28"/><rect x="1090" y="446" width="26" height="180" fill="#573f28"/>' +
      '<rect x="660" y="450" width="180" height="120" fill="#7a5c3d"/><rect x="700" y="470" width="90" height="60" fill="#573f28"/><rect x="880" y="450" width="180" height="120" fill="#7a5c3d"/><rect x="920" y="470" width="90" height="60" fill="#573f28"/>' +
      '<rect x="905" y="430" width="70" height="18" fill="#8a6a48"/>' +
      '<path d="M480 640 l90 -12 l8 60 l-92 10 Z" fill="#e8e0c8"/><path d="M560 700 l80 6 l-4 40 l-78 -8 Z" fill="#e0d6ba"/><path d="M760 660 l70 20 l-20 40 l-64 -24 Z" fill="#efe7cf"/>' +
      '<path d="M1210 620 C1180 660 1180 720 1220 760 M1250 610 C1230 650 1236 720 1260 770" stroke="#3a4a3a" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      // lamp light pool
      '<ellipse cx="1300" cy="360" rx="240" ry="180" fill="#f5d98a" opacity="0.10"/>' +
      '<rect x="1240" y="200" width="16" height="130" fill="#2b2f36"/><path d="M1180 200 L1316 200 L1290 150 L1206 150 Z" fill="#3f4750"/><ellipse cx="1248" cy="336" rx="60" ry="16" fill="#f5d98a" opacity="0.5"/>' +
      '<path d="M40 640 l60 8 M100 800 l70 -10 M1450 700 l60 8" stroke="#4a3b2a" stroke-width="3" opacity="0.6"/>',
    hotel: wall('#6b5a70', '#514356', '') + tileFloor('#7a6a58', '#665844') +
      // bed
      '<rect x="180" y="430" width="520" height="200" rx="14" fill="#7a4a4a"/><rect x="180" y="400" width="520" height="50" rx="14" fill="#8a5a5a"/><rect x="210" y="380" width="130" height="60" rx="12" fill="#e8e0d0"/><rect x="360" y="385" width="130" height="58" rx="12" fill="#efe7d8"/><rect x="180" y="630" width="30" height="60" fill="#5a3a3a"/><rect x="670" y="630" width="30" height="60" fill="#5a3a3a"/>' +
      '<path d="M300 470 C420 455 520 465 680 452" stroke="#b04545" stroke-width="14" opacity="0.55" fill="none"/>' +
      // window + curtains
      '<rect x="900" y="90" width="280" height="220" rx="6" fill="#1f2a36" stroke="#3a3140" stroke-width="10"/>' +
      '<rect x="930" y="120" width="70" height="46" fill="#f5d98a" opacity="0.4"/><rect x="1050" y="170" width="80" height="56" fill="#f5d98a" opacity="0.3"/>' +
      '<path d="M880 70 C870 220 880 340 870 480 L920 480 C915 340 925 220 918 70 Z" fill="#7a3f5a"/><path d="M1140 70 C1150 220 1140 340 1150 480 L1100 480 C1105 340 1095 220 1102 70 Z" fill="#7a3f5a"/>' +
      // dresser with mirror, spilled bag
      '<rect x="1080" y="430" width="360" height="150" fill="#5a4358"/><rect x="1110" y="455" width="130" height="45" rx="4" fill="#6f5570"/><rect x="1280" y="455" width="130" height="45" rx="4" fill="#6f5570"/><circle cx="1175" cy="478" r="6" fill="#d8b04a"/><circle cx="1345" cy="478" r="6" fill="#d8b04a"/>' +
      '<ellipse cx="1260" cy="330" rx="80" ry="90" fill="#2e2836" stroke="#c2a24b" stroke-width="6"/>' +
      '<path d="M300 760 C340 720 420 730 430 780 M520 780 C560 740 640 750 650 790" stroke="#665844" stroke-width="3" fill="none" opacity="0.7"/>' +
      '<ellipse cx="820" cy="700" rx="90" ry="34" fill="#4a3550"/><ellipse cx="820" cy="700" rx="60" ry="20" fill="#3a2a40"/>',
    mansion: wall('#3a3f4a', '#2b2f38', '') + plankFloor('#4a3a2c', '#3a2c20') +
      // tall windows, moonlight shafts
      '<rect x="140" y="60" width="130" height="320" rx="60" fill="#141c28" stroke="#262c38" stroke-width="10"/><rect x="320" y="60" width="130" height="320" rx="60" fill="#141c28" stroke="#262c38" stroke-width="10"/>' +
      '<circle cx="205" cy="150" r="34" fill="#dfe8f2" opacity="0.8"/><path d="M205 130 C230 118 240 150 205 150 C180 152 186 128 205 130" fill="#b8c6d6" opacity="0.7"/>' +
      '<path d="M160 380 L340 380 L420 620 L100 620 Z" fill="#b8cde0" opacity="0.07"/>' +
      // portraits
      '<ellipse cx="640" cy="180" rx="70" ry="90" fill="#262c38" stroke="#8a6d3f" stroke-width="8"/><circle cx="640" cy="155" r="24" fill="#8a7a68"/><path d="M604 235 C610 195 670 195 676 235 Z" fill="#3a3245"/>' +
      '<ellipse cx="840" cy="180" rx="70" ry="90" fill="#262c38" stroke="#8a6d3f" stroke-width="8"/><circle cx="840" cy="155" r="24" fill="#8a7a68"/><path d="M804 235 C810 195 870 195 876 235 Z" fill="#4a3245"/>' +
      // cobwebs, grandfather clock, covered furniture
      '<path d="M1440 40 L1440 160 M1400 60 L1480 100 M1400 100 L1480 60 M1380 40 C1420 90 1460 90 1500 40" stroke="#9aa4b0" stroke-width="2" opacity="0.5" fill="none"/>' +
      '<rect x="1330" y="300" width="90" height="320" rx="10" fill="#33261a"/><circle cx="1375" cy="360" r="34" fill="#d8c9a5"/><path d="M1375 360 L1375 338 M1375 360 L1390 368" stroke="#33261a" stroke-width="3"/><path d="M1345 300 L1405 300 L1398 270 L1352 270 Z" fill="#33261a"/>' +
      '<path d="M1000 560 C1000 480 1120 480 1120 560 L1120 620 L1000 620 Z" fill="#d8d2c2"/><path d="M1010 560 C1040 520 1080 522 1110 560" stroke="#b8b2a2" stroke-width="4" fill="none"/>' +
      // candelabra
      '<path d="M620 620 L620 520 M580 540 L660 540 M580 540 L580 510 M620 530 L620 500 M660 540 L660 510" stroke="#8a6d3f" stroke-width="8" stroke-linecap="round"/>' +
      '<ellipse cx="580" cy="504" rx="8" ry="12" fill="#f5d98a"/><ellipse cx="620" cy="494" rx="8" ry="12" fill="#f5d98a"/><ellipse cx="660" cy="504" rx="8" ry="12" fill="#f5d98a"/>' +
      '<ellipse cx="620" cy="640" rx="130" ry="26" fill="#f5d98a" opacity="0.06"/>',
    lab: wall('#dfe4ea', '#c6ccd4', '') + tileFloor('#aab4c0', '#96a0ac') +
      // benches
      '<rect x="100" y="470" width="600" height="24" fill="#8a93a1"/><rect x="130" y="494" width="24" height="140" fill="#6f7885"/><rect x="640" y="494" width="24" height="140" fill="#6f7885"/>' +
      '<rect x="160" y="500" width="200" height="130" fill="#c6ccd4" stroke="#96a0ac" stroke-width="3"/>' +
      '<path d="M170 610 C170 570 200 570 200 610 C200 640 170 640 170 610 Z" fill="#bfe0ef" opacity="0.8"/><rect x="230" y="560" width="26" height="70" rx="6" fill="#cfe6d8" stroke="#8fb6a8" stroke-width="3"/><rect x="280" y="545" width="30" height="85" rx="8" fill="#e8c8d8" stroke="#b88aa8" stroke-width="3"/>' +
      '<rect x="980" y="440" width="520" height="24" fill="#8a93a1"/><rect x="1010" y="464" width="24" height="170" fill="#6f7885"/><rect x="1450" y="464" width="24" height="170" fill="#6f7885"/>' +
      '<ellipse cx="1200" cy="440" rx="90" ry="14" fill="#bfe0ef" opacity="0.8" stroke="#8a93a1" stroke-width="3"/><path d="M1200 400 L1200 428" stroke="#8a93a1" stroke-width="6"/><circle cx="1200" cy="392" r="14" fill="#9fd8e8" opacity="0.8"/>' +
      // periodic table poster, body outline
      '<rect x="1200" y="80" width="280" height="200" rx="6" fill="#f4f6f8" stroke="#96a0ac" stroke-width="4"/>' +
      '<g fill="#b8c4d0">' +
      (function () { var c = ''; for (var r = 0; r < 4; r++) for (var k = 0; k < 8; k++) c += '<rect x="' + (1216 + k * 32) + '" y="' + (100 + r * 44) + '" width="26" height="34" rx="3"/>'; return c; })() +
      '</g>' +
      '<path d="M420 720 C420 690 470 690 470 720 C470 735 455 742 445 742 L445 800 C445 815 425 815 425 800 L425 742 C432 742 420 735 420 720 Z" fill="none" stroke="#e2e6ea" stroke-width="6" transform="rotate(8 445 750)"/>' +
      '<ellipse cx="820" cy="740" rx="150" ry="60" fill="#f5d98a" opacity="0.15"/><ellipse cx="820" cy="740" rx="90" ry="34" fill="#f5d98a" opacity="0.15"/>'
  };

  var SCENARIOS = [
    {
      id: 'office',
      name: 'The Ransacked Office',
      desc: 'An accountant was silenced mid-audit. The office has been torn apart — the killer left in a hurry.',
      items: ['knife', 'casing', 'photo', 'note', 'wallet', 'fingerprint', 'usb', 'phone', 'envelope', 'diary', 'cigarette', 'lighter', 'glove', 'bootprint', 'key', 'matchbook', 'watch', 'magnifier']
    },
    {
      id: 'hotel',
      name: 'Hotel Room 204',
      desc: 'A guest never checked out. Room service found the door ajar and the suitcases still packed.',
      items: ['casing', 'wineglassless', 'note', 'ring', 'wallet', 'phone', 'key', 'photo', 'glove', 'envelope', 'lighter', 'cigarette', 'fabric', 'watch', 'fingerprint', 'diary', 'vial', 'matchbook']
    },
    {
      id: 'mansion',
      name: 'The Vanwick Mansion',
      desc: 'The lord of the manor is dead and the heirs are circling. Storm clouds close in on the old estate.',
      items: ['rope', 'vial', 'candle', 'knife', 'key', 'diary', 'fedora', 'magnifier', 'bootprint', 'map', 'photo', 'note', 'ring', 'fabric', 'casing', 'wallet', 'fingerprint', 'syringe']
    },
    {
      id: 'lab',
      name: 'Night Shift at the Crime Lab',
      desc: 'Evidence has been tampered with from the inside. Find what the mole could not destroy.',
      items: ['syringe', 'vial', 'usb', 'fingerprint', 'photo', 'note', 'knife', 'glove', 'phone', 'envelope', 'key', 'matchbook', 'casing', 'diary', 'magnifier', 'cigarette', 'lighter', 'bootprint']
    }
  ];

  // hotel references a wine glass flavor that doesn't exist as an icon; swap it
  SCENARIOS[1].items = SCENARIOS[1].items.map(function (id) { return id === 'wineglassless' ? 'watch' : id; });

  var itemById = {};
  ITEMS.forEach(function (it) { itemById[it.id] = it; });

  return {
    items: ITEMS,
    itemById: itemById,
    decor: DECOR,
    scenarios: SCENARIOS,
    get: function (id) {
      for (var i = 0; i < SCENARIOS.length; i++) if (SCENARIOS[i].id === id) return SCENARIOS[i];
      return SCENARIOS[0];
    },
    randomId: function () {
      return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)].id;
    }
  };
});
