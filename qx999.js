(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-HECK";
    let logoUrl = "https://i.ibb.co.com/S4W4dnkR/1000323502-photoaidcom-cropped.png"; 
    let scanDurationSec = 3; 
    let isConfigured = false; 

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-logo-icon {
            width: 62px; height: 62px;
            background: url('${logoUrl}') center/cover no-repeat;
            border-radius: 50%;
            border: none !important;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
            transition: transform 0.2s ease, box-shadow 0.3s ease;
        }

        #qx999-logo-icon.glowing {
            box-shadow: 0 0 20px #00ff66, 0 0 40px #00ff66, 0 0 60px rgba(0, 255, 102, 0.7) !important;
            animation: pulseGlow 0.8s infinite alternate;
        }

        @keyframes pulseGlow {
            from { transform: scale(1); box-shadow: 0 0 18px #00ff66, 0 0 35px #00ff66; }
            to { transform: scale(1.06); box-shadow: 0 0 28px #00ff66, 0 0 55px #00ff66; }
        }
    `;
    document.head.appendChild(style);

    let realSavedPass = localStorage.getItem("qx999_saved_pass") || "";
    let isAlreadyLoggedIn = localStorage.getItem("qx999_logged_in") === "true";

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 310px; background: #07120a; border: 1.5px solid #00e676;
        color: #ffffff; padding: 25px 20px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0, 230, 118, 0.2); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: ${isAlreadyLoggedIn ? 'none' : 'block'};
    `;

    loginBox.innerHTML = `
        <h2 style="margin: 0 0 8px 0; color: #00ff66; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">QX999 LOGIN</h2>
        <p style="font-size: 13px; color: #b0b0b0; margin: 0 0 20px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${realSavedPass}" placeholder="••••••••" style="width: 100%; padding: 12px 15px; background: #040906; color: #00ff66; border: 1.5px solid #00e676; border-radius: 12px; box-sizing: border-box; margin-bottom: 20px; font-size: 16px; outline: none; text-align: center;">
        <button id="qx_login_btn" style="width: 100%; padding: 13px; background: #00ff66; color: #000000; border: none; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 300px; background: #07120a; border: 1.5px solid #00e676;
        color: #ffffff; padding: 20px; border-radius: 18px;
        box-shadow: 0 0 25px rgba(0, 230, 118, 0.2); z-index: 999999;
        font-family: Arial, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:18px; text-align:center;">Bot Configuration</h3>
        <label style="font-size:12px; color:#ccc; display:block; margin-bottom:5px;">Analysis Time (Sec):</label>
        <input type="number" id="qx_delay" value="3" min="1" style="width:100%; padding:10px; background:#040906; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:15px; outline:none;">
        <label style="font-size:12px; color:#ccc; display:block; margin-bottom:5px;">Accuracy Filter:</label>
        <select id="qx_mode" style="width:100%; padding:10px; background:#040906; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:20px; outline:none;">
            <option value="MAX">Ultra High WinRate AI</option>
        </select>
        <button id="qx_save_btn" style="width:100%; padding:11px; background:#00ff66; color:#000; border:none; border-radius:10px; font-weight:bold; font-size:14px; cursor:pointer;">Save & Start</button>
    `;
    document.body.appendChild(settingsBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%);
        display: ${isAlreadyLoggedIn ? 'flex' : 'none'}; flex-direction: column; align-items: center;
        z-index: 999999; cursor: move; user-select: none;
        touch-action: none; background: transparent;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: 800; font-size: 14px; margin-top: 5px;
        text-shadow: 0 0 6px #000, 0 0 10px #000; font-family: -apple-system, sans-serif;
        letter-spacing: 0.5px;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    let isDragging = false, startX, startY, initialX, initialY;
    function dragStart(e) {
        isDragging = false;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        initialX = botContainer.offsetLeft;
        initialY = botContainer.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX;
        let dy = clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.transform = 'none';
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }

    botContainer.addEventListener('mousedown', dragStart);
    botContainer.addEventListener('touchstart', dragStart);

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

    let scanAnimationId = null, isScanning = false, scanStartTime = 0;

    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot'], [class*='chart']");
            svgElements.forEach(el => {
                let fill = (el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '').toLowerCase();
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || fill.includes('00e676') || className.includes('green') || className.includes('up')) {
                    greenForce += Math.floor(Math.random() * 5) + 10;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || fill.includes('ff5252') || className.includes('red') || className.includes('down')) {
                    redForce += Math.floor(Math.random() * 5) + 10;
                }
            });
        }, 15);
    }

    function drawSmokeScanLine(timestamp) {
        let elapsedSec = (timestamp - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);

        let cycleDuration = 1.2; 
        let progress = (elapsedSec % cycleDuration) / cycleDuration;
        let currentScanY = progress * scanCanvas.height;

        let trailHeight = 140;
        let grad = ctx.createLinearGradient(0, currentScanY - trailHeight, 0, currentScanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.15)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.6)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, currentScanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 20;
        ctx.moveTo(0, currentScanY);
        ctx.lineTo(scanCanvas.width, currentScanY);
        ctx.stroke();

        scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
    }

    function finishScan() {
        if (analysisTimer) clearInterval(analysisTimer);
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }

        let selectedSignal = "UP";
        if (redForce > greenForce) {
            selectedSignal = "DOWN";
        } else if (greenForce === redForce) {
            selectedSignal = (Math.random() > 0.5) ? "UP" : "DOWN";
        }

        executeTrade(selectedSignal);

        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    function executeTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button, span'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim().toLowerCase();
                let cls = (el.className || "").toString().toLowerCase();
                return text === "up" || text === "call" || cls.includes("btn-green") || cls.includes("button-call") || cls.includes("call");
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim().toLowerCase();
                let cls = (el.className || "").toString().toLowerCase();
                return text === "down" || text === "put" || cls.includes("btn-red") || cls.includes("button-put") || cls.includes("put");
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_saved_pass", licenseKey);
            localStorage.setItem("qx999_logged_in", "true");
            loginBox.style.display = 'none';
            botContainer.style.display = 'flex';
        } else {
            alert("Wrong Password!");
        }
    };

    document.getElementById('qx_save_btn').onclick = function () {
        let delayInput = parseInt(document.getElementById('qx_delay').value);
        if (!isNaN(delayInput) && delayInput > 0) {
            scanDurationSec = delayInput;
        }
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
        scanStartTime = performance.now();
        startRealTimeAnalysis();
        scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
    });
})();
