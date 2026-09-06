(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-NJQX";
    let logoUrl = "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png";
    let isScanning = false;

    let scanDelay = parseInt(localStorage.getItem("qx999_scan_delay")) || 5;
    let afterTradeScan = parseInt(localStorage.getItem("qx999_after_scan")) || 5;
    let tradeDirection = localStorage.getItem("qx999_direction") || "Random";
    let isConfigured = localStorage.getItem("qx999_configured") === "true";

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-circle-bot {
            position: fixed; top: 120px; right: 20px;
            display: flex; flex-direction: column; align-items: center;
            z-index: 999999; cursor: move; user-select: none; touch-action: none;
        }
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background-color: rgba(0, 0, 0, 0.65);
            background-image: url('${logoUrl}');
            background-position: center;
            background-size: 78%;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: box-shadow 0.3s ease-in-out;
        }
        #qx999-logo-icon.glowing {
            box-shadow: 0 0 25px #00ff88, 0 0 50px rgba(0, 255, 136, 0.6) !important;
        }
        #qx999-logo-text {
            color: #00ff88; font-weight: bold; font-size: 12px; margin-top: 5px;
            text-shadow: 0 0 2px #000; transition: text-shadow 0.3s ease-in-out;
        }
        #qx999-logo-text.glowing {
            text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88 !important;
        }
        .qx-modal-input {
            width: 100%; padding: 12px; background: #0c121e; color: #00ff88;
            border: 1px solid #1a2332; border-radius: 10px; box-sizing: border-box;
            margin-bottom: 15px; outline: none; font-size: 15px; text-align: center;
        }
        .qx-btn-dir {
            flex: 1; padding: 10px; background: #1a2332; color: #fff; border: 1px solid #2a364a;
            border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px;
        }
        .qx-btn-dir.active {
            background: #00ff88; color: #0b0e14; border-color: #00ff88; font-weight: 800;
        }
        #qx_pass::selection {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
        }
    `;
    document.head.appendChild(style);

    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";
    let savedPass = localStorage.getItem("qx999_saved_pass") || licenseKey;

    // EXACT LOOK LOGIN BOX
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #0b111a; border: 1.5px solid #00ff88;
        color: #ffffff; padding: 30px 22px; border-radius: 18px;
        box-shadow: 0 0 25px rgba(0, 255, 136, 0.15); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 6px 0; color:#00ff88; font-size:22px; font-weight:600; letter-spacing:0.5px;">QX999 Login</h3>
        <p style="font-size:13px; color:#a1a1aa; margin:0 0 22px 0;">Enter password to continue</p>
        <div style="position:relative; width:100%; margin-bottom:22px;">
            <input type="password" id="qx_pass" value="${savedPass}" placeholder="••••••••" style="width:100%; padding:14px; background:#070a10; color:#ffffff; border:1px solid #00ff88; border-radius:12px; box-sizing:border-box; font-size:18px; outline:none; text-align:left; letter-spacing:4px; font-family:monospace;">
        </div>
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff88; color:#000000; border:none; border-radius:12px; font-weight:700; font-size:16px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    // AUTO-HIGHLIGHT / MASK SELECTION LIKE SCREENSHOT
    function highlightPassword() {
        let passInput = document.getElementById('qx_pass');
        if (passInput) {
            passInput.focus();
            passInput.setSelectionRange(0, passInput.value.length);
        }
    }

    if (!isLoggedIn) {
        setTimeout(highlightPassword, 100);
    }

    // SETTINGS BOX
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #0b111a; border: 1.5px solid #00ff88;
        color: #ffffff; padding: 25px 20px; border-radius: 18px;
        box-shadow: 0 0 25px rgba(0, 255, 136, 0.15); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff88; font-size:18px; font-weight:700; text-align:center;">QX999 Settings</h3>
        <label style="font-size:12px; color:#d1d5db; display:block; margin-bottom:5px;">Scan delay (seconds)</label>
        <input type="number" id="qx_delay" class="qx-modal-input" value="${scanDelay}">
        
        <label style="font-size:12px; color:#d1d5db; display:block; margin-bottom:2px;">After trade scan (seconds)</label>
        <span style="font-size:10px; color:#6b7280; display:block; margin-bottom:6px;">0 = stop only when you tap the icon</span>
        <input type="number" id="qx_after_scan" class="qx-modal-input" value="${afterTradeScan}">
        
        <label style="font-size:12px; color:#d1d5db; display:block; margin-bottom:8px;">Trade direction</label>
        <div style="display:flex; gap:8px; margin-bottom:20px;">
            <button class="qx-btn-dir ${tradeDirection === 'Up' ? 'active' : ''}" data-dir="Up">Up</button>
            <button class="qx-btn-dir ${tradeDirection === 'Down' ? 'active' : ''}" data-dir="Down">Down</button>
            <button class="qx-btn-dir ${tradeDirection === 'Random' ? 'active' : ''}" data-dir="Random">Random</button>
        </div>
        <button id="qx_save_btn" style="width:100%; padding:12px; background:#00ff88; color:#0b0e14; border:none; border-radius:10px; font-weight:800; font-size:15px; cursor:pointer;">Save</button>
    `;
    document.body.appendChild(settingsBox);

    // BOT FLOATING ICON
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = (isLoggedIn && isConfigured) ? 'flex' : 'none';

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.id = 'qx999-logo-text';
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // DRAGGABLE LOGIC
    let isDragging = false, startX, startY, initialX, initialY;
    botContainer.addEventListener('pointerdown', (e) => {
        isDragging = false;
        startX = e.clientX; startY = e.clientY;
        initialX = botContainer.offsetLeft; initialY = botContainer.offsetTop;
        botContainer.setPointerCapture(e.pointerId);
    });
    botContainer.addEventListener('pointermove', (e) => {
        let dx = e.clientX - startX; let dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.right = 'auto';
    });

    // SCAN CANVAS
    let scanCanvas = document.createElement('canvas');
    scanCanvas.id = 'qx999-scan-canvas';
    scanCanvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        pointer-events: none; z-index: 999998; display: none;
    `;
    document.body.appendChild(scanCanvas);
    let ctx = scanCanvas.getContext('2d');

    function resizeCanvas() {
        scanCanvas.width = window.innerWidth;
        scanCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let scanAnimationId = null, scanY = 0, scanStartTime = 0;

    function drawScanLine() {
        let elapsedSec = (Date.now() - scanStartTime) / 1000;

        if (elapsedSec >= scanDelay) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 9;
        if (scanY > scanCanvas.height) scanY = 0;

        scanAnimationId = requestAnimationFrame(drawScanLine);
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) cancelAnimationFrame(scanAnimationId);
        
        logoIcon.classList.remove('glowing');
        logoText.classList.remove('glowing');
        isScanning = false;

        executeHighAccuracyTrade();

        if (afterTradeScan > 0) {
            setTimeout(() => {
                startAnalysis();
            }, afterTradeScan * 1000);
        }
    }

    function executeHighAccuracyTrade() {
        let dir = tradeDirection;
        
        if (dir === "Random") {
            let candles = document.querySelectorAll('path, rect');
            let greenCandles = 0, redCandles = 0;
            candles.forEach(c => {
                let fill = c.getAttribute('fill') || c.style.fill || '';
                if (fill.includes('255') || fill.includes('green') || fill.includes('00e')) greenCandles++;
                if (fill.includes('red') || fill.includes('ff')) redCandles++;
            });
            dir = greenCandles >= redCandles ? "Up" : "Down";
        }

        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a'));
        let targetBtn = allElements.find(el => {
            let text = (el.innerText || el.textContent || "").trim();
            if (dir === "Up") return text.includes("Up") || text.includes("Call") || text.includes("Higher");
            return text.includes("Down") || text.includes("Put") || text.includes("Lower");
        });

        if (targetBtn) {
            targetBtn.click();
        }
    }

    function startAnalysis() {
        if (isScanning) return;
        isScanning = true;

        logoIcon.classList.add('glowing');
        logoText.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        drawScanLine();
    }

    // LOGIN ACTION
    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_logged_in", "true");
            localStorage.setItem("qx999_saved_pass", inputPass);
            loginBox.style.display = 'none';

            if (!isConfigured) {
                settingsBox.style.display = 'block';
            } else {
                botContainer.style.display = 'flex';
            }
        } else {
            alert("Incorrect Password!");
        }
    };

    // SETTINGS DIRECTION BUTTONS
    let dirButtons = settingsBox.querySelectorAll('.qx-btn-dir');
    dirButtons.forEach(btn => {
        btn.onclick = function() {
            dirButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tradeDirection = this.getAttribute('data-dir');
        };
    });

    // SAVE SETTINGS
    document.getElementById('qx_save_btn').onclick = function () {
        scanDelay = parseInt(document.getElementById('qx_delay').value) || 5;
        afterTradeScan = parseInt(document.getElementById('qx_after_scan').value) || 0;

        localStorage.setItem("qx999_scan_delay", scanDelay);
        localStorage.setItem("qx999_after_scan", afterTradeScan);
        localStorage.setItem("qx999_direction", tradeDirection);
        localStorage.setItem("qx999_configured", "true");

        isConfigured = true;
        settingsBox.style.display = 'none';
        botContainer.style.display = 'flex';
    };

    // BOT CLICK EVENT
    botContainer.onclick = function () {
        if (isDragging) return;
        startAnalysis();
    };
})();
