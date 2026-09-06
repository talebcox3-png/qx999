(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-NJQX";
    let logoUrl = "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png";
    let scanDurationSec = 3; 
    let isConfigured = localStorage.getItem("qx999_configured") === "true"; 
    let isScanning = false;

    let savedPass = localStorage.getItem("qx999_saved_pass") || licenseKey;
    let scanDelay = parseInt(localStorage.getItem("qx999_scan_delay")) || 5;
    let afterTradeScan = parseInt(localStorage.getItem("qx999_after_trade_scan")) || 5;
    let tradeDirection = localStorage.getItem("qx999_trade_direction") || "Random";

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
            background-size: 82%;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: none;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
            transition: all 0.3s ease-in-out;
        }
        #qx999-logo-icon.glowing {
            transform: scale(1.08);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.85);
        }
        ::placeholder {
            color: #777777;
            letter-spacing: normal;
        }
    `;
    document.head.appendChild(style);

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #111827; border: 2px solid #00ff88;
        color: #ffffff; padding: 30px 20px; border-radius: 16px;
        box-shadow: 0 0 30px rgba(0,255,136,0.3); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 5px 0; color:#ffffff; font-size:20px; font-weight:700;">QX999 Login</h3>
        <p style="font-size:12px; color:#9ca3af; margin:0 0 20px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${savedPass}" placeholder="••••••••" style="width:100%; padding:12px 15px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:8px; box-sizing:border-box; margin-bottom:20px; font-size:15px; outline:none; letter-spacing:2px; text-align:center;">
        <button id="qx_login_btn" style="width:100%; padding:12px; background:#00ff88; color:#0b0e14; border:none; border-radius:8px; font-weight:800; font-size:15px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #111827; border: 2px solid #00ff88;
        color: #ffffff; padding: 25px 20px; border-radius: 16px;
        box-shadow: 0 0 30px rgba(0,255,136,0.3); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff88; font-size:18px; text-align:center; font-weight:bold;">QX999 Settings</h3>
        <label style="font-size:12px; color:#9ca3af;">Scan delay (seconds)</label>
        <input type="number" id="cfg_scan_delay" value="${scanDelay}" style="width:100%; padding:10px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:8px; margin:5px 0 15px 0; box-sizing:border-box; outline:none;">
        
        <label style="font-size:12px; color:#9ca3af;">After trade scan (seconds)</label>
        <input type="number" id="cfg_after_trade" value="${afterTradeScan}" style="width:100%; padding:10px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:8px; margin:5px 0 15px 0; box-sizing:border-box; outline:none;">
        
        <label style="font-size:12px; color:#9ca3af;">Trade direction</label>
        <div style="display:flex; gap:8px; margin:8px 0 20px 0;">
            <button class="dir-btn" data-dir="Up" style="flex:1; padding:8px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:6px; cursor:pointer;">Up</button>
            <button class="dir-btn" data-dir="Down" style="flex:1; padding:8px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:6px; cursor:pointer;">Down</button>
            <button class="dir-btn" data-dir="Random" style="flex:1; padding:8px; background:#00ff88; color:#000; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Random</button>
        </div>
        <button id="cfg_save_btn" style="width:100%; padding:12px; background:#00ff88; color:#0b0e14; border:none; border-radius:8px; font-weight:800; font-size:15px; cursor:pointer;">Save</button>
    `;
    document.body.appendChild(settingsBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = 'none';

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 11px; margin-top: 4px;
        background: transparent; border: none; text-shadow: 0 0 4px #000;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    let dirButtons = settingsBox.querySelectorAll('.dir-btn');
    dirButtons.forEach(btn => {
        btn.onclick = () => {
            dirButtons.forEach(b => {
                b.style.background = '#1f2937';
                b.style.color = '#fff';
                b.style.border = '1px solid #374151';
            });
            btn.style.background = '#00ff88';
            btn.style.color = '#000';
            btn.style.border = 'none';
            tradeDirection = btn.getAttribute('data-dir');
        };
    });

    let isDragging = false, startX, startY, initialX, initialY;
    botContainer.addEventListener('pointerdown', (e) => {
        isDragging = false;
        startX = e.clientX; startY = e.clientY;
        initialX = botContainer.offsetLeft; initialY = botContainer.offsetTop;
        botContainer.setPointerCapture(e.pointerId);
    });

    botContainer.addEventListener('pointermove', (e) => {
        if (startX === undefined) return;
        let dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.right = 'auto';
    });

    botContainer.addEventListener('pointerup', (e) => {
        if (e.pointerId !== undefined && botContainer.hasPointerCapture(e.pointerId)) {
            botContainer.releasePointerCapture(e.pointerId);
        }
        startX = undefined;
    });

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

        let grad = ctx.createLinearGradient(0, scanY - 100, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 136, 0)');
        grad.addColorStop(1, 'rgba(0, 255, 136, 0.5)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - 100), scanCanvas.width, 100);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 8;
        if (scanY > scanCanvas.height) scanY = 0;

        scanAnimationId = requestAnimationFrame(drawScanLine);
    }

    function startScanProcess() {
        isScanning = true;
        logoIcon.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        drawScanLine();
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) cancelAnimationFrame(scanAnimationId);
        
        logoIcon.classList.remove('glowing');
        isScanning = false;

        executeHighAccuracyTrade();

        if (afterTradeScan > 0) {
            setTimeout(() => {
                if (!isScanning) startScanProcess();
            }, afterTradeScan * 1000);
        }
    }

    function executeHighAccuracyTrade() {
        let direction = tradeDirection;

        if (direction === "Random") {
            direction = Math.random() > 0.45 ? "UP" : "DOWN";
        } else {
            direction = direction.toUpperCase();
        }

        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, .btn'));
        let targetBtn = null;

        if (direction === "UP") {
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

    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_saved_pass", inputPass);
            loginBox.remove();
            botContainer.style.display = 'flex';
        } else {
            alert("Incorrect Password!");
        }
    };

    document.getElementById('cfg_save_btn').onclick = function () {
        scanDelay = parseInt(document.getElementById('cfg_scan_delay').value) || 5;
        afterTradeScan = parseInt(document.getElementById('cfg_after_trade').value) || 5;

        localStorage.setItem("qx999_scan_delay", scanDelay);
        localStorage.setItem("qx999_after_trade_scan", afterTradeScan);
        localStorage.setItem("qx999_trade_direction", tradeDirection);
        localStorage.setItem("qx999_configured", "true");

        isConfigured = true;
        settingsBox.style.display = 'none';
    };

    botContainer.onclick = function () {
        if (isDragging || isScanning) return;

        if (!isConfigured) {
            settingsBox.style.display = 'block';
        } else {
            startScanProcess();
        }
    };
})();
