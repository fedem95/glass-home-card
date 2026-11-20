/*
 * Glass Home Card — the middle of a phone home screen in one card:
 * climate, covers and solar tiles that light up when active (with animated icons),
 * the people at home with Enter/Leave buttons that follow who is looking,
 * and a row of scene buttons.
 *
 * Configured entirely from the visual editor. No templates, no card-mod.
 * MIT License — https://github.com/fedem95/glass-home-card
 */
(() => {
  const TAG = "glass-home-card";
  const VERSION = "0.7.3";
  const HOLD_MS = 600;

  const STR = {
    it: {
      home: "Casa", people: "Entra / Esci", scenes: "Scenari", all: "Tutti",
      climate: "Clima", covers: "Tapparelle", solar: "Fotovoltaico",
      heats: "riscalda", cools: "raffresca", dries: "deumidifica", idle: "fermo",
      and: "e", rooms: "stanze", open: "aperte", openOne: "aperta", allClosed: "Tutte chiuse", slit: "a fessura",
      stopped: "Fermo", today: "oggi",
      enter: "Entra", leave: "Esci", enterBox: "Entra box", leaveBox: "Esci box", running: "Giro in corso",
      gMorning: "Buongiorno", gAfternoon: "Buon pomeriggio", gEvening: "Buonasera", gNight: "Buonanotte",
      alarm: "Antifurto", athome: "a casa", away: "fuori",
      powerOut: "Manca la corrente", runtime: "autonomia", emptyDisarmed: "Nessuno in casa e antifurto spento", oneLightEmpty: "1 luce accesa a casa vuota", lightsEmpty: "{n} luci accese a casa vuota",
    },
    en: {
      home: "Home", people: "Come & go", scenes: "Scenes", all: "All",
      climate: "Climate", covers: "Covers", solar: "Solar",
      heats: "heating", cools: "cooling", dries: "drying", idle: "idle",
      and: "and", rooms: "rooms", open: "open", openOne: "open", allClosed: "All closed", slit: "ajar",
      stopped: "Idle", today: "today",
      enter: "Enter", leave: "Leave", enterBox: "Enter by car", leaveBox: "Leave by car", running: "Trip in progress",
      gMorning: "Good morning", gAfternoon: "Good afternoon", gEvening: "Good evening", gNight: "Good night",
      alarm: "Alarm", athome: "at home", away: "away",
      powerOut: "Power is out", runtime: "battery", emptyDisarmed: "Nobody home and the alarm is off", oneLightEmpty: "1 light on in an empty home", lightsEmpty: "{n} lights on in an empty home",
    },
  };

  const DEFAULTS = {
    style: "glass_light",
    show_titles: true,
    climate_entities: [],
    covers_open_entity: "",
    solar_min_power: 10,
    enter_tap_action: { action: "none" },
    box_tap_action: { action: "none" },
    show_box: true,
    activity_entities: [],
    activity_idle_state: "nessuna",
    activity_owner_entity: "",
    activity_owner_for: [],
    activity_tap_action: { action: "none" },
    scene_trigger: "hold",
    show_greeting: true,
    weather_height: 160,
  };

  /* icone disegnate a mano, animate col CSS */
  const SVG = {
    thermo: `<svg class="term" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><rect class="merc" x="9.8" y="7" width="1.4" height="9" rx=".7" fill="currentColor" stroke="none"/><circle cx="10.5" cy="17.6" r="1.9" fill="currentColor" stroke="none"/><path class="hw" d="M17 11c-.8-.8.8-1.6 0-2.4"/><path class="hw" d="M19.5 11c-.8-.8.8-1.6 0-2.4"/><path class="hw" d="M22 11c-.8-.8.8-1.6 0-2.4"/><g class="sf" stroke-width="1.5"><path d="M19.5 5v6M16.9 6.5l5.2 3M16.9 9.5l5.2-3"/></g></svg>`,
    solar: `<svg class="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path class="pan" d="M2.5 16.5h13l-2-8h-9z"/><path d="M3.4 12.5h11.2M7.6 8.5l-.8 8M10.6 8.5l.8 8M9 16.5v3.5M6 21h6"/><g class="sun" stroke-width="1.6"><circle cx="19" cy="5.5" r="2"/><path d="M19 1.3v1M19 8.7v1M14.8 5.5h1M22.2 5.5h1M16 2.5l.7.7M21.3 7.8l.7.7M16 8.5l.7-.7M21.3 3.2l.7-.7"/></g></svg>`,
    shutter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="1"/><path d="M4 7.5h16M4 12h16M2 21h20M12 17v2"/></svg>`,
    shutterClosed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="1"/><path d="M4 6.5h16M4 10h16M4 13.5h16M4 17h16M2 21h20"/></svg>`,
    enter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/><path d="M3 12h11M10 8l4 4-4 4"/></svg>`,
    leave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><path d="M10 12h11M17 8l4 4-4 4"/></svg>`,
    route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path class="dash" d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/></svg>`,
    garage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 16h10"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    drop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z"/></svg>`,
    therm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/></svg>`,
  };

  const CSS = `
:host{display:block;
  --gh-fg:var(--primary-text-color,#15171c); --gh-mut:var(--secondary-text-color,#6b7280);
  --gh-heat:#d9772f; --gh-cool:#2f72d9; --gh-sun:#c99a10; --gh-ok:#3f9b3a; --gh-blue:#2f72d9; --gh-violet:#7a5ae0; --gh-orange:#d9772f;
  --gh-r:20px; --gh-gap:14px;
  font-family:var(--ha-font-family-body, -apple-system, system-ui, sans-serif);}
.wrap[data-style^="glass"][data-scheme="light"],.wrap[data-style="apple"][data-scheme="light"]{--gh-fg:#16181d;--gh-mut:rgba(22,24,29,.58)}
.wrap[data-style^="glass"][data-scheme="dark"],.wrap[data-style="apple"][data-scheme="dark"]{--gh-fg:#f5f5f7;--gh-mut:rgba(245,245,247,.62)}
.wrap[data-scheme="dark"]{--gh-heat:#f3a76a;--gh-cool:#7fb2ff;--gh-sun:#f7d36b;--gh-ok:#8fd18a;--gh-blue:#7fb2ff;--gh-violet:#b49cff;--gh-orange:#f3a76a}
.wrap[data-compact]{--gh-gap:10px}
.wrap[data-compact] .tile{height:58px}
.wrap[data-compact] .sc{height:58px;gap:3px}
.wrap[data-compact] .ee{padding:7px 8px 7px 10px}
.wrap[data-compact] .av{width:36px;height:36px}
.wrap[data-compact] .eeb button{height:36px}
.wrap[data-compact] .sect{margin:0 2px -4px;font-size:12.5px}
.wrap[data-compact] .hi h2{font-size:27px}
.wrap[data-compact] .pill{height:32px}
.wrap[data-compact] .pill.solo{width:36px}
.wrap[data-bigee] .ee{padding:10px 10px 10px 12px}
.wrap[data-bigee] .eeb{gap:8px}
.wrap[data-bigee] .eeb button{justify-content:center;height:52px;border-radius:16px;font-size:15.5px;gap:8px;padding:0 16px}
.wrap[data-bigee] .eeb button svg{width:22px;height:22px}
.wrap[data-bigee] .av{width:40px;height:40px}
.dbg{font:11px ui-monospace,Menlo,monospace;color:var(--gh-mut);background:rgba(127,127,140,.12);border-radius:8px;padding:6px 8px;word-break:break-all}
.wrap{display:flex;flex-direction:column;gap:var(--gh-gap);color:var(--gh-fg)}
.sect{font-size:13px;font-weight:600;color:var(--gh-mut);margin:2px 2px -6px;display:flex;justify-content:space-between;align-items:center}
.sect .all{font-weight:500;cursor:pointer;padding:4px 0 4px 12px;-webkit-tap-highlight-color:transparent}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{display:flex;align-items:center;gap:11px;padding:0 14px;height:66px;border-radius:var(--gh-r);cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:background .25s,color .25s,transform .12s;min-width:0;box-sizing:border-box;position:relative}
.tile.wide{grid-column:span 2}
.tile .hum{margin-left:auto;display:flex;align-items:center;gap:4px;height:34px;padding:0 12px 0 9px;border-radius:17px;font-size:13.5px;font-weight:600;color:var(--gh-blue);background:rgba(127,127,140,.14);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;flex:none}
.tile .hum svg{width:16px;height:16px}
.tile .hum.press{transform:scale(.94)}
.tile .t{flex:1}
.tile.press,.sc.press,.eeb button.press{transform:scale(.97)}
.ico{width:30px;height:38px;display:grid;place-items:center;flex:none;position:relative;color:var(--gh-mut)}
.ico svg,.ico ha-icon{width:22px;height:22px;--mdc-icon-size:22px}
.t{min-width:0}
.n{font-weight:600;font-size:15px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v{font-size:13px;color:var(--gh-mut);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile.on .ico{color:var(--c)}

/* superfici per stile */
.wrap .surf{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
.wrap[data-scheme="light"] .surf{background:rgba(255,255,255,.38);border-color:rgba(255,255,255,.75)}
.wrap .surf.on{background:rgba(255,255,255,.78);border-color:rgba(255,255,255,.9);color:#16181d}
.wrap[data-scheme="light"] .surf.on{background:rgba(255,255,255,.92)}
.wrap .surf.on .v{color:#5b616e}
.wrap[data-style="apple"] .surf{background:rgba(120,124,140,.22);border-color:transparent;box-shadow:none}
.wrap[data-style="apple"][data-scheme="light"] .surf{background:rgba(255,255,255,.55)}
.wrap[data-style="apple"] .surf.on{background:rgba(255,255,255,.94);color:#16181d}
.wrap[data-style="glass"] .surf.on{background:color-mix(in srgb,var(--c) 16%,rgba(255,255,255,.08));border-color:color-mix(in srgb,var(--c) 40%,transparent);color:inherit}
.wrap[data-style="glass"] .surf.on .v{color:var(--gh-mut)}
.wrap[data-style="theme"] .surf{background:var(--ha-card-background,var(--card-background-color));border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color));backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:var(--ha-card-box-shadow,none)}
.wrap[data-style="theme"] .surf.on{background:color-mix(in srgb,var(--c) 12%,var(--ha-card-background,var(--card-background-color)));color:inherit}
.wrap[data-style="theme"] .surf.on .v{color:var(--gh-mut)}

/* clima animato */
.term .merc{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.55)}
.term .hw,.term .sf{opacity:0}
.tile[data-hv="heat"] .term .merc{animation:gh-up 2.4s ease-in-out infinite}
.tile[data-hv="heat"] .term .hw{animation:gh-wave 1.8s ease-out infinite}
.tile[data-hv="heat"] .term .hw:nth-of-type(2){animation-delay:.6s}
.tile[data-hv="heat"] .term .hw:nth-of-type(3){animation-delay:1.2s}
.tile[data-hv="cool"] .term .merc{animation:gh-down 2.4s ease-in-out infinite}
.tile[data-hv="cool"] .term .sf{opacity:1;transform-box:fill-box;transform-origin:center;animation:gh-spin 6s linear infinite}
/* fotovoltaico animato */
.sol .sun{opacity:0;transition:opacity .3s}
.sol .pan{fill:currentColor;fill-opacity:0}
.tile.on .sol .sun{opacity:1;transform-box:fill-box;transform-origin:center;animation:gh-spin 12s linear infinite}
.tile.on .sol .pan{animation:gh-glow 2.6s ease-in-out infinite}
@keyframes gh-up{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}
@keyframes gh-down{0%,100%{transform:scaleY(.9)}50%{transform:scaleY(.3)}}
@keyframes gh-wave{0%{opacity:0;transform:translateY(3px)}30%{opacity:1}100%{opacity:0;transform:translateY(-5px)}}
@keyframes gh-spin{to{transform:rotate(360deg)}}
@keyframes gh-glow{0%,100%{fill-opacity:.05}50%{fill-opacity:.35}}

/* persone */
.ee{display:flex;align-items:center;gap:10px;padding:10px 10px 10px 12px;border-radius:var(--gh-r)}
.ppl{display:flex;gap:6px}
.ppl .av{position:relative}
.ppl .av.front{z-index:2}
.ppl .av.behind{margin-left:-18px;z-index:1}
.av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:600;font-size:14px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#6b8cff,#8b5cf6) center/cover;box-shadow:0 0 0 2.5px rgba(255,255,255,.7),0 0 0 4.5px var(--ring);-webkit-tap-highlight-color:transparent}
.wrap[data-scheme="dark"] .av{box-shadow:0 0 0 2.5px rgba(0,0,0,.5),0 0 0 4.5px var(--ring)}
.av.p2{background-image:linear-gradient(135deg,#f59e9e,#e06c9f)}
.eeb{display:flex;gap:6px;flex:1;justify-content:flex-end}
.run{position:relative;flex:none;width:40px;height:40px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;cursor:pointer;color:var(--c);background:color-mix(in srgb,var(--c) 16%,rgba(127,127,140,.12));-webkit-tap-highlight-color:transparent;animation:run-in .4s cubic-bezier(.2,1.4,.4,1) both}
.run ha-icon{--mdc-icon-size:22px;position:relative;z-index:1}
.ee .run{margin:0 auto}
.run+.eeb{flex:none}
.run .dash{stroke-dasharray:3 3;animation:run-dash .9s linear infinite}
.run i{position:absolute;inset:0;border-radius:50%;border:2px solid var(--c);opacity:0;animation:run-ring 1.8s ease-out infinite}
.run.press{transform:scale(.94)}
@keyframes run-dash{to{stroke-dashoffset:-12}}
@keyframes run-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.55);opacity:0}}
@keyframes run-in{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.run .dash,.run i{animation:none}}
.eeb button{font:600 13.5px inherit;font-family:inherit;height:40px;border-radius:14px;border:0;padding:0 13px;display:flex;align-items:center;gap:6px;cursor:pointer;background:rgba(127,127,140,.14);color:var(--c);transition:transform .12s;-webkit-tap-highlight-color:transparent}
.eeb button svg{width:18px;height:18px}

/* scenari */
.scen{display:grid;gap:8px}
.sc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;height:68px;padding:0 4px;border-radius:18px;font-size:12px;font-weight:500;text-align:center;cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;position:relative;transition:transform .12s}
.sc ha-icon{--mdc-icon-size:22px;color:var(--c)}
.sc.cur{box-shadow:inset 0 0 0 1.5px var(--c)}
.sc .lbl{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* pressione lunga: il tasto si riempie del suo colore, con un bordo di luce che avanza */
.sc{overflow:hidden;isolation:isolate}
.sc>ha-icon,.sc>.lbl{position:relative;z-index:1;transition:transform .6s cubic-bezier(.3,.7,.4,1)}
.fill{position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;transform:scaleX(0);transform-origin:left center;
  background:linear-gradient(90deg,color-mix(in srgb,var(--c) 22%,transparent) 0%,color-mix(in srgb,var(--c) 38%,transparent) 88%,color-mix(in srgb,#fff 70%,var(--c)) 100%);
  transition:transform .22s cubic-bezier(.4,0,.2,1)}
.sc.holding .fill{transform:scaleX(1);transition:transform var(--hold,600ms) cubic-bezier(.35,.05,.6,1)}
.sc.holding>ha-icon{transform:scale(1.18)}
.sc.holding>.lbl{transform:translateY(1px)}
.sc.sent{animation:gh-sent 1.1s ease-in-out infinite}
.sc.sent .fill{transform:scaleX(1);transition:none;background:color-mix(in srgb,var(--c) 30%,transparent)}
@keyframes gh-sent{0%,100%{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--c) 70%,transparent)}50%{box-shadow:inset 0 0 0 1.5px var(--c),0 0 14px color-mix(in srgb,var(--c) 45%,transparent)}}
/* conferma: anello verde che si allarga, cerchio che rimbalza, spunta disegnata, scintille */
.ok{position:absolute;inset:0;z-index:2;border-radius:inherit;display:grid;place-items:center;pointer-events:none;animation:gh-okbox 2.2s ease forwards}
.ok .ring{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid var(--gh-ok);opacity:0;animation:gh-ring .7s .05s cubic-bezier(.2,.7,.3,1) forwards}
.ok .dot{position:relative;width:40px;height:40px;border-radius:50%;background:var(--gh-ok);color:#fff;display:grid;place-items:center;box-shadow:0 4px 16px color-mix(in srgb,var(--gh-ok) 55%,transparent);transform:scale(0);animation:gh-pop .55s cubic-bezier(.2,.9,.3,1.35) forwards}
.ok .dot svg{width:22px;height:22px;stroke-dasharray:24;stroke-dashoffset:24;animation:gh-draw .32s .28s ease-out forwards}
.ok i{position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:var(--gh-ok);opacity:0;animation:gh-spark .6s .2s ease-out forwards}
.ok i:nth-child(3){--a:0deg}.ok i:nth-child(4){--a:60deg}.ok i:nth-child(5){--a:120deg}.ok i:nth-child(6){--a:180deg}.ok i:nth-child(7){--a:240deg}.ok i:nth-child(8){--a:300deg}
.ok{animation-delay:var(--d,0ms)}
.ok .dot{animation-delay:var(--d,0ms)}
.ok .ring{animation-delay:calc(var(--d,0ms) + 50ms)}
.ok .dot svg{animation-delay:calc(var(--d,0ms) + 280ms)}
.ok i{animation-delay:calc(var(--d,0ms) + 200ms)}
.sc:has(.ok)>ha-icon,.sc:has(.ok)>.lbl{opacity:0;transition:opacity .15s}
.sc:has(.ok){box-shadow:inset 0 0 0 1.5px var(--gh-ok)}
@keyframes gh-okbox{0%,82%{opacity:1}100%{opacity:0}}
@keyframes gh-pop{0%{transform:scale(0)}100%{transform:scale(1)}}
@keyframes gh-ring{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(2.6)}}
@keyframes gh-draw{to{stroke-dashoffset:0}}
@keyframes gh-spark{0%{opacity:1;transform:rotate(var(--a)) translateY(0) scale(1)}100%{opacity:0;transform:rotate(var(--a)) translateY(-34px) scale(.4)}}
/* saluto */
.hi{cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.hi h2{margin:0;font-size:28px;font-weight:700;letter-spacing:-.02em;line-height:1.12;text-wrap:balance}
.hi p{margin:4px 0 0;color:var(--gh-mut);font-size:14.5px;line-height:1.35}
.hi p.alert{color:#e53935;font-weight:600}
.hi p.accent{color:var(--gh-orange);font-weight:600}
.wrap[data-scheme="dark"] .hi p.alert{color:#ff7a75}
/* pillole */
.pills{display:flex;gap:8px;flex-wrap:wrap}
.pill{display:flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 9px;border-radius:17px;font-size:13.5px;font-weight:500;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;box-sizing:border-box}
.pill.solo{padding:0;width:38px;justify-content:center}
.pill ha-icon{--mdc-icon-size:19px;color:var(--c)}
.pill.alert{background:#e53935!important;border-color:#e53935!important;color:#fff}
.pill.alert ha-icon{color:#fff}
.pill.press{transform:scale(.95)}
/* meteo */
.wx{position:relative;border-radius:28px;overflow:hidden;isolation:isolate;transform:translateZ(0)}
.wx .slot{position:absolute;inset:0}
.wx.surf{padding:0;transition:background .45s,border-color .45s}
.wx.surf:has(.slot.in){background:none;border-color:transparent;box-shadow:none}
.wx .slot,.cal .slot{opacity:0;transition:opacity .45s ease}
.wx .snap{position:absolute;inset:0;pointer-events:none;transition:opacity .45s ease}
.wx:has(.slot.in) .snap{opacity:0}
.wx .slot.in,.cal .slot.in{opacity:1}
.wx .slot:not(.in)~.tip{opacity:0}
.wx .tip{transition:opacity .45s ease}
.wx .slot>*{display:block;height:100%;--ha-card-border-radius:28px}
.cal{border-radius:var(--gh-r);overflow:hidden;padding:4px 2px}
.cal .slot>*{display:block;--ha-card-background:transparent;--card-background-color:transparent;--ha-card-box-shadow:none;--ha-card-border-width:0;--ha-card-border-color:transparent}
.wx .tip{position:absolute;right:14px;top:14px;z-index:3;color:#fff;font-size:12.5px;text-shadow:0 1px 6px rgba(0,0,0,.25);pointer-events:none;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px 0 9px;border-radius:14px;background:rgba(255,255,255,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3);opacity:1}
.wx .tip ha-icon{--mdc-icon-size:15px}
@media (prefers-reduced-motion:reduce){.term *,.sol *,.ok,.ok *,.sc.sent{animation:none!important}.ok .dot{transform:none}.ok .dot svg{stroke-dashoffset:0}.ok .ring,.ok i{display:none}}
`;

  const num = (hass, id) => {
    const s = id && hass.states[id];
    if (!s || ["unknown", "unavailable", ""].includes(s.state)) return null;
    const n = parseFloat(s.state);
    return isNaN(n) ? null : n;
  };
  const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  class GlassHomeCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._sig = "";
      this._acts = {};
      this._timer = null;
      this._played = {};
      this._sent = {};
    }

    setConfig(config) {
      if (!config) throw new Error("Invalid configuration");
      this._config = { ...DEFAULTS, ...config };
      this._sig = "";
      this._prep("weather", this._config.weather_card);
      this._prep("calendar", this._config.calendar_card);
      if (this.isConnected) { if (this._config.lock_scroll || this._config.debug_fit) this._lock(); else this._unlock(); }
      if (this._hass) this._render();
    }

    set hass(hass) {
      this._hass = hass;
      Object.values(this._emb || {}).forEach((e) => { if (e.el) e.el.hass = hass; });
      const sig = this._signature();
      if (sig !== this._sig) { this._sig = sig; this._render(); }
    }

    /* «niente scorrimento»: la pagina non viene bloccata (così il trascina-giù dell'app ricarica ancora);
       la card misura quanto la pagina sfora lo schermo e se lo toglie con un margine negativo in fondo */
    connectedCallback() {
      this._lock();
      /* tornando sulla vista la card meteo riparte dal caricamento: fotografia finché non è di nuovo pronta */
      const e = this._emb?.weather, cfg = this._config?.weather_card;
      if (e && e.el && e.shown && cfg) {
        e.shown = false;
        e.readyAt = 0;
        const slot = this.shadowRoot && this.shadowRoot.querySelector('[data-slot="weather"]');
        if (slot) slot.classList.remove("in");
        this._showSnap(cfg);
        this._embed("weather", cfg);
      }
    }
    disconnectedCallback() { this._unlock(); }
    _lock() {
      if (!(this._config?.lock_scroll || this._config?.debug_fit) || this._locked) return;
      this._locked = true;
      this._onResize = () => this._fit();
      window.addEventListener("resize", this._onResize);
      this._fitTimer = setInterval(() => this._fit(), 2000);
      requestAnimationFrame(() => this._fit());
    }
    _unlock() {
      if (!this._locked) return;
      this._locked = false;
      window.removeEventListener("resize", this._onResize);
      clearInterval(this._fitTimer);
      this._setFit(0);
    }
    _fit() {
      const w = this.shadowRoot?.querySelector(".wrap");
      if (!w || !this._locked) return;
      if (!this._config.lock_scroll || !window.matchMedia("(max-width: 767px)").matches) {
        this._setFit(0);
        if (this._config.debug_fit) this._debug(document.scrollingElement || document.documentElement, 0);
        return;
      }
      const doc = document.scrollingElement || document.documentElement;
      /* quanto sfora la pagina con l'accorciamento attuale, più l'accorciamento stesso = sforamento vero */
      const natural = w.offsetHeight;
      const over = doc.scrollHeight - window.innerHeight + (this._fitPx || 0);
      const px = Math.max(0, Math.min(Math.ceil(over), Math.max(0, natural - 200)));
      if (px !== this._fitPx) this._setFit(px);
      if (this._config.debug_fit) this._debug(doc, over);
    }
    /* la card dichiara un'altezza più bassa del contenuto: il contenuto si vede tutto,
       ma la griglia della vista usa l'altezza dichiarata e la pagina si accorcia davvero */
    _setFit(px) {
      const w = this.shadowRoot?.querySelector(".wrap");
      this._fitPx = px;
      if (!px || !w) { this.style.height = ""; this.style.overflow = ""; return; }
      this.style.display = "block";
      this.style.overflow = "visible";
      this.style.height = `${w.offsetHeight - px}px`;
    }

    /* diagnosi: chi scorre davvero e con quali misure */
    _debug(doc, over) {
      let box = this.shadowRoot.querySelector(".dbg");
      if (!box) { box = document.createElement("div"); box.className = "dbg"; this.shadowRoot.querySelector(".wrap")?.appendChild(box); }
      if (!box.isConnected) return;
      const scrollers = [];
      let n = this;
      for (let i = 0; i < 40 && n; i++) {
        n = n.parentNode || n.host;
        if (n instanceof Element) {
          const cs = getComputedStyle(n);
          if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1)
            scrollers.push(`${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""} ${n.scrollHeight}/${n.clientHeight} y${Math.round(n.scrollTop)}`);
        }
      }
      const r = this.getBoundingClientRect(), vv = window.visualViewport;
      box.textContent = `v${VERSION} doc ${doc.scrollHeight}/${window.innerHeight} vv ${vv ? Math.round(vv.height) : "-"} y${Math.round(window.scrollY)} · fit ${this._fitPx || 0} over ${Math.round(over)} · card ${Math.round(r.top)}→${Math.round(r.bottom)} · scorrono: ${scrollers.join(" | ") || "nessuno"}`;
    }

    getCardSize() { return 6; }
    getGridOptions() { return { columns: "full", rows: "auto" }; }

    _t(k) {
      const lang = (this._hass?.locale?.language || this._hass?.language || "en").slice(0, 2);
      return (STR[lang] || STR.en)[k];
    }

    _ids() {
      const c = this._config, ids = [...(c.climate_entities || [])];
      ["temperature_entity", "humidity_entity", "covers_open_entity", "covers_slit_entity", "solar_power_entity", "solar_energy_entity", "person_1", "person_2"].forEach((k) => c[k] && ids.push(c[k]));
      for (let i = 1; i <= 4; i++) ["script", "name_entity"].forEach((k) => c[`scene_${i}_${k}`] && ids.push(c[`scene_${i}_${k}`]));
      (c.calendar_card?.entities || []).forEach((e) => ids.push(typeof e === "string" ? e : e.entity));
      ["tip_1_entity", "tip_2_entity", "greeting_entity", "alarm_entity", "scenes_active_since", "power_fail_entity", "ups_status_entity", "ups_runtime_entity", "lights_entity"].forEach((k) => c[k] && ids.push(c[k]));
      (c.alert_entities || []).forEach((e) => ids.push(e));
      this._list(c.activity_entities).forEach((e) => ids.push(e));
      if (c.activity_owner_entity) ids.push(c.activity_owner_entity);
      ["subtitle_entity", "subtitle_accent_entity"].forEach((k) => c[k] && ids.push(c[k]));
      for (let i = 1; i <= 6; i++) if (c[`pill_${i}_passthrough_entity`]) ids.push(c[`pill_${i}_passthrough_entity`]);
      const lg = c.lights_entity && this._hass.states[c.lights_entity];
      if (lg && Array.isArray(lg.attributes.entity_id)) ids.push(...lg.attributes.entity_id);
      for (let i = 1; i <= 6; i++) this._list(c[`pill_${i}_entity`]).forEach((e) => {
        ids.push(e);
        const s = this._hass.states[e];
        if (e.startsWith("light.") && Array.isArray(s?.attributes.entity_id)) ids.push(...s.attributes.entity_id);
      });
      return ids;
    }
    _signature() {
      const h = this._hass;
      return (h.themes?.darkMode ? "d" : "l") + (h.user?.id || "") + new Date().getHours() + this._ids().map((id) => {
        const s = h.states[id];
        if (!s) return "-";
        const a = s.attributes;
        const extra = "";
        return `${s.state}|${a.hvac_action || ""}|${a.last_triggered || ""}|${a.entity_picture || ""}|${extra}`;
      }).join(";");
    }
    _list(v) { return !v ? [] : Array.isArray(v) ? v : [v]; }
    _map(s) {
      return Object.fromEntries(String(s || "").split(",").map((p) => { const i = p.indexOf("="); return i < 0 ? [] : [p.slice(0, i).trim(), p.slice(i + 1).trim()]; }).filter((p) => p.length === 2 && p[0]));
    }
    _first(name) { return String(name || "").split(/\s+/)[0]; }


    _fmt(n, d = 1) {
      if (n == null) return "–";
      return n.toLocaleString(this._hass.locale?.language || this._hass.language || "en", { maximumFractionDigits: d });
    }

    _room(id) {
      const h = this._hass, ent = h.entities?.[id];
      let area = ent?.area_id;
      if (!area && ent?.device_id) area = h.devices?.[ent.device_id]?.area_id;
      if (area && h.areas?.[area]) return h.areas[area].name;
      return h.states[id]?.attributes.friendly_name || id;
    }

    /* ---------- dati ---------- */
    _climate() {
      const h = this._hass, c = this._config;
      const act = { heating: [], cooling: [], drying: [] };
      (c.climate_entities || []).forEach((id) => {
        const a = h.states[id]?.attributes.hvac_action;
        if (act[a]) act[a].push(this._room(id));
      });
      const mode = act.heating.length ? "heat" : act.cooling.length ? "cool" : act.drying.length ? "dry" : "idle";
      /* nomi a mano («Camera Matrimoniale=Camera»), altrimenti con due stanze lunghe la prima parola */
      const ren = Object.fromEntries(String(c.room_names || "").split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2 && p[0]));
      let list = [...new Set(mode === "heat" ? act.heating : mode === "cool" ? act.cooling : act.drying)].map((n) => ren[n] || n);
      if (list.length === 2 && list.join("").length > 20) list = [...new Set(list.map((n) => n.split(/\s+/)[0]))];
      let what = "";
      if (mode !== "idle") {
        const verb = this._t(mode === "heat" ? "heats" : mode === "cool" ? "cools" : "dries");
        what = list.length === 1 ? `${verb} ${list[0]}` : list.length === 2 ? `${verb} ${list[0]} ${this._t("and")} ${list[1]}` : `${verb} ${list.length} ${this._t("rooms")}`;
      } else if ((c.climate_entities || []).length) what = this._t("idle");
      const parts = [];
      const t = num(h, c.temperature_entity), hu = num(h, c.humidity_entity);
      if (t != null) parts.push(`${this._fmt(t)} °C`);
      if (hu != null && !(c.humidity_tap_action && c.humidity_tap_action.action !== "none")) parts.push(`${this._fmt(hu, 0)}%`);
      this._hum = hu;
      if (what) parts.push(what);
      return { mode, text: parts.join(" · ") };
    }

    _viewer() {
      const h = this._hass, c = this._config, uid = h.user?.id;
      const ps = [c.person_1, c.person_2].filter(Boolean);
      return ps.find((p) => h.states[p]?.attributes.user_id === uid) || null;
    }

    /* ---------- disegno ---------- */
    _render() {
      const h = this._hass, c = this._config;
      if (!h || !c) return;
      this._acts = {};
      const scheme = h.themes?.darkMode ? "dark" : "light";
      const out = [];
      const act = (key, tap, hold, entity) => { this._acts[key] = { tap, hold, entity }; return `data-k="${key}"`; };
      const title = (txt, extra = "") => (c.show_titles ? `<div class="sect"><span>${esc(txt)}</span>${extra}</div>` : "");

      /* saluto */
      if (c.show_greeting) {
        const g = this._greeting();
        out.push(`<div class="hi" ${act("greeting", c.greeting_tap_action, c.greeting_hold_action)}><h2>${esc(g.title)}</h2>${g.sub ? `<p${g.alert ? ' class="alert"' : g.accent ? ' class="accent"' : ""}>${esc(g.sub)}</p>` : ""}</div>`);
      }
      /* pillole */
      const pills = [];
      for (let i = 1; i <= 6; i++) {
        const p = this._pill(i);
        if (p) pills.push(`<div class="pill surf${p.text === "" ? " solo" : ""}${p.alert ? " alert" : ""}" style="--c:${p.color}" ${act("pill" + i, c[`pill_${i}_tap_action`] || { action: "more-info" }, null, p.entity)}><ha-icon icon="${esc(p.icon)}"></ha-icon>${p.text !== "" ? `<span>${esc(p.text)}</span>` : ""}</div>`);
      }
      if (pills.length) out.push(`<div class="pills">${pills.join("")}</div>`);
      /* meteo */
      /* meteo: una card esterna (di solito la Animated Weather Card) incorporata così com'è;
         la card decide altezza e angoli e ci appoggia sopra il consiglio del momento */
      if (c.calendar_card?.type && (!c.calendar_hide_empty || this._calendarHasEvents())) out.push(`<div class="cal surf"><div class="slot${this._emb?.calendar?.shown ? " in" : ""}" data-slot="calendar"></div></div>`);
      if (c.weather_card?.type) {
        const tip = this._tip();
        out.push(`<div class="wx surf" style="height:${Number(c.weather_height) || 160}px"><div class="snap"></div><div class="slot${this._emb?.weather?.shown ? " in" : ""}" data-slot="weather"></div>${tip ? `<span class="tip"><ha-icon icon="${esc(tip.icon)}"></ha-icon>${esc(tip.text)}</span>` : ""}</div>`);
      }

      /* riquadri */
      const tiles = [];
      if ((c.climate_entities || []).length || c.temperature_entity) {
        const cl = this._climate();
        const col = cl.mode === "heat" ? "var(--gh-heat)" : cl.mode === "cool" ? "var(--gh-cool)" : cl.mode === "dry" ? "var(--gh-blue)" : "var(--gh-mut)";
        tiles.push(`<div class="tile wide surf${cl.mode !== "idle" ? " on" : ""}" data-hv="${cl.mode}" style="--c:${col}" ${act("climate", c.climate_tap_action, c.climate_hold_action, (c.climate_entities || [])[0])}>
          <div class="ico">${SVG.thermo}</div><div class="t"><div class="n">${esc(c.climate_name || this._t("climate"))}</div><div class="v">${esc(cl.text)}</div></div>${this._hum != null && c.humidity_tap_action && c.humidity_tap_action.action !== "none" ? `<div class="hum" ${act("humidity", c.humidity_tap_action, null, c.humidity_entity)}>${SVG.drop}${this._fmt(this._hum, 0)}%</div>` : ""}</div>`);
      }
      if (c.covers_open_entity) {
        const n = num(h, c.covers_open_entity) || 0, sl = num(h, c.covers_slit_entity) || 0;
        let v = n > 0 ? `${n} ${this._t(n === 1 ? "openOne" : "open")}` : this._t("allClosed");
        if (sl > 0) v += ` · ${sl} ${this._t("slit")}`;
        tiles.push(`<div class="tile surf${n > 0 ? " on" : ""}" style="--c:var(--gh-blue)" ${act("covers", c.covers_tap_action, c.covers_hold_action, c.covers_open_entity)}>
          <div class="ico">${n > 0 ? SVG.shutter : SVG.shutterClosed}</div><div class="t"><div class="n">${esc(c.covers_name || this._t("covers"))}</div><div class="v">${esc(v)}</div></div></div>`);
      }
      if (c.solar_power_entity) {
        const p = num(h, c.solar_power_entity), e = num(h, c.solar_energy_entity);
        const unit = h.states[c.solar_power_entity]?.attributes.unit_of_measurement || "W";
        const on = p != null && p * (unit === "kW" ? 1000 : 1) > (c.solar_min_power ?? 10);
        const kwh = e != null ? `${this._fmt(e, 2)} kWh` : "";
        const v = on ? [`${this._fmt(p, unit === "kW" ? 2 : 0)} ${unit}`, kwh].filter(Boolean).join(" · ") : [this._t("stopped"), kwh].filter(Boolean).join(" · ");
        tiles.push(`<div class="tile surf${on ? " on" : ""}" style="--c:var(--gh-sun)" ${act("solar", c.solar_tap_action, c.solar_hold_action, c.solar_power_entity)}>
          <div class="ico">${SVG.solar}</div><div class="t"><div class="n">${esc(c.solar_name || this._t("solar"))}</div><div class="v">${esc(v)}</div></div></div>`);
      }
      if (tiles.length) out.push(title(c.title_home || this._t("home")) + `<div class="grid">${tiles.join("")}</div>`);

      /* persone + entra/esci */
      const ppl = [c.person_1, c.person_2].filter((p) => p && h.states[p]);
      if (ppl.length) {
        const viewer = this._viewer();
        const atHome = viewer ? h.states[viewer].state === "home" : false;
        /* giro in corso (Entra/Esci, box) e chi l'ha lanciato: dal nome nell'entita (box_fase_federico)
           o dal testo che comincia col nome (casa_descrizione: «Denise · Rientro a piedi») */
        const idle = this._list(c.activity_idle_state);
        const running = this._list(c.activity_entities).filter((e) => { const s = h.states[e]; return s && !idle.includes(s.state) && !["unavailable", "unknown", ""].includes(s.state); });
        const owners = new Set();
        const ownerFor = this._list(c.activity_owner_for);
        running.forEach((e) => {
          const p = ppl.find((pp) => e.includes(pp.split(".")[1]));
          if (p) { owners.add(p); return; }
          if (ownerFor.length && !ownerFor.includes(e)) return;
          const txt = String(h.states[c.activity_owner_entity]?.state || "").toLowerCase();
          const q = ppl.find((pp) => { const n = String(h.states[pp].attributes.friendly_name || "").toLowerCase(); return n && txt.startsWith(n); });
          if (q) owners.add(q);
        });
        /* chi guarda davanti, gli altri dietro e un po' sovrapposti */
        const order = ppl.map((p, i) => [p, i]).sort((a, b) => (b[0] === viewer) - (a[0] === viewer));
        const avs = order.map(([p, i], k) => {
          const s = h.states[p], pic = s.attributes.entity_picture;
          const ring = owners.has(p) ? "var(--gh-orange)" : s.state === "home" ? "var(--gh-ok)" : "rgba(127,127,140,.55)";
          const ini = (s.attributes.friendly_name || p).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          return `<div class="av p${i + 1} ${k === 0 ? "front" : "behind"}" style="--ring:${ring};${pic ? `background-image:url('${esc(pic)}')` : ""}" title="${esc(s.attributes.friendly_name)}" ${act("person" + (i + 1), c[`person_${i + 1}_tap_action`] || { action: "more-info" }, null, p)}>${pic ? "" : esc(ini)}</div>`;
        }).join("");
        const b1 = atHome
          ? `<button style="--c:var(--gh-orange)" ${act("enter", c.enter_tap_action, null)}>${SVG.leave}${esc(this._t("leave"))}</button>`
          : `<button style="--c:var(--gh-ok)" ${act("enter", c.enter_tap_action, null)}>${SVG.enter}${esc(this._t("enter"))}</button>`;
        const b2 = c.show_box ? `<button style="--c:var(--gh-blue)" ${act("box", c.box_tap_action, null)}>${SVG.garage}${esc(this._t(atHome ? "leaveBox" : "enterBox"))}</button>` : "";
        /* icona del giro tra le foto e i tasti: apre il pop-up delle attivita */
        const run = running.length
          ? `<button class="run" style="--c:var(--gh-orange)" title="${esc(this._t("running"))}" ${act("activity", c.activity_tap_action, null)}><i></i><ha-icon icon="mdi:history"></ha-icon></button>`
          : "";
        out.push(title(c.title_people || this._t("people")) + `<div class="ee surf"><div class="ppl">${avs}</div>${run}<div class="eeb">${b1}${b2}</div></div>`);
      }

      /* scenari */
      const viewer = this._viewer();
      const atHome = viewer ? h.states[viewer].state === "home" : true;
      const scenes = [];
      let nextExpiry = 0;
      for (let i = 1; i <= 4; i++) {
        const script = c[`scene_${i}_script`];
        if (!script && !c[`scene_${i}_name`]) continue;
        if (c[`scene_${i}_only_home`] && !atHome) continue;
        let name = c[`scene_${i}_name`] || "";
        let icon = c[`scene_${i}_icon`] || "mdi:palette-outline";
        const ne = c[`scene_${i}_name_entity`] && h.states[c[`scene_${i}_name_entity`]];
        if (ne) {
          const f = h.formatEntityState ? h.formatEntityState(ne) : ne.state;
          name = name || f.charAt(0).toUpperCase() + f.slice(1);
          /* «mattino=mdi:weather-sunset-up, giorno=mdi:weather-sunny» */
          const map = Object.fromEntries(String(c[`scene_${i}_icon_map`] || "").split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2 && p[0]));
          if (map[ne.state]) icon = map[ne.state];
          else if (ne.attributes.icon) icon = ne.attributes.icon;
        }
        name = name || h.states[script]?.attributes.friendly_name || script;
        const runAct = script ? { action: "perform-action", perform_action: "script.turn_on", target: { entity_id: script } } : null;
        const tap = c.scene_trigger === "tap" ? runAct : { action: "none" };
        const hold = c.scene_trigger === "tap" ? null : runAct;
        /* la spunta parte quando lo script risulta avviato (last_triggered), una volta sola:
           se la card si ridisegna a metà, l'animazione riprende dal punto giusto */
        let ok = "", sent = "";
        const lt = script && h.states[script]?.attributes.last_triggered;
        const key = "scene" + i;
        if (lt && Date.now() - new Date(lt).getTime() < 10000) {
          const p = this._played[script];
          if (!p || p.lt !== lt) this._played[script] = { lt, at: Date.now() };
          const age = Date.now() - this._played[script].at;
          if (age < 2200) {
            ok = `<div class="ok" style="--d:-${age}ms"><span class="ring"></span><span class="dot">${SVG.check}</span><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
            nextExpiry = nextExpiry ? Math.min(nextExpiry, 2250 - age) : 2250 - age;
          }
          delete this._sent[key];
        }
        if (!ok && this._sent[key] && Date.now() - this._sent[key] < 5000) {
          sent = " sent";
          const left = 5000 - (Date.now() - this._sent[key]);
          nextExpiry = nextExpiry ? Math.min(nextExpiry, left) : left;
        }
        const col = c[`scene_${i}_color`] || ["var(--gh-sun)", "var(--gh-violet)", "var(--gh-blue)", "var(--gh-ok)"][i - 1];
        /* attivo = lanciato dopo l'ultimo cambio dell'entità di riferimento (per esempio la fascia oraria) */
        const ref = c.scenes_active_since && h.states[c.scenes_active_since];
        const on = !!(lt && ref?.last_changed && new Date(lt) > new Date(ref.last_changed)) ? " on" : "";
        scenes.push(`<div class="sc surf${on}${c[`scene_${i}_highlight`] ? " cur" : ""}${sent}" style="--c:${col};--hold:${HOLD_MS}ms" ${act(key, tap, hold, script)}><span class="fill"></span><ha-icon icon="${esc(icon)}"></ha-icon><span class="lbl">${esc(name)}</span>${ok}</div>`);
      }
      if (scenes.length) {
        const all = c.all_tap_action && c.all_tap_action.action !== "none" ? `<span class="all" ${act("all", c.all_tap_action, null)}>${esc(this._t("all"))} ›</span>` : "";
        out.push(title(c.title_scenes || this._t("scenes"), all) + `<div class="scen" style="grid-template-columns:repeat(${scenes.length},1fr)">${scenes.join("")}</div>`);
      }

      const mt = Number(c.margin_top) || 0;
      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="wrap" data-style="${esc(c.style)}" data-scheme="${scheme}"${c.compact ? " data-compact" : ""}${c.big_enter_buttons ? " data-bigee" : ""}${mt ? ` style="margin-top:${mt}px"` : ""}>${out.join("")}</div>`;
      this._wire();
      this._attachWeather();
      if (this._locked && this._fitPx) this._setFit(this._fitPx);
      clearTimeout(this._timer);
      if (nextExpiry) this._timer = setTimeout(() => { this._sig = ""; this._render(); }, nextExpiry + 50);
    }

    /* ---------- saluto, pillole, meteo ---------- */
    _greeting() {
      const h = this._hass, c = this._config;
      const ge = c.greeting_entity && h.states[c.greeting_entity];
      let sal = ge ? this._map(c.greeting_map)[ge.state] : "";
      if (!sal) {
        const hr = new Date().getHours();
        sal = this._t(hr >= 22 || hr < 6 ? "gNight" : hr < 13 ? "gMorning" : hr < 18 ? "gAfternoon" : "gEvening");
      }
      const viewer = this._viewer();
      const name = this._first(viewer ? h.states[viewer].attributes.friendly_name : h.user?.name);
      const parts = [];
      const on = (s) => s && ["on", "open", "unlocked", "problem"].includes(s.state);
      const ppl = [c.person_1, c.person_2].filter((p) => p && h.states[p]);
      const empty = ppl.length > 0 && ppl.every((p) => h.states[p].state !== "home");
      /* 1. manca la corrente: rete giù oppure UPS non più «online» */
      const fail = c.power_fail_entity && h.states[c.power_fail_entity];
      const ups = c.ups_status_entity && h.states[c.ups_status_entity];
      const upsBad = ups && !["unknown", "unavailable"].includes(ups.state) && String(ups.state).toLowerCase() !== String(c.ups_ok_state || "Online").toLowerCase();
      if (on(fail) || upsBad) {
        const run = num(h, c.ups_runtime_entity);
        parts.push(this._t("powerOut") + (run != null ? `, ${this._t("runtime")} ${Math.round(run)} min` : ""));
      }
      /* 2. casa vuota con l'antifurto spento */
      const al = c.alarm_entity && h.states[c.alarm_entity];
      if (empty && al && al.state === "disarmed") parts.push(this._t("emptyDisarmed"));
      /* 3. porte e box aperti, con il testo scelto */
      const names = this._map(c.alert_names);
      (c.alert_entities || []).forEach((e) => {
        const s = h.states[e];
        if (on(s)) parts.push(names[e] || s.attributes.friendly_name || e);
      });
      /* 4. luci accese a casa vuota */
      if (empty && c.lights_entity && h.states[c.lights_entity]) {
        const g = h.states[c.lights_entity], members = Array.isArray(g.attributes.entity_id) ? g.attributes.entity_id : [c.lights_entity];
        const n = members.filter((e) => h.states[e]?.state === "on").length;
        if (n > 0) parts.push(n === 1 ? this._t("oneLightEmpty") : this._t("lightsEmpty").replace("{n}", n));
      }
      /* 5. antifurto, sempre */
      if (al && !(empty && al.state === "disarmed")) {
        const lab = this._map(c.alarm_names)[al.state] || (h.formatEntityState ? h.formatEntityState(al) : al.state);
        parts.push(`${c.alarm_prefix ?? this._t("alarm")} ${lab}`.trim());
      }
      /* 6. l'altra persona, solo se richiesto */
      if (c.subtitle_people) ppl.filter((p) => p !== viewer).forEach((p) => {
        const s = h.states[p];
        parts.push(`${this._first(s.attributes.friendly_name)} ${this._t(s.state === "home" ? "athome" : "away")}`);
      });
      const alertSub = parts.length > 0 && (c.alert_entities || []).some((e) => on(h.states[e]));
      const se = c.subtitle_entity && h.states[c.subtitle_entity];
      const seText = se && !["unknown", "unavailable", ""].includes(se.state) ? se.state : "";
      const sub = parts.slice(0, 3).join(" · ") || seText || c.subtitle_ok || "";
      const accent = !parts.length && !!seText && on(c.subtitle_accent_entity && h.states[c.subtitle_accent_entity]);
      return { title: c.title || (name ? `${sal}, ${name}` : sal), sub, alert: alertSub && !!c.title, accent };
    }

    _pill(i) {
      const h = this._hass, c = this._config;
      const ents = this._list(c[`pill_${i}_entity`]).filter((e) => h.states[e]);
      if (!ents.length) return null;
      const s0 = h.states[ents[0]], dom = ents[0].split(".")[0], dc = s0.attributes.device_class;
      const grey = "var(--gh-mut)";
      let icon = c[`pill_${i}_icon`], text = c[`pill_${i}_text`] ?? null, color = grey, alert = false;
      if (dom === "light") {
        const members = ents.length === 1 && Array.isArray(s0.attributes.entity_id) ? s0.attributes.entity_id : ents;
        const n = members.filter((e) => h.states[e]?.state === "on").length;
        text = text ?? String(n); color = n > 0 ? "var(--gh-sun)" : grey; icon = icon || "mdi:lightbulb-group";
      } else if (dom === "alarm_control_panel") {
        const st = s0.state;
        text = text ?? (this._map(c.alarm_names)[st] || (h.formatEntityState ? h.formatEntityState(s0) : st));
        color = st === "disarmed" ? grey : ["armed_home", "armed_stay"].includes(st) ? "var(--gh-blue)" : ["arming", "pending", "disarming"].includes(st) ? "var(--gh-orange)" : "#e53935";
        alert = st === "triggered";
        icon = icon || (st === "disarmed" ? "mdi:shield-off-outline" : alert ? "mdi:shield-alert" : "mdi:shield-lock-outline");
      } else if (["binary_sensor", "cover", "lock"].includes(dom)) {
        const open = ents.some((e) => ["on", "open", "opening", "unlocked", "unlocking"].includes(h.states[e].state));
        if (open && c[`pill_${i}_icon_on`]) icon = c[`pill_${i}_icon_on`];
        color = open ? "#e53935" : "var(--gh-ok)";
        const kind = dom === "lock" ? "lock" : dc === "garage_door" || dc === "garage" ? "garage" : dc === "window" ? "window" : "door";
        icon = icon || { lock: open ? "mdi:lock-open-variant" : "mdi:lock", garage: open ? "mdi:garage-open-variant" : "mdi:garage-variant", window: open ? "mdi:window-open-variant" : "mdi:window-closed-variant", door: open ? "mdi:door-open" : "mdi:door-closed" }[kind];
        text = text ?? (ents.length > 1 ? String(ents.filter((e) => ["on", "open", "opening", "unlocked", "unlocking"].includes(h.states[e].state)).length) : "");
      } else if (["media_player", "switch", "input_boolean", "fan"].includes(dom)) {
        // acceso/spento: colorata da accesa; per i media player accanto c'è l'app o l'ingresso
        const isOn = (e) => !["off", "unavailable", "unknown", "standby"].includes(h.states[e].state);
        const onE = ents.find(isOn);
        if (onE && c[`pill_${i}_icon_on`]) icon = c[`pill_${i}_icon_on`];
        color = onE ? (c[`pill_${i}_color`] || "var(--gh-blue)") : grey;
        const so = onE && h.states[onE];
        let src = so && dom === "media_player" ? (so.attributes.app_name || so.attributes.source || "") : "";
        // ingresso che passa da un altro apparecchio (es. TV su «Samsung Soundbar» → la PS5 collegata alla soundbar)
        const pe = c[`pill_${i}_passthrough_entity`] && h.states[c[`pill_${i}_passthrough_entity`]];
        if (pe && src && src === c[`pill_${i}_passthrough_source`] && pe.attributes.source) src = pe.attributes.source;
        text = text ?? (onE ? (c[`pill_${i}_text_on`] ?? src) : "");
        icon = icon || s0.attributes.icon || (dom === "media_player" ? "mdi:television" : "mdi:power");
      } else {
        const v = num(h, ents[0]);
        const dec = Number(c[`pill_${i}_decimals`]) || 0, suf = c[`pill_${i}_suffix`] || "";
        text = text ?? (v != null ? this._fmt(v, dec) + suf : (h.formatEntityState ? h.formatEntityState(s0) : s0.state));
        color = v != null && v > 0 ? (c[`pill_${i}_color`] || "var(--gh-blue)") : grey;
        icon = icon || s0.attributes.icon || "mdi:information-outline";
      }
      return { entity: ents[0], icon, text, color, alert };
    }

    /* il prossimo impegno lo dice già l'entità calendario (attributi start_time/message);
       si contano solo i calendari visibili a chi guarda (condizioni «user») */
    _calendarHasEvents() {
      const h = this._hass, cc = this._config.calendar_card;
      const days = Number(cc.days_to_show) || 7, limit = Date.now() + days * 86400000;
      return (cc.entities || []).some((e) => {
        const id = typeof e === "string" ? e : e.entity;
        const vis = (typeof e === "object" && e.visibility) || [];
        if (vis.some((v) => v.condition === "user" && !(v.users || []).includes(h.user?.id))) return false;
        const s = h.states[id];
        if (!s) return false;
        if (s.state === "on") return true;
        const t = s.attributes.start_time ? new Date(String(s.attributes.start_time).replace(" ", "T")).getTime() : NaN;
        return !isNaN(t) && t <= limit;
      });
    }

    _tip() {
      const h = this._hass, c = this._config;
      for (const j of [1, 2]) {
        const t = c[`tip_${j}_entity`] && h.states[c[`tip_${j}_entity`]];
        if (t && t.state === "on") return { text: c[`tip_${j}_text`] || t.attributes.friendly_name, icon: c[`tip_${j}_icon`] || t.attributes.icon || "mdi:lightbulb-on-outline" };
      }
      return null;
    }

    /* le card incorporate (meteo, calendario) vengono create una volta sola
       e rimesse al loro posto a ogni ridisegno, così non ripartono da zero */
    _attachWeather() {
      if (this._config.weather_card?.type) this._showSnap(this._config.weather_card);
      this._embed("weather", this._config.weather_card);
      this._embed("calendar", this._config.calendar_card);
    }
    /* crea la card incorporata (una volta per configurazione); se il suo file non e ancora
       caricato HA da un segnaposto che chiede di essere ricreato (ll-rebuild) */
    _prep(name, cfg) {
      this._emb = this._emb || {};
      if (!cfg?.type) { delete this._emb[name]; return null; }
      const key = JSON.stringify(cfg);
      let e = this._emb[name];
      if (e && e.key === key) return e;
      e = this._emb[name] = { key, el: null, shown: false };
      (async () => {
        let el;
        try {
          const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
          el = helpers ? helpers.createCardElement(cfg) : document.createElement(String(cfg.type).replace(/^custom:/, ""));
          if (!helpers && el.setConfig) el.setConfig(cfg);
        } catch (err) {
          el = document.createElement("div");
          el.textContent = String(err?.message || err);
        }
        if (this._emb[name] !== e) return;
        el.addEventListener("ll-rebuild", (ev) => {
          ev.stopPropagation();
          if (this._emb[name] !== e) return;
          delete this._emb[name];
          this._prep(name, cfg);
        }, { once: true });
        e.el = el;
        if (this._hass) el.hass = this._hass;
        this._embed(name, cfg);
      })();
      return e;
    }
    _snapKey(cfg) { return "glass-home-card:weather:" + (cfg?.entity || ""); }
    _saveSnap(e, cfg) {
      try {
        if (!e.el || e.el.shadowRoot || !/\S/.test(e.el.innerText || "") || e.el.querySelector(".animated-weather-card.loading")) return;
        const html = e.el.innerHTML;
        if (html.length < 400000) localStorage.setItem(this._snapKey(cfg), html);
        e.savedAt = Date.now();
      } catch (_e) { /* memoria piena o non disponibile: niente fotografia */ }
    }
    _showSnap(cfg) {
      try {
        const e = this._emb?.weather;
        const holder = this.shadowRoot && this.shadowRoot.querySelector(".wx .snap");
        if (!holder || (e && e.shown)) return;
        const html = localStorage.getItem(this._snapKey(cfg));
        if (!html) return;
        const root = holder.shadowRoot || holder.attachShadow({ mode: "open" });
        /* le regole scritte per il tag della card valgono per il contenitore della fotografia */
        root.innerHTML = `<div class="awc-snap-root" style="display:block;height:100%">${html.replace(/(^|[\s,}])animated-weather-card(?=[\s{.:\[>])/g, "$1.awc-snap-root")}</div>`;
      } catch (_e) { /* niente fotografia */ }
    }
    _embed(name, cfg) {
      const e = this._prep(name, cfg);
      if (!e || !e.el || !this.shadowRoot) return;
      const now = this.shadowRoot.querySelector(`[data-slot="${name}"]`);
      if (!now) return;
      if (this._hass) e.el.hass = this._hass;
      if (e.el.parentElement !== now) { now.textContent = ""; now.appendChild(e.el); }
      if (e.shown) {
        now.classList.add("in");
        if (name === "weather" && Date.now() - (e.savedAt || 0) > 600000) this._saveSnap(e, cfg);
        return;
      }
      /* dissolvenza quando la card ha disegnato qualcosa (o al massimo dopo 1,5 s) */
      const t0 = performance.now();
      const check = () => {
        if (this._emb[name] !== e || e.shown) return;
        const sr = e.el.shadowRoot;
        /* la Animated Weather Card passa da uno stato «loading» (blocchi grigi) e poi accende cielo e animazioni */
        const awc = !sr && e.el.querySelector(".animated-weather-card");
        let drawn = e.el.offsetHeight > 0 && (sr ? (sr.textContent.trim() || sr.querySelector("canvas, svg, img")) : /\S/.test(e.el.innerText || ""));
        if (awc) drawn = drawn && !awc.classList.contains("loading");
        if (drawn && !e.readyAt) e.readyAt = performance.now();
        if (!drawn) e.readyAt = 0;
        const settled = drawn && performance.now() - e.readyAt > (awc ? 350 : 0);
        if (settled || performance.now() - t0 > 4000) {
          e.shown = true;
          if (name === "weather") setTimeout(() => this._saveSnap(e, cfg), 3000);
          const slot = this.shadowRoot.querySelector(`[data-slot="${name}"]`);
          if (slot) slot.classList.add("in");
        } else setTimeout(check, 60);
      };
      setTimeout(check, 30);
    }

    _fire(key, kind) {
      const a = this._acts[key];
      if (!a) return;
      const action = kind === "hold" ? a.hold : a.tap;
      if (!action || action.action === "none") return;
      this.dispatchEvent(new CustomEvent("hass-action", {
        bubbles: true, composed: true,
        detail: { config: { entity: a.entity, tap_action: action, hold_action: action }, action: kind },
      }));
      if (kind === "hold") this.dispatchEvent(new CustomEvent("haptic", { bubbles: true, composed: true, detail: "heavy" }));
    }

    _wire() {
      this.shadowRoot.querySelectorAll("[data-k]").forEach((el) => {
        const key = el.dataset.k;
        let timer = null, held = false, moved = false, start = null;
        const cancel = () => { clearTimeout(timer); timer = null; el.classList.remove("press", "holding"); };
        el.addEventListener("pointerdown", (e) => {
          if (e.target.closest?.("[data-k]") !== el) return;
          held = false; moved = false; start = [e.clientX, e.clientY];
          const a = this._acts[key];
          const long = a?.hold && a.hold.action !== "none";
          void el.offsetWidth; /* parte la transizione anche se il tasto è appena stato disegnato */
          el.classList.add(long ? "holding" : "press");
          if (long) timer = setTimeout(() => {
            held = true; timer = null;
            this._sent[key] = Date.now();
            this._fire(key, "hold");
            this._sig = ""; this._render();
          }, HOLD_MS);
        });
        el.addEventListener("pointermove", (e) => { if (start && !moved && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 10) { moved = true; cancel(); } });
        el.addEventListener("pointerup", () => { const go = start && !held && !moved; cancel(); start = null; if (go) this._fire(key, "tap"); });
        el.addEventListener("pointercancel", () => { moved = true; cancel(); });
        el.addEventListener("pointerleave", () => { if (start) { moved = true; cancel(); } });
        el.addEventListener("contextmenu", (e) => e.preventDefault());
      });
    }

    /* ---------- editor ---------- */
    static getConfigElement() { return document.createElement(TAG + "-editor"); }

    static getConfigForm() {
      const scene = (i) => ({
        type: "expandable", name: "", title: `Scena ${i} / Scene ${i}`, schema: [
          { name: `scene_${i}_script`, selector: { entity: { domain: "script" } } },
          { name: `scene_${i}_name`, selector: { text: {} } },
          { name: `scene_${i}_name_entity`, selector: { entity: {} } },
          { name: `scene_${i}_icon`, selector: { icon: {} } },
          { name: `scene_${i}_color`, selector: { text: {} } },
          { name: `scene_${i}_icon_map`, selector: { text: {} } },
          { name: `scene_${i}_only_home`, selector: { boolean: {} } },
          { name: `scene_${i}_highlight`, selector: { boolean: {} } },
        ],
      });
      return {
        schema: [
          { name: "style", selector: { select: { mode: "dropdown", options: [
            { value: "glass_light", label: "Vetro chiaro / Frosted glass" },
            { value: "apple", label: "Apple Home" },
            { value: "glass", label: "Vetro / Glass" },
            { value: "theme", label: "Tema / Theme" },
          ] } } },
          { name: "show_titles", selector: { boolean: {} } },
          { name: "compact", selector: { boolean: {} } },
          { name: "lock_scroll", selector: { boolean: {} } },
          { name: "debug_fit", selector: { boolean: {} } },
          { name: "margin_top", selector: { number: { min: -80, max: 40, step: 2, unit_of_measurement: "px", mode: "box" } } },
          { type: "expandable", name: "", title: "Saluto / Greeting", schema: [
            { name: "show_greeting", selector: { boolean: {} } },
            { name: "title", selector: { text: {} } },
            { name: "subtitle_ok", selector: { text: {} } },
            { name: "subtitle_entity", selector: { entity: {} } },
            { name: "subtitle_accent_entity", selector: { entity: {} } },
            { name: "greeting_entity", selector: { entity: {} } },
            { name: "greeting_map", selector: { text: {} } },
            { name: "alarm_entity", selector: { entity: { domain: "alarm_control_panel" } } },
            { name: "alarm_names", selector: { text: {} } },
            { name: "alert_entities", selector: { entity: { multiple: true } } },
            { name: "alert_names", selector: { text: {} } },
            { name: "lights_entity", selector: { entity: { domain: "light" } } },
            { name: "power_fail_entity", selector: { entity: { domain: "binary_sensor" } } },
            { name: "ups_status_entity", selector: { entity: { domain: "sensor" } } },
            { name: "ups_runtime_entity", selector: { entity: { domain: "sensor" } } },
            { name: "subtitle_people", selector: { boolean: {} } },
            { name: "greeting_tap_action", selector: { ui_action: {} } },
            { name: "greeting_hold_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Distintivi / Pills", schema: [1, 2, 3, 4, 5, 6].flatMap((i) => [
            { name: `pill_${i}_entity`, selector: { entity: { multiple: true } } },
            { name: `pill_${i}_icon`, selector: { icon: {} } },
            { name: `pill_${i}_tap_action`, selector: { ui_action: {} } },
          ]) },
          { type: "expandable", name: "", title: "Meteo / Weather", schema: [
            { name: "weather_card", selector: { object: {} } },
            { name: "calendar_card", selector: { object: {} } },
            { name: "calendar_hide_empty", selector: { boolean: {} } },
            { name: "weather_height", selector: { number: { min: 110, max: 260, step: 5, unit_of_measurement: "px", mode: "box" } } },
            { name: "tip_1_entity", selector: { entity: { domain: ["binary_sensor", "input_boolean"] } } },
            { name: "tip_1_text", selector: { text: {} } },
            { name: "tip_2_entity", selector: { entity: { domain: ["binary_sensor", "input_boolean"] } } },
            { name: "tip_2_text", selector: { text: {} } },
          ] },
          { type: "expandable", name: "", title: "Clima / Climate", schema: [
            { name: "climate_entities", selector: { entity: { domain: "climate", multiple: true } } },
            { name: "temperature_entity", selector: { entity: { domain: "sensor" } } },
            { name: "humidity_entity", selector: { entity: { domain: "sensor" } } },
            { name: "room_names", selector: { text: {} } },
            { name: "humidity_tap_action", selector: { ui_action: {} } },
            { name: "climate_tap_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Tapparelle / Covers", schema: [
            { name: "covers_open_entity", selector: { entity: { domain: "sensor" } } },
            { name: "covers_slit_entity", selector: { entity: { domain: "sensor" } } },
            { name: "covers_tap_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Fotovoltaico / Solar", schema: [
            { name: "solar_power_entity", selector: { entity: { domain: "sensor" } } },
            { name: "solar_energy_entity", selector: { entity: { domain: "sensor" } } },
            { name: "solar_min_power", selector: { number: { min: 0, max: 500, step: 5, unit_of_measurement: "W", mode: "box" } } },
            { name: "solar_tap_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Persone / People", schema: [
            { name: "person_1", selector: { entity: { domain: "person" } } },
            { name: "person_1_tap_action", selector: { ui_action: {} } },
            { name: "person_2", selector: { entity: { domain: "person" } } },
            { name: "person_2_tap_action", selector: { ui_action: {} } },
            { name: "big_enter_buttons", selector: { boolean: {} } },
            { name: "enter_tap_action", selector: { ui_action: {} } },
            { name: "show_box", selector: { boolean: {} } },
            { name: "box_tap_action", selector: { ui_action: {} } },
            { name: "activity_entities", selector: { entity: { multiple: true } } },
            { name: "activity_idle_state", selector: { text: {} } },
            { name: "activity_owner_entity", selector: { entity: {} } },
            { name: "activity_owner_for", selector: { entity: { multiple: true } } },
            { name: "activity_tap_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Scenari / Scenes", schema: [
            { name: "scenes_active_since", selector: { entity: {} } },
            { name: "scene_trigger", selector: { select: { options: [{ value: "hold", label: "Tieni premuto / Hold" }, { value: "tap", label: "Tocco / Tap" }] } } },
            { name: "all_tap_action", selector: { ui_action: {} } },
            scene(1), scene(2), scene(3), scene(4),
          ] },
        ],
        computeLabel: (s) => LABELS[s.name] || s.name,
      };
    }

    static getStubConfig(hass) {
      const first = (d) => Object.keys(hass.states).find((e) => e.startsWith(d + "."));
      return { style: "glass_light", climate_entities: Object.keys(hass.states).filter((e) => e.startsWith("climate.")).slice(0, 3), person_1: first("person") || "" };
    }
  }

  const LABELS = {
    style: "Stile / Style", show_titles: "Titoli delle sezioni / Section titles",
    climate_entities: "Termostati e condizionatori / Climate entities", temperature_entity: "Temperatura media / Indoor temperature",
    humidity_entity: "Umidità media / Indoor humidity", humidity_tap_action: "Pillola umidità: tocco / Humidity chip tap", room_names: "Nomi corti: Stanza lunga=Corta, … / Short room names",climate_tap_action: "Tocco / Tap",
    covers_open_entity: "Sensore «quante aperte» / Open count sensor", covers_slit_entity: "Sensore «a fessura» / Ajar count sensor", covers_tap_action: "Tocco / Tap",
    solar_power_entity: "Potenza / Power", solar_energy_entity: "Energia di oggi / Energy today", solar_min_power: "Acceso sopra / On above", solar_tap_action: "Tocco / Tap",
    person_1: "Persona 1 / Person 1", person_2: "Persona 2 / Person 2", person_1_tap_action: "Tocco persona 1", person_2_tap_action: "Tocco persona 2",
    big_enter_buttons: "Tasti Entra/Esci grandi (per la macchina) / Big Enter/Leave buttons", enter_tap_action: "Tasto Entra-Esci / Enter-Leave", activity_entities: "Giri in corso (icona animata) / Running trips", activity_idle_state: "Stato a riposo / Idle state", activity_owner_entity: "Testo che comincia con chi ha lanciato il giro / Text starting with who started it", activity_owner_for: "Giri a cui si riferisce quel testo / Trips that text describes", activity_tap_action: "Tocco sull icona del giro / Trip icon tap", show_box: "Tasto box / Car button", box_tap_action: "Tasto box: tocco",
    scenes_active_since: "Scenario attivo fino al cambio di / Active until this changes", margin_top: "Margine in alto / Top margin", compact: "Compatta (per stare in uno schermo) / Compact", debug_fit: "Diagnosi adattamento (riga di misure) / Fit diagnostics", lock_scroll: "Niente scorrimento sul telefono (la pagina si adatta allo schermo) / No scrolling on phones", calendar_hide_empty: "Nascondi il calendario se non ci sono impegni / Hide when empty",
    scene_trigger: "Avvio / Run with", all_tap_action: "«Tutti» / «All»",
    show_greeting: "Mostra il saluto / Show greeting", title: "Titolo fisso al posto del saluto (altre viste) / Fixed title instead of the greeting", subtitle_ok: "Sottotitolo quando non c'è niente da dire / Subtitle when all is fine", subtitle_entity: "Sottotitolo preso da un sensore / Subtitle from a sensor", subtitle_accent_entity: "Sottotitolo in arancio quando è acceso / Orange subtitle while on", greeting_entity: "Fascia oraria / Time-of-day entity",
    greeting_map: "Saluto per stato: mattino=Buongiorno, … / Greeting per state", alarm_entity: "Antifurto / Alarm",
    alarm_names: "Nomi antifurto: armed_home=No Box, … / Alarm state names", alert_entities: "Avvisi nel sottotitolo / Alerts in the subtitle", alert_names: "Testi avvisi: entità=Testo, … / Alert texts", lights_entity: "Gruppo luci (accese a casa vuota) / Lights group", power_fail_entity: "Guasto rete / Power failure", ups_status_entity: "Stato UPS / UPS status", ups_runtime_entity: "Autonomia UPS / UPS runtime", subtitle_people: "Mostra l'altra persona / Show the other person",
    greeting_tap_action: "Tocco / Tap", greeting_hold_action: "Pressione lunga / Hold",
    weather_card: "Card meteo (configurazione) / Weather card config", calendar_card: "Card calendario, sopra il meteo / Calendar card, above the weather", weather_height: "Altezza / Height",
    tip_1_entity: "Consiglio 1 (quando è acceso) / Tip 1", tip_1_text: "Testo consiglio 1", tip_2_entity: "Consiglio 2 / Tip 2", tip_2_text: "Testo consiglio 2",
  };
  for (let i = 1; i <= 6; i++) Object.assign(LABELS, { [`pill_${i}_entity`]: `Distintivo ${i} / Pill ${i}`, [`pill_${i}_icon`]: "Icona / Icon", [`pill_${i}_tap_action`]: "Tocco / Tap" });
  for (let i = 1; i <= 4; i++) Object.assign(LABELS, {
    [`scene_${i}_script`]: "Script", [`scene_${i}_name`]: "Nome / Name", [`scene_${i}_name_entity`]: "Nome da entità / Name from entity",
    [`scene_${i}_icon`]: "Icona / Icon", [`scene_${i}_color`]: "Colore (#e53935, red…) / Color", [`scene_${i}_icon_map`]: "Icona per stato: stato=mdi:icona, … / Icon per state",[`scene_${i}_only_home`]: "Solo a chi è a casa / Only when at home", [`scene_${i}_highlight`]: "In evidenza / Highlight",
  });


  /* ---------- editor a schede ----------
     «Generale» è il modulo di sempre (ha-form); «Meteo» e «Calendario» caricano l'editor visuale
     della card incorporata con hui-card-element-editor, come fanno le pile di HA. Se quel pezzo
     interno non c'è (o cambia), si torna al riquadro YAML. */
  class GlassHomeCardEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: "open" }); this._tab = "main"; }
    setConfig(config) {
      this._config = { ...config };
      if (this._built !== this._tab) { this._render(); return; }
      this.shadowRoot.querySelectorAll("ha-form").forEach((f) => { f.data = this._config; });
      this.shadowRoot.querySelectorAll("hui-card-element-editor").forEach((ed) => {
        const want = this._config[ed.dataset.key];
        if (want && JSON.stringify(want) !== JSON.stringify(ed.value)) ed.value = want;
      });
    }
    set hass(h) {
      const first = !this._hass;
      this._hass = h;
      if (first && this._config) { this._built = null; this._render(); return; }
      this.shadowRoot.querySelectorAll("ha-form, hui-card-element-editor").forEach((el) => { el.hass = h; });
    }
    set lovelace(l) { this._lovelace = l; }
    _changed(cfg) {
      this._config = cfg;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
    }
    _subEditorReady() {
      if (customElements.get("hui-card-element-editor")) return Promise.resolve(true);
      if (!this._ready) {
        const tryLoad = (async () => {
          const helpers = await window.loadCardHelpers();
          const stack = await helpers.createCardElement({ type: "vertical-stack", cards: [] });
          await stack.constructor.getConfigElement();
          await customElements.whenDefined("hui-card-element-editor");
          return true;
        })().catch(() => false);
        this._ready = Promise.race([tryLoad, new Promise((r) => setTimeout(() => r(false), 4000))])
          .then((ok) => ok && !!customElements.get("hui-card-element-editor"));
      }
      return this._ready;
    }
    _form(schema) {
      const f = document.createElement("ha-form");
      f.hass = this._hass;
      f.data = this._config;
      f.schema = schema;
      f.computeLabel = (x) => LABELS[x.name] || x.name;
      f.addEventListener("value-changed", (e) => { e.stopPropagation(); this._changed({ ...this._config, ...e.detail.value }); });
      return f;
    }
    _sub(key, defType) {
      const box = document.createElement("div");
      const cfg = this._config[key] || { type: defType };
      this._yaml = this._yaml || {};
      const bar = document.createElement("div");
      bar.className = "bar";
      const btn = document.createElement("button");
      btn.className = "mode";
      bar.appendChild(btn);
      box.appendChild(bar);
      const slot = document.createElement("div");
      box.appendChild(slot);
      const showYaml = (label) => {
        slot.replaceChildren(this._form([{ name: key, selector: { object: {} } }]));
        btn.textContent = label;
      };
      btn.addEventListener("click", () => { this._yaml[key] = !this._yaml[key]; this._built = null; this._render(); });
      showYaml(this._yaml[key] ? "Editor visuale" : "Caricamento editor…");
      if (this._yaml[key] || !this._hass) { if (!this._hass) btn.textContent = "Editor visuale"; return box; }
      this._subEditorReady().then((ok) => {
        if (!box.isConnected || this._yaml[key]) return;
        if (!ok) { btn.textContent = "Editor visuale non disponibile"; btn.disabled = true; return; }
        const ed = document.createElement("hui-card-element-editor");
        ed.dataset.key = key;
        ed.hass = this._hass;
        if (this._lovelace) ed.lovelace = this._lovelace;
        ed.value = cfg;
        ed.addEventListener("config-changed", (e) => {
          e.stopPropagation();
          if (e.detail?.config) this._changed({ ...this._config, [key]: e.detail.config });
        });
        slot.replaceChildren(ed);
        btn.textContent = "Modifica in YAML";
        setTimeout(() => {
          if (!ed.isConnected) return;
          if (!(ed.shadowRoot && ed.shadowRoot.childElementCount) || ed.offsetHeight < 8) { this._yaml[key] = true; this._built = null; this._render(); }
        }, 4000);
      });
      return box;
    }
    async _render() {
      if (!this._config) return;
      const root = this.shadowRoot;
      this._built = this._tab;
      const all = GlassHomeCard.getConfigForm().schema;
      const strip = (list) => list.filter((x) => !["weather_card", "calendar_card"].includes(x.name)).map((x) => (x.schema ? { ...x, schema: strip(x.schema) } : x));
      const tabs = [["main", "Generale"], ["weather", "Meteo"], ["calendar", "Calendario"]];
      root.innerHTML = `<style>
        .tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
        .tabs button{font:500 14px var(--ha-font-family-body,system-ui);padding:7px 14px;border-radius:18px;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);cursor:pointer}
        .tabs button.on{background:var(--primary-color);border-color:var(--primary-color);color:var(--text-primary-color,#fff)}
        .note{font-size:12.5px;color:var(--secondary-text-color);margin:0 0 10px}
        .bar{display:flex;justify-content:flex-end;margin:10px 0 6px}
        .bar .mode:disabled{color:var(--secondary-text-color);cursor:default}
        .bar .mode{font:500 13px var(--ha-font-family-body,system-ui);padding:5px 12px;border-radius:14px;border:1px solid var(--divider-color);background:none;color:var(--primary-color);cursor:pointer}
      </style><div class="tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${this._tab === k ? "on" : ""}">${l}</button>`).join("")}</div><div class="body"></div>`;
      root.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => { this._tab = b.dataset.t; this._render(); }));
      const body = root.querySelector(".body");
      const tab = this._tab;
      if (tab === "main") {
        body.appendChild(this._form(strip(all)));
      } else if (tab === "weather") {
        body.appendChild(this._form([
          { name: "weather_height", selector: { number: { min: 110, max: 260, step: 5, unit_of_measurement: "px", mode: "box" } } },
          { name: "tip_1_entity", selector: { entity: { domain: ["binary_sensor", "input_boolean"] } } },
          { name: "tip_1_text", selector: { text: {} } },
          { name: "tip_2_entity", selector: { entity: { domain: ["binary_sensor", "input_boolean"] } } },
          { name: "tip_2_text", selector: { text: {} } },
        ]));
        body.appendChild(this._sub("weather_card", "custom:animated-weather-card"));
      } else {
        body.appendChild(this._form([{ name: "calendar_hide_empty", selector: { boolean: {} } }]));
        body.appendChild(this._sub("calendar_card", "custom:calendar-card-pro"));
      }
    }
  }
  if (!customElements.get(TAG + "-editor")) customElements.define(TAG + "-editor", GlassHomeCardEditor);

  if (!customElements.get(TAG)) customElements.define(TAG, GlassHomeCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: "Glass Home Card", description: "Climate, covers and solar tiles, Enter/Leave buttons and scenes in one glass card.", preview: false });
  console.info(`%c GLASS-HOME-CARD %c ${VERSION} `, "background:#7a5ae0;color:#fff;border-radius:3px 0 0 3px", "background:#eee;color:#333;border-radius:0 3px 3px 0");
})();
