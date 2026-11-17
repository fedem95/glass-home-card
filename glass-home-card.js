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
  const VERSION = "0.2.0";
  const HOLD_MS = 600;

  const STR = {
    it: {
      home: "Casa", people: "Entra / Esci", scenes: "Scenari", all: "Tutti",
      climate: "Clima", covers: "Tapparelle", solar: "Fotovoltaico",
      heats: "riscalda", cools: "raffresca", dries: "deumidifica", idle: "fermo",
      and: "e", rooms: "stanze", open: "aperte", openOne: "aperta", allClosed: "Tutte chiuse", slit: "a fessura",
      stopped: "Fermo", today: "oggi",
      enter: "Entra", leave: "Esci", enterBox: "Entra box", leaveBox: "Esci box",
    },
    en: {
      home: "Home", people: "Come & go", scenes: "Scenes", all: "All",
      climate: "Climate", covers: "Covers", solar: "Solar",
      heats: "heating", cools: "cooling", dries: "drying", idle: "idle",
      and: "and", rooms: "rooms", open: "open", openOne: "open", allClosed: "All closed", slit: "ajar",
      stopped: "Idle", today: "today",
      enter: "Enter", leave: "Leave", enterBox: "Enter by car", leaveBox: "Leave by car",
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
    scene_trigger: "hold",
  };

  /* icone disegnate a mano, animate col CSS */
  const SVG = {
    thermo: `<svg class="term" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><rect class="merc" x="9.8" y="7" width="1.4" height="9" rx=".7" fill="currentColor" stroke="none"/><circle cx="10.5" cy="17.6" r="1.9" fill="currentColor" stroke="none"/><path class="hw" d="M17 11c-.8-.8.8-1.6 0-2.4"/><path class="hw" d="M19.5 11c-.8-.8.8-1.6 0-2.4"/><path class="hw" d="M22 11c-.8-.8.8-1.6 0-2.4"/><g class="sf" stroke-width="1.5"><path d="M19.5 5v6M16.9 6.5l5.2 3M16.9 9.5l5.2-3"/></g></svg>`,
    solar: `<svg class="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path class="pan" d="M2.5 16.5h13l-2-8h-9z"/><path d="M3.4 12.5h11.2M7.6 8.5l-.8 8M10.6 8.5l.8 8M9 16.5v3.5M6 21h6"/><g class="sun" stroke-width="1.6"><circle cx="19" cy="5.5" r="2"/><path d="M19 1.3v1M19 8.7v1M14.8 5.5h1M22.2 5.5h1M16 2.5l.7.7M21.3 7.8l.7.7M16 8.5l.7-.7M21.3 3.2l.7-.7"/></g></svg>`,
    shutter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="1"/><path d="M4 7.5h16M4 12h16M2 21h20M12 17v2"/></svg>`,
    shutterClosed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="1"/><path d="M4 6.5h16M4 10h16M4 13.5h16M4 17h16M2 21h20"/></svg>`,
    enter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/><path d="M3 12h11M10 8l4 4-4 4"/></svg>`,
    leave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><path d="M10 12h11M17 8l4 4-4 4"/></svg>`,
    garage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 16h10"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  };

  const CSS = `
:host{display:block;
  --gh-fg:var(--primary-text-color,#15171c); --gh-mut:var(--secondary-text-color,#6b7280);
  --gh-heat:#d9772f; --gh-cool:#2f72d9; --gh-sun:#c99a10; --gh-ok:#3f9b3a; --gh-blue:#2f72d9; --gh-violet:#7a5ae0; --gh-orange:#d9772f;
  --gh-r:20px; --gh-gap:14px;
  font-family:var(--ha-font-family-body, -apple-system, system-ui, sans-serif);}
.wrap[data-scheme="dark"]{--gh-heat:#f3a76a;--gh-cool:#7fb2ff;--gh-sun:#f7d36b;--gh-ok:#8fd18a;--gh-blue:#7fb2ff;--gh-violet:#b49cff;--gh-orange:#f3a76a}
.wrap{display:flex;flex-direction:column;gap:var(--gh-gap);color:var(--gh-fg)}
.sect{font-size:13px;font-weight:600;color:var(--gh-mut);margin:2px 2px -6px;display:flex;justify-content:space-between;align-items:center}
.sect .all{font-weight:500;cursor:pointer;padding:4px 0 4px 12px;-webkit-tap-highlight-color:transparent}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{display:flex;align-items:center;gap:11px;padding:0 14px;height:66px;border-radius:var(--gh-r);cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:background .25s,color .25s,transform .12s;min-width:0;box-sizing:border-box;position:relative}
.tile.wide{grid-column:span 2}
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
.av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:600;font-size:14px;color:#fff;cursor:pointer;background:linear-gradient(135deg,#6b8cff,#8b5cf6) center/cover;box-shadow:0 0 0 2.5px rgba(255,255,255,.7),0 0 0 4.5px var(--ring);-webkit-tap-highlight-color:transparent}
.wrap[data-scheme="dark"] .av{box-shadow:0 0 0 2.5px rgba(0,0,0,.5),0 0 0 4.5px var(--ring)}
.av.p2{background-image:linear-gradient(135deg,#f59e9e,#e06c9f)}
.eeb{display:flex;gap:6px;flex:1;justify-content:flex-end}
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
      if (this._hass) this._render();
    }

    set hass(hass) {
      this._hass = hass;
      const sig = this._signature();
      if (sig !== this._sig) { this._sig = sig; this._render(); }
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
      return ids;
    }
    _signature() {
      const h = this._hass;
      return (h.themes?.darkMode ? "d" : "l") + (h.user?.id || "") + this._ids().map((id) => {
        const s = h.states[id];
        return s ? `${s.state}|${s.attributes.hvac_action || ""}|${s.attributes.last_triggered || ""}|${s.attributes.entity_picture || ""}` : "-";
      }).join(";");
    }

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
      if (hu != null) parts.push(`${this._fmt(hu, 0)}%`);
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

      /* riquadri */
      const tiles = [];
      if ((c.climate_entities || []).length || c.temperature_entity) {
        const cl = this._climate();
        const col = cl.mode === "heat" ? "var(--gh-heat)" : cl.mode === "cool" ? "var(--gh-cool)" : cl.mode === "dry" ? "var(--gh-blue)" : "var(--gh-mut)";
        tiles.push(`<div class="tile wide surf${cl.mode !== "idle" ? " on" : ""}" data-hv="${cl.mode}" style="--c:${col}" ${act("climate", c.climate_tap_action, c.climate_hold_action, (c.climate_entities || [])[0])}>
          <div class="ico">${SVG.thermo}</div><div class="t"><div class="n">${esc(c.climate_name || this._t("climate"))}</div><div class="v">${esc(cl.text)}</div></div></div>`);
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
        const avs = ppl.map((p, i) => {
          const s = h.states[p], pic = s.attributes.entity_picture;
          const ring = s.state === "home" ? "var(--gh-ok)" : "rgba(127,127,140,.55)";
          const ini = (s.attributes.friendly_name || p).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          return `<div class="av p${i + 1}" style="--ring:${ring};${pic ? `background-image:url('${esc(pic)}')` : ""}" title="${esc(s.attributes.friendly_name)}" ${act("person" + (i + 1), c[`person_${i + 1}_tap_action`] || { action: "more-info" }, null, p)}>${pic ? "" : esc(ini)}</div>`;
        }).join("");
        const b1 = atHome
          ? `<button style="--c:var(--gh-orange)" ${act("enter", c.enter_tap_action, null)}>${SVG.leave}${esc(this._t("leave"))}</button>`
          : `<button style="--c:var(--gh-ok)" ${act("enter", c.enter_tap_action, null)}>${SVG.enter}${esc(this._t("enter"))}</button>`;
        const b2 = c.show_box ? `<button style="--c:var(--gh-blue)" ${act("box", c.box_tap_action, null)}>${SVG.garage}${esc(this._t(atHome ? "leaveBox" : "enterBox"))}</button>` : "";
        out.push(title(c.title_people || this._t("people")) + `<div class="ee surf"><div class="ppl">${avs}</div><div class="eeb">${b1}${b2}</div></div>`);
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
        scenes.push(`<div class="sc surf${c[`scene_${i}_highlight`] ? " cur" : ""}${sent}" style="--c:${col};--hold:${HOLD_MS}ms" ${act(key, tap, hold, script)}><span class="fill"></span><ha-icon icon="${esc(icon)}"></ha-icon><span class="lbl">${esc(name)}</span>${ok}</div>`);
      }
      if (scenes.length) {
        const all = c.all_tap_action && c.all_tap_action.action !== "none" ? `<span class="all" ${act("all", c.all_tap_action, null)}>${esc(this._t("all"))} ›</span>` : "";
        out.push(title(c.title_scenes || this._t("scenes"), all) + `<div class="scen" style="grid-template-columns:repeat(${scenes.length},1fr)">${scenes.join("")}</div>`);
      }

      this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="wrap" data-style="${esc(c.style)}" data-scheme="${scheme}">${out.join("")}</div>`;
      this._wire();
      clearTimeout(this._timer);
      if (nextExpiry) this._timer = setTimeout(() => { this._sig = ""; this._render(); }, nextExpiry + 50);
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
    static getConfigForm() {
      const scene = (i) => ({
        type: "expandable", name: "", title: `Scena ${i} / Scene ${i}`, schema: [
          { name: `scene_${i}_script`, selector: { entity: { domain: "script" } } },
          { name: `scene_${i}_name`, selector: { text: {} } },
          { name: `scene_${i}_name_entity`, selector: { entity: {} } },
          { name: `scene_${i}_icon`, selector: { icon: {} } },
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
          { type: "expandable", name: "", title: "Clima / Climate", schema: [
            { name: "climate_entities", selector: { entity: { domain: "climate", multiple: true } } },
            { name: "temperature_entity", selector: { entity: { domain: "sensor" } } },
            { name: "humidity_entity", selector: { entity: { domain: "sensor" } } },
            { name: "room_names", selector: { text: {} } },
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
            { name: "enter_tap_action", selector: { ui_action: {} } },
            { name: "show_box", selector: { boolean: {} } },
            { name: "box_tap_action", selector: { ui_action: {} } },
          ] },
          { type: "expandable", name: "", title: "Scenari / Scenes", schema: [
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
    humidity_entity: "Umidità media / Indoor humidity", room_names: "Nomi corti: Stanza lunga=Corta, … / Short room names",climate_tap_action: "Tocco / Tap",
    covers_open_entity: "Sensore «quante aperte» / Open count sensor", covers_slit_entity: "Sensore «a fessura» / Ajar count sensor", covers_tap_action: "Tocco / Tap",
    solar_power_entity: "Potenza / Power", solar_energy_entity: "Energia di oggi / Energy today", solar_min_power: "Acceso sopra / On above", solar_tap_action: "Tocco / Tap",
    person_1: "Persona 1 / Person 1", person_2: "Persona 2 / Person 2", person_1_tap_action: "Tocco persona 1", person_2_tap_action: "Tocco persona 2",
    enter_tap_action: "Tasto Entra-Esci / Enter-Leave", show_box: "Tasto box / Car button", box_tap_action: "Tasto box: tocco",
    scene_trigger: "Avvio / Run with", all_tap_action: "«Tutti» / «All»",
  };
  for (let i = 1; i <= 4; i++) Object.assign(LABELS, {
    [`scene_${i}_script`]: "Script", [`scene_${i}_name`]: "Nome / Name", [`scene_${i}_name_entity`]: "Nome da entità / Name from entity",
    [`scene_${i}_icon`]: "Icona / Icon", [`scene_${i}_icon_map`]: "Icona per stato: stato=mdi:icona, … / Icon per state",[`scene_${i}_only_home`]: "Solo a chi è a casa / Only when at home", [`scene_${i}_highlight`]: "In evidenza / Highlight",
  });

  if (!customElements.get(TAG)) customElements.define(TAG, GlassHomeCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: "Glass Home Card", description: "Climate, covers and solar tiles, Enter/Leave buttons and scenes in one glass card.", preview: false });
  console.info(`%c GLASS-HOME-CARD %c ${VERSION} `, "background:#7a5ae0;color:#fff;border-radius:3px 0 0 3px", "background:#eee;color:#333;border-radius:0 3px 3px 0");
})();
