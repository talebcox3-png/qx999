(function () {
    // Clean up existing elements if re-injected
    ['qx999-bot-container', 'qx999-settings-modal', 'qx999-login-modal', 'qx999-scan-canvas'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    const licenseKey = "Alvi1234";
    const logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";

    let scanDelay = 5;
    let afterTradeScan = 5;
    let tradeDirection = "AI"; // AI / Up / Down
    let isConfigured = false;
    let isScanning = false;

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    // Inject Custom Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-bot-container {
            position: fixed; top: 150px; right: 20px; z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            user-select: none; touch-action: none; display: none;
            flex-direction: column; align-items: center;
        }
        #qx999-icon-wrapper {
            display: flex; flex-direction: column; align-items: center; cursor: pointer;
        }
        #qx999-icon {
            width: 65px; height: 65px; border-radius: 50%;
            background: rgba(10, 20, 15, 0.85);
            border: 2px solid #00ff66;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; transition: box-shadow 0.3s ease;
        }
        #qx999-icon.glowing {
            box-shadow: 0 0 25px #00ff66, 0 0 10px #00ff66, inset 0 0 12px #00ff66 !important;
            /* Logo scale kept 100% normal */
            transform: scale(1) !important;
        }
        #qx999-icon img {
            width: 100%; height: 100%; border-radius: 50%;
            object-fit: cover; pointer-events: none;
        }
        #qx999-icon-wrapper span {
            color: #ffffff; font-size: 13px; font-weight: bold;
            margin-top: 6px; letter-spacing: 1px;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.9); pointer-events: none;
        }
        .qx999-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(10, 24, 16, 0.96); border: 1.5px solid #00ff66;
            border-radius: 20px; width: 320px; padding: 22px; color: #fff;
            box-shadow: 0 0 35px rgba(0, 255, 102, 0.25), 0 0 15px rgba(0,0,0,0.9);
            z-index: 1000000; font-family: sans-serif; backdrop-filter: blur(10px);
        }
        .qx999-btn {
            width: 100%; padding: 13px; background: #00ff66; color: #05140b;
            border: none; border-radius: 12px; font-weight: bold;
            font-size: 16px; cursor: pointer; margin-top: 15px;
            box-shadow: 0 4px 15px rgba(0, 255, 102, 0.4);
            transition: background 0.2s ease;
        }
        .qx999-btn:active { background: #00cc52; }
        .qx999-input {
            width: 100%; padding: 12px; background: rgba(5, 15, 10, 0.8); color: #fff;
            border: 1px solid rgba(0, 255, 102, 0.3); border-radius: 10px; box-sizing: border-box;
            margin-top: 6px; margin-bottom: 14px; outline: none; font-size: 15px;
        }
        .qx999-dir-container {
            display: flex; gap: 8px; margin-bottom: 15px; margin-top: 6px;
        }
        .qx999-dir-btn {
            flex: 1; padding: 10px; background: rgba(5, 15, 10, 0.8);
            border: 1px solid rgba(0, 255, 102, 0.3); color: #fff;
            border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px;
            text-align: center;
        }
        .qx999-dir-btn.active {
            background: #00ff66; color: #000; border-color: #00ff66;
        }
    `;
    document.head.appendChild(style);

    // 1. QX999 Login Modal (Matching Screenshot 1000321771.jpg)
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login-modal';
    loginBox.className = 'qx999-modal';
    loginBox.innerHTML = `
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:24px; text-align:center; font-weight:bold;">QX999 Login</h3>
        <p style="font-size:13px; color:#aaa; margin-bottom:18px; text-align:center;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${licenseKey}" class="qx999-input" style="text-align:center; letter-spacing:3px;">
        <button id="qx_login_btn" class="qx999-btn">Enter</button>
    `;
    document.body.appendChild(loginBox);

    // 2. QX999 Settings Modal (Matching Screenshot 1000321772.jpg)
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings-modal';
    settingsBox.className = 'qx999-modal';
    settingsBox.style.display = 'none';
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 16px 0; color:#00ff66; font-size:20px; text-align:center; font-weight:bold;">QX999 Settings</h3>
        
        <label style="font-size:13px; color:#ccc;">Scan delay (seconds)</label>
        <input type="number" id="qx_scan_delay" value="${scanDelay}" min="1" class="qx999-input">
        
        <label style="font-size:13px; color:#ccc;">After trade scan (seconds)</label>
        <div style="font-size:11px; color:#888; margin-top:-3px; margin-bottom:4px;">0 = stop only when you tap the icon</div>
        <input type="number" id="qx_after_scan" value="${afterTradeScan}" min="0" class="qx999-input">
        
        <label style="font-size:13px; color:#ccc;">Trade direction</label>
        <div class="qx999-dir-container">
            <button class="qx999-dir-btn active" id="btn_dir_ai">AI Signal</button>
            <button class="qx999-dir-btn" id="btn_dir_up">Up</button>
            <button class="qx999-dir-btn" id="btn_dir_down">Down</button>
        </div>

        <button id="qx_save_btn" class="qx999-btn">Save</button>
        <div style="font-size:11px; color:#777; text-align:center; margin-top:12px;">3 taps on icon to open · Tap outside to close</div>
    `;
    document.body.appendChild(settingsBox);

    // Settings Direction Button Switching
    ['ai', 'up', 'down'].forEach(type => {
        document.getElementById(`btn_dir_${type}`).onclick = function () {
            document.querySelectorAll('.qx999-dir-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tradeDirection = type.toUpperCase();
        };
    });

    // 3. Floating Icon Container
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

    // Smooth Dragging Logic
    let isDragging = false, startX, startY, initialX, initialY, tapCount = 0, tapTimer = null;
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

    // 4. Fullscreen Smoke-Glow Overlay Canvas
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

    // Real-Time Market & Candle Scanner Algorithm
    function startChartAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += 1.5;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += 1.5;
                }
            });
        }, 60);
    }

    // Laser Line with Green Smoke Glow Animation
    function drawSmokeScanLine() {
        let currentTime = Date.now();
        let elapsedSec = (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDelay) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
        
        // Smoke Trail Gradient Effect
        let trailHeight = 110;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.4, 'rgba(0, 255, 102, 0.08)');
        grad.addColorStop(0.8, 'rgba(0, 255, 102, 0.25)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.5)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        // Bright Glowing Laser Line
        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 20;
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
        if (analysisTimer) clearInterval(analysisTimer);
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        
        let finalDirection = "UP";
        if (tradeDirection === "UP") {
            finalDirection = "UP";
        } else if (tradeDirection === "DOWN") {
            finalDirection = "DOWN";
        } else {
            finalDirection = greenForce >= redForce ? "UP" : "DOWN";
        }

        executeTrade(finalDirection);
        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    // Ultra-Accurate Button Clicking Engine (Excludes Info/Help Popups)
    function executeTrade(direction) {
        let elements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"]'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = elements.find(el => {
                let text = (el.innerText || el.textContent || "").toLowerCase().trim();
                let cls = (el.className || "").toString().toLowerCase();
                let aria = (el.getAttribute('aria-label') || "").toLowerCase();
                
                // Exclude help/info boxes
                if (aria.includes('help') || aria.includes('info') || cls.includes('help')) return false;

                return (text === 'up' || text === 'call' || cls.includes('call-btn') || cls.includes('button-call') || (cls.includes('up') && !cls.includes('group')));
            });
        } else {
            targetBtn = elements.find(el => {
                let text = (el.innerText || el.textContent || "").toLowerCase().trim();
                let cls = (el.className || "").toString().toLowerCase();
                let aria = (el.getAttribute('aria-label') || "").toLowerCase();

                // Exclude help/info boxes
                if (aria.includes('help') || aria.includes('info') || cls.includes('help')) return false;

                return (text === 'down' || text === 'put' || cls.includes('put-btn') || cls.includes('button-put') || (cls.includes('down') && !cls.includes('group')));
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    // Modal Interaction Handlers
    document.getElementById('qx_login_btn').onclick = function () {
        let enteredPass = document.getElementById('qx_pass').value;
        if (enteredPass === licenseKey) {
            loginBox.remove();
            botContainer.style.display = 'flex';
        } else {
            alert("Wrong Password!");
        }
    };

    document.getElementById('qx_save_btn').onclick = function () {
        scanDelay = parseInt(document.getElementById('qx_scan_delay').value) || 5;
        afterTradeScan = parseInt(document.getElementById('qx_after_scan').value) || 5;
        settingsBox.style.display = 'none';
        isConfigured = true;
    };

    // Bot Icon Tap & Triple-Tap Settings Trigger
    botContainer.addEventListener('click', function () {
        if (isDragging) return;

        tapCount++;
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => {
            if (tapCount >= 3 || !isConfigured) {
                settingsBox.style.display = 'block';
            } else if (tapCount === 1) {
                if (isScanning) return;

                isScanning = true;
                logoIcon.classList.add('glowing');
                scanCanvas.style.display = 'block';
                scanY = 0;
                scanStartTime = Date.now();
                startChartAnalysis();
                drawSmokeScanLine();
            }
            tapCount = 0;
        }, 300);
    });
})();
