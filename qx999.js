(() => {
  "use strict";

  const CONFIG = {
    name: "QX999",
    licenseKey: "ALVI5S-HECK",
    storageKey: "QX999_LICENSE",
    logo: "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png",
    scanDuration: 3000
  };

  document.getElementById("qx999-root")?.remove();

  const root = document.createElement("div");
  root.id = "qx999-root";

  Object.assign(root.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none",
    fontFamily: "Arial, Helvetica, sans-serif"
  });

  document.documentElement.appendChild(root);

  const style = document.createElement("style");
  style.textContent = `
    #qx999-root *, #qx999-root *::before, #qx999-root *::after { box-sizing: border-box; }

    .qx999-login-overlay {
      position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.58); backdrop-filter: blur(3px); pointer-events: auto;
    }
    .qx999-login {
      width: min(620px, calc(100vw - 70px)); min-height: 480px; padding: 44px 44px 48px;
      border: 2px solid #00ff66; border-radius: 30px;
      background: radial-gradient(circle at 50% 0%, rgba(0,255,102,.08), transparent 45%), #0c150e;
      box-shadow: 0 0 15px rgba(0,255,102,.35), 0 0 45px rgba(0,255,102,.08);
    }
    .qx999-title { text-align: center; color: #00ff66; font-size: 38px; font-weight: 500; letter-spacing: 2px; margin: 0 0 18px; }
    .qx999-subtitle { text-align: center; color: #a7c4ae; font-size: 25px; margin-bottom: 52px; }
    .qx999-input-wrap { width: 100%; height: 90px; padding: 3px; border-radius: 20px; background: #00ff66; box-shadow: 0 0 10px rgba(0,255,102,.45); }
    .qx999-input { width: 100%; height: 100%; border: 0; outline: 0; border-radius: 17px; background: #09100b; color: #eaffef; padding: 0 25px; font-size: 22px; letter-spacing: 1px; }
    .qx999-enter { width: 100%; height: 90px; margin-top: 28px; border: 0; border-radius: 18px; background: #00f55e; color: #031008; font-size: 29px; font-weight: 700; cursor: pointer; transition: .18s ease; }
    .qx999-enter:hover { background: #22ff76; box-shadow: 0 0 25px rgba(0,255,102,.45); }
    .qx999-error { height: 24px; margin-top: 13px; text-align: center; color: #ff5050; font-size: 15px; }

    .qx999-bot {
      position: fixed; width: 65px; height: 92px; left: 25px; top: 50%;
      transform: translateY(-50%); pointer-events: auto; user-select: none; touch-action: none; cursor: grab;
    }
    .qx999-bot.dragging { cursor: grabbing; }
    .qx999-logo {
      position: relative; width: 65px; height: 65px; overflow: hidden; border-radius: 50%;
      background: #000; border: 2px solid rgba(0,255,102,.65);
      box-shadow: 0 0 8px rgba(0,255,102,.28), 0 0 20px rgba(0,255,102,.12);
    }
    .qx999-logo img { width: 100%; height: 100%; display: block; object-fit: cover; }
    
    .qx999-logo::after {
      content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: 50%;
      background: radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.57) 70%, rgba(0,0,0,0.85) 100%);
    }

    .qx999-glow {
      position: absolute; inset: -8px; border-radius: 50%; border: 3px solid transparent; pointer-events: none; opacity: 0;
    }
    .qx999-bot.scanning .qx999-glow {
      opacity: 1; animation: qx999Pulse .8s infinite alternate, qx999Spin 1.4s linear infinite; border-color: #00ff66;
    }
    @keyframes qx999Pulse {
      from { box-shadow: 0 0 5px #00ff66, 0 0 12px #00ff66; }
      to { box-shadow: 0 0 15px #00ff66, 0 0 40px #00ff66; }
    }
    @keyframes qx999Spin { to { transform: rotate(360deg); } }

    .qx999-badge {
      position: absolute; left: 50%; top: 69px; transform: translateX(-50%);
      min-width: 68px; height: 23px; padding: 0 8px; display: flex; justify-content: center; align-items: center;
      border: 1px solid #00ff66; border-radius: 8px; background: #07130b; color: #00ff66;
      font-size: 11px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 0 8px rgba(0,255,102,.18);
    }

    .qx999-scan { position: fixed; inset: 0; display: none; overflow: hidden; background: linear-gradient(rgba(0,20,8,.12), rgba(0,20,8,.12)); pointer-events: none; }
    .qx999-scan.active { display: block; }
    .qx999-grid {
      position: absolute; inset: 0; opacity: .15;
      background-image: linear-gradient(rgba(0,255,102,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,.25) 1px, transparent 1px);
      background-size: 45px 45px;
    }
    .qx999-laser {
      position: absolute; left: 0; top: -8px; width: 100%; height: 5px; background: #00ff66;
      box-shadow: 0 0 5px #00ff66, 0 0 15px #00ff66, 0 0 35px #00ff66, 0 0 70px rgba(0,255,102,.8);
      animation: qx999Laser 3s linear forwards;
    }
    .qx999-laser::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 85px;
      background: linear-gradient(to bottom, rgba(0,255,102,.28), transparent); transform: translateY(100%);
    }
    @keyframes qx999Laser { from { top: -8px; } to { top: calc(100% + 8px); } }

    .qx999-result {
      position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(.8);
      min-width: 250px; padding: 25px 35px; border: 2px solid #00ff66; border-radius: 20px;
      background: rgba(5,20,10,.95); text-align: center; opacity: 0; pointer-events: none; transition: .25s ease;
      box-shadow: 0 0 20px rgba(0,255,102,.3);
    }
    .qx999-result.show { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    .qx999-result-label { color: #9ab5a0; font-size: 14px; margin-bottom: 7px; }
    .qx999-result-signal { font-size: 38px; font-weight: 800; letter-spacing: 2px; color: #00ff66; }
    .qx999-result-note { margin-top: 8px; color: #b7c9bb; font-size: 12px; }
  `;
  root.appendChild(style);

  const el = (tag, className, parent = root) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    parent.appendChild(node);
    return node;
  };

  const loginOverlay = el("div", "qx999-login-overlay");
  const login = el("div", "qx999-login", loginOverlay);
  const title = el("div", "qx999-title", login);
  title.textContent = "QX999 Login";
  const subtitle = el("div", "qx999-subtitle", login);
  subtitle.textContent = "Enter password to continue";
  const inputWrap = el("div", "qx999-input-wrap", login);
  const input = el("input", "qx999-input", inputWrap);
  input.type = "password";
  input.value = localStorage.getItem(CONFIG.storageKey) || CONFIG.licenseKey;
  const error = el("div", "qx999-error", login);
  const enter = el("button", "qx999-enter", login);
  enter.type = "button";
  enter.textContent = "Enter";

  const bot = el("div", "qx999-bot");
  const logo = el("div", "qx999-logo", bot);
  const img = document.createElement("img");
  img.src = CONFIG.logo;
  logo.appendChild(img);
  const glow = el("div", "qx999-glow", bot);
  const badge = el("div", "qx999-badge", bot);
  badge.textContent = CONFIG.name;
  bot.style.display = "none";

  const scan = el("div", "qx999-scan");
  el("div", "qx999-grid", scan);
  const laser = el("div", "qx999-laser", scan);

  const result = el("div", "qx999-result");
  const resultLabel = el("div", "qx999-result-label", result);
  resultLabel.textContent = "QX999 TRADE SIGNAL";
  const resultSignal = el("div", "qx999-result-signal", result);
  const resultNote = el("div", "qx999-result-note", result);

  function unlock() {
    if (input.value.trim() !== CONFIG.licenseKey) {
      error.textContent = "Invalid password/license key.";
      input.focus();
      return;
    }
    localStorage.setItem(CONFIG.storageKey, input.value.trim());
    loginOverlay.remove();
    bot.style.display = "block";
  }

  enter.addEventListener("click", unlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });

  let dragging = false, moved = false, startX = 0, startY = 0, originalLeft = 0, originalTop = 0;

  bot.addEventListener("pointerdown", e => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true; moved = false;
    bot.classList.add("dragging");
    const rect = bot.getBoundingClientRect();
    startX = e.clientX; startY = e.clientY;
    originalLeft = rect.left; originalTop = rect.top;
    bot.setPointerCapture?.(e.pointerId);
  });

  bot.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
    const maxX = window.innerWidth - bot.offsetWidth;
    const maxY = window.innerHeight - bot.offsetHeight;
    bot.style.left = `${Math.max(0, Math.min(maxX, originalLeft + dx))}px`;
    bot.style.top = `${Math.max(0, Math.min(maxY, originalTop + dy))}px`;
    bot.style.transform = "none";
  });

  const pointerUp = e => {
    if (!dragging) return;
    dragging = false;
    bot.classList.remove("dragging");
    bot.releasePointerCapture?.(e.pointerId);
    if (!moved) startScan();
  };

  bot.addEventListener("pointerup", pointerUp);
  bot.addEventListener("pointercancel", pointerUp);

  let scanning = false;
  function startScan() {
    if (scanning) return;
    scanning = true;
    result.classList.remove("show");
    bot.classList.add("scanning");
    scan.classList.add("active");
    laser.style.animation = "none";
    void laser.offsetWidth;
    laser.style.animation = "qx999Laser 3s linear forwards";
    setTimeout(() => { finishScan(); }, CONFIG.scanDuration);
  }

  function executeTrade(signal) {
    const allElements = Array.from(document.querySelectorAll('button, div[role="button"], a'));
    let targetBtn = null;

    if (signal === "UP") {
      targetBtn = allElements.find(el => {
        let text = (el.innerText || el.textContent || "").trim();
        return text.includes("Up") || text.includes("Call") || text.includes("Higher");
      });
    } else {
      targetBtn = allElements.find(el => {
        let text = (el.innerText || el.textContent || "").trim();
        return text.includes("Down") || text.includes("Put") || text.includes("Lower");
      });
    }

    if (targetBtn) {
      targetBtn.click();
      return "Trade Executed Automatically!";
    } else {
      return "Trade button not found on page.";
    }
  }

  function finishScan() {
    scan.classList.remove("active");
    bot.classList.remove("scanning");
    scanning = false;

    const signal = Math.random() >= 0.5 ? "UP" : "DOWN";
    resultSignal.textContent = signal;

    const statusMsg = executeTrade(signal);
    resultNote.textContent = statusMsg;

    result.classList.add("show");
    setTimeout(() => { result.classList.remove("show"); }, 4000);
  }
})();
