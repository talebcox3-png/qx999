(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co.com/5hPpvrTB/Firefly-Remove-Background.png";
    let scanDelaySec = 5;
    let afterTradeScanSec = 5;
    let selectedDirection = "Random";
    let isConfigured = false;
    let tapCount = 0;
    let tapTimer = null;

    let visitCount = parseInt(localStorage.getItem("qx999_visits") || "0") + 1;
    localStorage.setItem("qx999_visits", visitCount);
    let shouldPreFill = visitCount > 1;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-circle-bot {
            position: fixed; top: 120px; right: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 999999; cursor: move; user-select: none; touch-action: none;
            padding: 4px; border-radius: 50%;
        }
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background-color: rgba(0, 0, 0, 0.85);
            background-image: url('${logoUrl}');
            background-position: 52% center;
            background-size: 88%;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: 2px solid #00ff66;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
            pointer-events: none;
            transition: all 0.3s ease-in-out;
        }
        #qx999-circle-bot.glowing #qx999-logo-icon {
            border-color: #00ff66;
            box-shadow: 0 0 25px #00ff66, 0 0 50px #00ff66, inset 0 0 15px #00ff66 !important;
            transform: scale(1.05);
        }
        #qx999-circle-bot span {
            color: #ffffff !important; font-weight: bold; font-size: 13px;
            margin-top: 5px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-family: Arial, sans-serif; pointer-events: none;
        }
        ::placeholder { color: #555555; }
        
        .qx-dir-btn {
            width: 100%; padding: 12px; background: #070d09; color: #fff;
            border: 1px solid #1a3322; border-radius: 12px; font-weight: 600;
            font-size: 15px; cursor: pointer; margin-bottom: 8px; text-align: center;
            transition: all 0.2s;
        }
        .qx-dir-btn.active {
            background: #00ff66; color: #000; border-color: #00ff66;
            box-shadow: 0 0 15px rgba(0,255,102,0.4);
        }
    `;
    document.head.appendChild(style);

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #0e1710; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 30px 24px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,255,102,0.25); z-index: 999999;
        font-family: sans-serif; text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 8px 0; color:#00ff66; font-size:22px; font-weight:600;">QX999 Login</h3>
        <p style="font-size:13px; color:#aaaaaa; margin:0 0 22px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${shouldPreFill ? licenseKey : ''}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:2px solid #00ff66; border-radius:12px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; letter-spacing:3px; text-align:center; box-shadow: 0 0 15px rgba(0,255,102,0.4);">
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow: 0 4px 12px rgba(0,255,102,0.3);">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #0e1710; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 24px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,255,102,0.25); z-index: 999999;
        font-family: Arial, sans-serif; display: none; max-height: 90vh; overflow-y: auto;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:20px; text-align:center; font-weight:bold;">QX999 Settings</h3>
        
        <label style="font-size:13px; color:#bbb; display:block; margin-bottom:5px;">Scan delay (seconds)</label>
        <input type="number" id="qx_delay" value="5" min="1" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:15px; outline:none; font-size:16px;">
        
        <label style="font-size:13px; color:#bbb; display:block; margin-bottom:5px;">After trade scan (seconds)</label>
        <div style="font-size:11px; color:#777; margin-bottom:5px;">0 = stop only when you tap the icon</div>
        <input type="number" id="qx_after_delay" value="5" min="0" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:15px; outline:none; font-size:16px;">
        
        <label style="font-size:13px; color:#bbb; display:block; margin-bottom:8px;">Trade direction</label>
        <div id="qx_dir_up" class="qx-dir-btn">Up</div>
        <div id="qx_dir_down" class="qx-dir-btn">Down</div>
        <div id="qx_dir_random" class="qx-dir-btn active">Random</div>
        
        <button id="qx_save_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:16px; cursor:pointer; margin-top:10px;">Save</button>
        <div style="font-size:11px; color:#777; text-align:center; margin-top:12px;">3 taps on icon to open · tap outside to close</div>
    `;
    document.body.appendChild(settingsBox);

    let dirBtns = ['Up', 'Down', 'Random'];
    dirBtns.forEach(d => {
        let btnId = d === 'Up' ? 'qx_dir_up' : (d === 'Down' ? 'qx_dir_down' : 'qx_dir_random');
        document.getElementById(btnId).onclick = function () {
            document.querySelectorAll('.qx-dir-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedDirection = d;
        };
    });

    window.addEventListener('click', function(e) {
        if (settingsBox.style.display === 'block' && !settingsBox.contains(e.target) && !botContainer.contains(e.target)) {
            settingsBox.style.display = 'none';
        }
    });

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = 'none';

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';
    let logoText = document.createElement('span');
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    let isDragging = false, hasMoved = false;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    function dragStart(e) {
        hasMoved = false;
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        let rect = botContainer.getBoundingClientRect();
        initialX = rect.left; initialY = rect.top;
        botContainer.style.right = 'auto';
        botContainer.style.left = initialX + 'px';
        botContainer.style.top = initialY + 'px';

        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
        } else {
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', dragEnd);
        }
    }

    function dragMove(e) {
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX, dy = clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true; isDragging = true;
            if (e.cancelable) e.preventDefault();
        }
        if (isDragging) {
            botContainer.style.left = (initialX + dx) + 'px';
            botContainer.style.top = (initialY + dy) + 'px';
        }
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        setTimeout(() => { isDragging = false; }, 50);
    }

    botContainer.addEventListener('mousedown', dragStart);
    botContainer.addEventListener('touchstart', dragStart, { passive: false });

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

    let scanAnimationId = null, scanY = 0, isScanning = false, scanStartTime = 0;
    let tradeExecuted = false;

    function startScanLine() {
        let currentTime = Date.now();
        let elapsedSec = (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDelaySec) {
            if (!tradeExecuted) {
                tradeExecuted = true;
                executeTrade();
            }
            if (afterTradeScanSec > 0 && elapsedSec >= (scanDelaySec + afterTradeScanSec)) {
                finishScan();
                return;
            }
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);

        let trailHeight = 180;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.3, 'rgba(0, 255, 102, 0.1)');
        grad.addColorStop(0.7, 'rgba(0, 255, 102, 0.3)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.85)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 30;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 12;
        if (scanY > scanCanvas.height) {
            scanY = 0;
        }

        scanAnimationId = requestAnimationFrame(startScanLine);
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        botContainer.classList.remove('glowing');
        isScanning = false;
    }

    function executeTrade() {
        let direction = selectedDirection;
        if (direction === "Random") {
            direction = Math.random() >= 0.5 ? "Up" : "Down";
        }

        let allButtons = Array.from(document.querySelectorAll('button'));
        let targetBtn = null;

        if (direction === "Up") {
            targetBtn = allButtons.find(b => {
                let txt = (b.innerText || b.textContent || "").trim().toLowerCase();
                let cls = (b.className || "").toString().toLowerCase();
                return txt.includes("up") || cls.includes("success") || cls.includes("call") || cls.includes("_up");
            }) || allButtons[0];
        } else {
            targetBtn = allButtons.find(b => {
                let txt = (b.innerText || b.textContent || "").trim().toLowerCase();
                let cls = (b.className || "").toString().toLowerCase();
                return txt.includes("down") || cls.includes("danger") || cls.includes("put") || cls.includes("_down");
            }) || allButtons[1];
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            loginBox.remove();
            botContainer.style.display = 'flex';
        }
    };

    document.getElementById('qx_save_btn').onclick = function () {
        let delayVal = parseFloat(document.getElementById('qx_delay').value);
        let afterVal = parseFloat(document.getElementById('qx_after_delay').value);
        if (!isNaN(delayVal) && delayVal >= 1) scanDelaySec = delayVal;
        if (!isNaN(afterVal) && afterVal >= 0) afterTradeScanSec = afterVal;
        
        settingsBox.style.display = 'none';
        isConfigured = true;
    };

    botContainer.addEventListener('click', function (e) {
        if (hasMoved || isDragging) return;

        tapCount++;
        if (tapTimer) clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
            if (tapCount >= 3) {
                settingsBox.style.display = 'block';
                tapCount = 0;
                return;
            }
            tapCount = 0;

            if (!isConfigured) {
                settingsBox.style.display = 'block';
                return;
            }
            if (isScanning) {
                if (afterTradeScanSec === 0) {
                    finishScan();
                }
                return;
            }

            isScanning = true;
            tradeExecuted = false;
            botContainer.classList.add('glowing');
            scanCanvas.style.display = 'block';
            scanY = 0;
            scanStartTime = Date.now();
            startScanLine();
        }, 400);
    });
})();
