(function () {
    ['qx999-bot-container', 'qx999-settings-modal', 'qx999-login-modal', 'qx999-scan-canvas'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    const licenseKey = "Alvi1234";
    const logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    let scanDurationSec = 5; // 5 Sec Setup
    let isConfigured = false;
    let isScanning = false;
    let greenCandleScore = 0;
    let redCandleScore = 0;
    let fastScanner = null;

    // Insert CSS Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-bot-container {
            position: fixed; top: 150px; right: 20px; z-index: 999999;
            font-family: Arial, sans-serif; user-select: none; touch-action: none;
            display: none; flex-direction: column; align-items: center;
        }
        #qx999-icon-wrapper {
            display: flex; flex-direction: column; align-items: center; cursor: pointer;
        }
        #qx999-icon {
            width: 65px; height: 65px; border-radius: 50%;
            background: rgba(0, 0, 0, 0.45);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.75);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; transition: box-shadow 0.3s ease;
        }
        #qx999-icon.glowing {
            box-shadow: 0 0 25px #00ff66, inset 0 0 10px #00ff66 !important;
        }
        #qx999-icon img {
            width: 100%; height: 100%; border-radius: 50%;
            object-fit: cover; pointer-events: none;
        }
        #qx999-icon-wrapper span {
            color: #ffffff; font-size: 13px; font-weight: bold;
            margin-top: 5px; letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9); pointer-events: none;
        }
        .qx999-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(9, 18, 12, 0.95); border: 1.5px solid #00ff66;
            border-radius: 16px; width: 310px; padding: 22px; color: #fff;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.9); z-index: 1000000;
            font-family: Arial, sans-serif; backdrop-filter: blur(8px);
        }
        .qx999-btn {
            width: 100%; padding: 12px; background: #00ff66; color: #000;
            border: none; border-radius: 10px; font-weight: bold;
            font-size: 15px; cursor: pointer; margin-top: 10px;
        }
        .qx999-input, .qx999-select {
            width: 100%; padding: 10px; background: #12291d; color: #fff;
            border: 1px solid #1e4530; border-radius: 8px; box-sizing: border-box;
            margin-bottom: 15px; outline: none; font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // 1. Login Modal
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login-modal';
    loginBox.className = 'qx999-modal';
    loginBox.innerHTML = `
        <h3 style="margin:0 0 8px 0; color:#00ff66; font-size:22px; text-align:center; font-weight:bold;">QX999 Login</h3>
        <p style="font-size:13px; color:#ccc; margin-bottom:18px; text-align:center;">Enter password to start</p>
        <input type="password" id="qx_pass" value="${licenseKey}" readonly class="qx999-input" style="text-align:center; font-size:16px;">
        <button id="qx_login_btn" class="qx999-btn">Enter</button>
    `;
    document.body.appendChild(loginBox);

    // 2. Settings Modal (Configured for 5 Sec Trades)
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings-modal';
    settingsBox.className = 'qx999-modal';
    settingsBox.style.display = 'none';
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:18px; text-align:center;">5-Second Bot Settings</h3>
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Trade Expiry/Scan Time (Sec):</label>
        <input type="number" id="qx_delay" value="5" readonly class="qx999-input">
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Mode:</label>
        <select id="qx_mode" class="qx999-select">
            <option value="AI">Ultra-Fast Momentum Analysis</option>
        </select>
        <button id="qx_save_btn" class="qx999-btn">Save & Start</button>
    `;
    document.body.appendChild(settingsBox);

    // 3. Bot Main Icon Container
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-bot-container';
    botContainer.innerHTML = `
        <div id="qx999-icon-wrapper">
            <div id="qx999-icon">
                <img src="${logoUrl}" alt="QX999">
            </div>
            <span>QX999</span>
        </div>
    `;
    document.body.appendChild(botContainer);

    let logoIcon = document.getElementById('qx999-icon');

    // Draggable Touch & Mouse Logic
    let isDragging = false, startX, startY, initialX, initialY;
    function dragStart(e) {
        isDragging = false;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        initialX = botContainer.offsetLeft; initialY = botContainer.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
    function dragMove(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX; let dy = clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.right = 'auto';
    }
    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }
    botContainer.addEventListener('mousedown', dragStart);
    botContainer.addEventListener('touchstart', dragStart);

    // 4. Smooth Scan Canvas
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

    // Fast 50ms Real-Time Chart Scanner
    function runFastChartAnalysis() {
        greenCandleScore = 0;
        redCandleScore = 0;

        fastScanner = setInterval(() => {
            let chartElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            chartElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenCandleScore++;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redCandleScore++;
                }
            });
        }, 50);
    }

    function drawSmokeScanLine() {
        let currentTime = Date.now();
        let elapsedSec = (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
        
        let trailHeight = 90;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.12)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.4)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 18;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 4.5;
        if (scanY > scanCanvas.height) {
            scanY = 0;
        }

        scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
    }

    function finishScan() {
        if (fastScanner) clearInterval(fastScanner);
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        
        let targetSignal = greenCandleScore >= redCandleScore ? "UP" : "DOWN";
        executeTrade(targetSignal);
        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    // Auto Execution Engine
    function executeTrade(direction) {
        let buttons = Array.from(document.querySelectorAll('button, div[role="button"], a'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = buttons.find(b => {
                let txt = (b.innerText || b.textContent || "").toLowerCase();
                let cls = (b.className || "").toString().toLowerCase();
                return txt.includes('up') || txt.includes('call') || cls.includes('call') || cls.includes('up');
            });
        } else {
            targetBtn = buttons.find(b => {
                let txt = (b.innerText || b.textContent || "").toLowerCase();
                let cls = (b.className || "").toString().toLowerCase();
                return txt.includes('down') || txt.includes('put') || cls.includes('put') || cls.includes('down');
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    // Handlers
    document.getElementById('qx_login_btn').onclick = function () {
        loginBox.remove();
        botContainer.style.display = 'flex';
    };

    document.getElementById('qx_save_btn').onclick = function () {
        settingsBox.style.display = 'none';
        isConfigured = true;
    };

    botContainer.addEventListener('click', function () {
        if (isDragging) return;

        if (!isConfigured) {
            settingsBox.style.display = 'block';
            return;
        }

        if (isScanning) return;

        isScanning = true;
        logoIcon.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        runFastChartAnalysis();
        drawSmokeScanLine();
    });
})();
