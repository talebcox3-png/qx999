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
      width: min(350px, calc(100vw - 40px)); padding: 35px 24px 30px;
      border: 1.5px solid #00ff66; border-radius: 24px;
      background: #0c150e;
      box-shadow: 0 0 25px rgba(0,255,102,.15);
    }
    .qx999-title { text-align: center; color: #00ff66; font-size: 24px; font-weight: 500; margin: 0 0 6px; }
    .qx999-subtitle { text-align: center; color: #cccccc; font-size: 14px; margin-bottom: 25px; }
    .qx999-input { 
      width: 100%; padding: 14px 16px; border: 1px solid #1a3322; outline: none; 
      border-radius: 12px; background: #070d09; color: #fff; font-size: 18px; 
      letter-spacing: 3px; margin-bottom: 20px; box-sizing: border-box;
    }
    .qx999-enter { 
      width: 100%; padding: 14px; border: 0; border-radius: 12px; 
      background: #00ff66; color: #000; font-size: 17px; font-weight: 600; cursor: pointer; 
    }
    .qx999-error { text-align: center; color: #ff5050; font-size: 13px; margin-bottom: 10px; }

    .qx999-bot {
      position: fixed; width: 65px; height: 92px; right: 25px; top: 50%;
      transform: translateY(-50%); pointer-events: auto; user-select: none; touch-action: none; cursor: grab;
      display: flex; flex-direction: column; align-items: center; z-index: 999999;
    }
    .qx999-bot.dragging { cursor: grabbing; }
    .qx999-logo {
      position: relative; width: 65px; height: 65px; overflow: hidden; border-radius: 50%;
      background: #000; box-shadow: 0 4px 15px rgba(0,0,0,.6);
      transition: all 0.3s ease-in-out;
    }
    .qx999-logo img { width: 100%; height: 100%; display: block; object-fit: cover; border-radius: 50%; }
    
    .qx999-logo::after {
      content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: 50%;
      background: radial-gradient(circle, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.85) 100%);
    }

    .qx999-bot.scanning .qx999-logo {
      box-shadow: 0 0 30px rgba(0,255,102,.8), 0 4px 20px rgba(0,0,0,.9) !important;
      transform: scale(1.08);
    }

    .qx999-badge {
      margin-top: 6px; padding: 1px 6px; display: flex; justify-content: center; align-items: center;
      border: 1px solid #00ff66; border-radius: 4px; background: #0b0e14; color: #fff;
      font-size: 13px; font-weight: bold; font-family: Arial, sans-serif;
      text-shadow: 0 0 8px #000, 0 0 4px #00ff66;
    }

    .qx999-scan { position: fixed; inset: 0; display: none; pointer-events: none; z-index: 999998; }
    .qx999-scan.active { display: block; }
    
    .qx999-laser {
      position: absolute; left: 0; top: -120px; width: 100%; height: 120px;
      background: linear-gradient(to bottom, rgba(0,255,102,0), rgba(0,255,102,0.75));
      border-bottom: 4px solid #00ff66;
      box-shadow: 0 0 25px #00ff66;
      animation: qx999Laser 3s linear forwards;
    }
    @keyframes qx999Laser { 
      from { top: -120px; } 
      to { top: calc(100% + 120px); } 
    }
  `;
  root.appendChild(style);

  const loginOverlay = document.createElement("div");
  loginOverlay.className = "qx999-login-overlay";
  loginOverlay.innerHTML = `
    <div class="qx999-login">
      <div class="qx999-title">QX999 Login</div>
      <div class="qx999-subtitle">Enter password to continue</div>
      <div class="qx999-error" id="qx999-err"></div>
      <input type="password" class="qx999-input" id="qx999-pass" value="${localStorage.getItem(CONFIG.storageKey) || CONFIG.licenseKey}" placeholder="••••••••">
      <button class="qx999-enter" id="qx999-enter-btn">Enter</button>
    </div>
  `;
  root.appendChild(loginOverlay);

  const bot = document.createElement("div");
  bot.className = "qx999-bot";
  bot.style.display = "none";
  bot.innerHTML = `
    <div class="qx999-logo"><img src="${CONFIG.logo}" alt="logo"></div>
    <div class="qx999-badge">${CONFIG.name}</div>
  `;
  root.appendChild(bot);

  const scan = document.createElement("div");
  scan.className = "qx999-scan";
  scan.innerHTML = `<div class="qx999-laser"></div>`;
  root.appendChild(scan);

  const input = loginOverlay.querySelector("#qx999-pass");
  const errorDiv = loginOverlay.querySelector("#qx999-err");
  const enterBtn = loginOverlay.querySelector("#qx999-enter-btn");

  function unlock() {
    if (input.value.trim() !== CONFIG.licenseKey) {
      errorDiv.textContent = "Incorrect Password!";
      input.focus();
      return;
    }
    localStorage.setItem(CONFIG.storageKey, input.value.trim());
    loginOverlay.style.display = "none";
    bot.style.display = "flex";
  }

  enterBtn.addEventListener("click", unlock);
  input.addEventListener("keydown", e => { if (e.key === "Enter") unlock(); });

  let dragging = false, moved = false, startX = 0, startY = 0, originalLeft = 0, originalTop = 0;

  bot.addEventListener("pointerdown", e => {
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
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    const maxX = window.innerWidth - bot.offsetWidth;
    const maxY = window.innerHeight - bot.offsetHeight;
    bot.style.left = `${Math.max(0, Math.min(maxX, originalLeft + dx))}px`;
    bot.style.top = `${Math.max(0, Math.min(maxY, originalTop + dy))}px`;
    bot.style.right = "auto";
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
    bot.classList.add("scanning");
    scan.classList.add("active");
    
    const laser = scan.querySelector(".qx999-laser");
    laser.style.animation = "none";
    void laser.offsetWidth;
    laser.style.animation = "qx999Laser 3s linear forwards";

    setTimeout(() => {
      scan.classList.remove("active");
      bot.classList.remove("scanning");
      scanning = false;
      executeTrade(Math.random() >= 0.5 ? "UP" : "DOWN");
    }, CONFIG.scanDuration);
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
    }
  }
})();
