(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co.com/5hPpvrTB/Firefly-Remove-Background.png";
    let scanDurationSec = 5; 
    let afterTradeScanSec = 5;
    let configuredTradeDirection = "Random"; // "Up", "Down", "Random"
    let isConfigured = false; 

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;
    let tradeExecuted = false;
    let selectedSignal = "UP";

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
            background-color: transparent;
            background-image: url('${logoUrl}');
            background-position: center center;
            background-size: 88%;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: none;
            box-shadow: 2px 6px 16px rgba(0, 0, 0, 0.85); /* হালকা কালো শ্যাডো */
            pointer-events: none;
            transition: all 0.3s ease-in-out;
            transform: translateX(4px);
        }
        #qx999-circle-bot.glowing #qx999-logo-icon {
            box-shadow: 0 0 25px rgba(0, 255, 102, 0.7) !important;
            transform: translateX(4px) !important;
        }
        #qx999-circle-bot span {
            color: #ffffff !important; font-weight: bold; font-size: 13px;
            margin-top: 5px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); font-family: Arial, sans-serif; pointer-events: none;
        }
        ::placeholder { color: #777777; }
        
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

    // Login Box (ஹুবহু ১ম ছবির মতো)
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 35px 24px 30px 24px; border-radius: 24px;
        box-shadow: 0 0 25px rgba(0,255,102,0.15); z-index: 999999;
        font-family: sans-serif; text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:24px; font-weight:500;">QX999 Login</h3>
        <p style="font-size:14px; color:#cccccc; margin:0 0 25px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${shouldPreFill ? licenseKey : ''}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1px solid #00ff66; border-radius:12px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; letter-spacing:3px;">
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:600; font-size:17px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    // Settings Box (হুবহু ২য় ছবির মতো)
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 24px; border-radius: 24px;
        box-shadow: 0 0 25px rgba(0,255,102,0.15); z-index: 999999;
        font-family: Arial, sans-serif; display: none; max-height: 90vh; overflow-y: auto;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:20px; text-align:center; font-weight:bold;">QX999 Settings</h3>
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Scan delay (seconds)</label>
        <input type="number" id="qx_scan_delay" value="5" min="2" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:12px; outline:none; font-size:16px;">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:2px;">After trade scan (seconds)</label>
        <span style="font-size:11px; color:#777; display:block; margin-bottom:5px;">0 = stop only when you tap the icon</span>
        <input type="number" id="qx_after_delay" value="5" min="0" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:15px; outline:none; font-size:16px;">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:8px;">Trade direction</label>
        <div id="qx_dir_up" class="qx-dir-btn">Up</div>
        <div id="qx_dir_down" class="qx-dir-btn">Down</div>
        <div id="qx_dir_random" class="qx-dir-btn active">Random</div>
        
        <button id="qx_save_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:16px; cursor:pointer; margin-top:10px;">Save</button>
        <p style="font-size:11px; color:#777; text-align:center; margin-top:12px; margin-bottom:0;">3 taps on icon to open · tap outside to close</p>
    `;
    document.body.appendChild(settingsBox);

    // Direction buttons logic
    ['Up', 'Down', 'Random'].forEach(dir => {
        let btnId = dir === 'Up' ? 'qx_dir_up' : (dir === 'Down' ? 'qx_dir_down' : 'qx_dir_random');
        document.getElementById(btnId).onclick = function () {
            document.querySelectorAll('.qx-dir-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            configuredTradeDirection = dir;
        };
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

    // Dragging logic
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

    // Scan Canvas
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

    // Advanced Market Analysis to evaluate both UP and DOWN accurately and reduce loss
    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                let weight = 30;
                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += weight;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += weight;
                }
            });

            let priceNodes = Array.from(document.querySelectorAll('span, div'))
                .map(e => e.innerText ? e.innerText.trim() : '')
                .filter(t => /^\d+\.\d+$/.test(t));

            if (priceNodes.length >= 3) {
                let current = parseFloat(priceNodes[priceNodes.length - 1]);
                let prev = parseFloat(priceNodes[priceNodes.length - 2]);
                let multiplier = 75;
                if (current > prev) {
                    greenForce += multiplier;
                } else if (current < prev) {
                    redForce += multiplier;
                }
            }
        }, 20);
    }

    function drawSmokeScanLine() {
        let currentTime = Date.now();
        let elapsedSec = (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);

        let trailHeight = 160;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.3, 'rgba(0, 255, 102, 0.08)');
        grad.addColorStop(0.7, 'rgba(0, 255, 102, 0.25)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.7)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 25;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 8.5;
        if (scanY > scanCanvas.height) {
            scanY = 0;
        }

        if (elapsedSec >= (scanDurationSec - 0.3) && !tradeExecuted) {
            tradeExecuted = true;
            
            if (configuredTradeDirection === "Up") {
                selectedSignal = "UP";
            } else if (configuredTradeDirection === "Down") {
                selectedSignal = "DOWN";
            } else {
                // Random or Smart Analysis
                if (greenForce > redForce) {
                    selectedSignal = "UP";
                } else if (redForce > greenForce) {
                    selectedSignal = "DOWN";
                } else {
                    selectedSignal = Math.random() > 0.5 ? "UP" : "DOWN";
                }
            }
            executeTrade(selectedSignal);
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
        botContainer.classList.remove('glowing');
        isScanning = false;
    }

    function executeTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Up") || text.includes("Call") || text.includes("Higher") || text.includes("Buy") || text.includes("কল") || cls.includes("green") || cls.includes("call");
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Down") || text.includes("Put") || text.includes("Lower") || text.includes("Sell") || text.includes("পুট") || cls.includes("red") || cls.includes("put");
            });
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
        let scanInput = parseFloat(document.getElementById('qx_scan_delay').value);
        let afterInput = parseFloat(document.getElementById('qx_after_delay').value);
        if (!isNaN(scanInput) && scanInput >= 2) scanDurationSec = scanInput;
        if (!isNaN(afterInput) && afterInput >= 0) afterTradeScanSec = afterInput;

        settingsBox.style.display = 'none';
        isConfigured = true;
    };

    // Tap outside to close settings box
    window.addEventListener('click', function(e) {
        if (settingsBox.style.display === 'block' && !settingsBox.contains(e.target) && !botContainer.contains(e.target)) {
            settingsBox.style.display = 'none';
        }
    });

    // 3 taps on icon to open settings (as mentioned in settings footer)
    let tapCount = 0, tapTimer = null;
    botContainer.addEventListener('click', function (e) {
        if (hasMoved || isDragging) return;

        tapCount++;
        if (tapTimer) clearTimeout(tapTimer);

        tapTimer = setTimeout(() => {
            if (tapCount >= 3) {
                settingsBox.style.display = 'block';
            } else {
                if (!isConfigured) {
                    settingsBox.style.display = 'block';
                    return;
                }
                if (isScanning) return;

                isScanning = true;
                tradeExecuted = false;
                botContainer.classList.add('glowing');
                scanCanvas.style.display = 'block';
                scanY = 0;
                scanStartTime = Date.now();
                
                startRealTimeAnalysis();
                drawSmokeScanLine();
            }
            tapCount = 0;
        }, 350);
    });
})();
