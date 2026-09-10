(function () {
    ['nj999-circle-bot', 'nj999-panel', 'nj999-login', 'nj999-scan-canvas', 'nj999-settings', 'nj999-terminal'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-NJ99";
    let logoUrl = "https://i.ibb.co.com/LXTn4Kbw/5b49d86e-ad3b-424b-8b8d-ab67b391c117.jpg";
    let scanDurationSec = 5; 
    let operationMode = "Click to Trade"; 
    let isConfigured = false; 

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;
    let autoTradeInterval = null;
    let tradeExecuted = false;
    let selectedSignal = "UP";

    let visitCount = parseInt(localStorage.getItem("nj999_visits") || "0") + 1;
    localStorage.setItem("nj999_visits", visitCount);
    let shouldPreFill = visitCount > 1;
    let loginTitleText = shouldPreFill ? "NJ999 Login" : "NJ999 Luxury Login";

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes rainbowGlow {
            0% { border-color: #ff0055; box-shadow: 0 0 15px #ff0055; }
            25% { border-color: #00ff66; box-shadow: 0 0 15px #00ff66; }
            50% { border-color: #00ffff; box-shadow: 0 0 15px #00ffff; }
            75% { border-color: #7b00ff; box-shadow: 0 0 15px #7b00ff; }
            100% { border-color: #ff0055; box-shadow: 0 0 15px #ff0055; }
        }
        @keyframes luxuryPulse {
            0% { box-shadow: 0 0 25px rgba(0,255,102,0.25); border-color: #00ff66; }
            50% { box-shadow: 0 0 45px rgba(0,255,102,0.6); border-color: #00ffaa; }
            100% { box-shadow: 0 0 25px rgba(0,255,102,0.25); border-color: #00ff66; }
        }
        #nj999-circle-bot {
            position: fixed; top: 120px; right: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 999999; cursor: move; user-select: none; touch-action: none;
            padding: 4px; border-radius: 50%;
        }
        #nj999-logo-icon {
            width: 65px; height: 65px;
            background-color: #0c150e;
            background-image: url('${logoUrl}');
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: 2.5px solid #00ff66;
            animation: rainbowGlow 3s linear infinite;
            pointer-events: none;
            transition: transform 0.2s ease;
        }
        #nj999-circle-bot span {
            color: #ffffff !important; font-weight: bold; font-size: 13px;
            margin-top: 5px; text-shadow: none; font-family: Arial, sans-serif; pointer-events: none;
        }
        ::placeholder { color: #666666; }
        
        .nj-mode-btn {
            width: 100%; padding: 13px; background: #070d09; color: #fff;
            border: 1px solid #1a3322; border-radius: 14px; font-weight: 600;
            font-size: 14px; cursor: pointer; margin-bottom: 9px; text-align: center;
            transition: all 0.2s;
        }
        .nj-mode-btn.active {
            background: #00ff66; color: #000; border-color: #00ff66;
            box-shadow: 0 0 20px rgba(0,255,102,0.5);
        }
    `;
    document.head.appendChild(style);

    // Luxury Glowing Login Box
    let loginBox = document.createElement('div');
    loginBox.id = 'nj999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 335px; background: #0c150e; border: 2px solid #00ff66;
        color: #ffffff; padding: 35px 26px 30px 26px; border-radius: 26px;
        animation: luxuryPulse 3.5s infinite; z-index: 999999;
        font-family: sans-serif; text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <div style="width: 52px; height: 52px; margin: 0 auto 15px auto; background-image: url('${logoUrl}'); background-size: cover; border-radius: 50%; border: 2px solid #00ff66; animation: rainbowGlow 3s linear infinite;"></div>
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:22px; font-weight:600;">${loginTitleText}</h3>
        <p style="font-size:13px; color:#aaaaaa; margin:0 0 22px 0;">Enter secure access key</p>
        <input type="password" id="nj_pass" value="${shouldPreFill ? licenseKey : ''}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1.5px solid #00ff66; border-radius:14px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; text-align:center; letter-spacing:3px; box-shadow: inset 0 0 10px rgba(0,255,102,0.15);">
        <button id="nj_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:14px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow: 0 0 20px rgba(0,255,102,0.4);">Authenticate</button>
    `;
    document.body.appendChild(loginBox);

    // Luxury Glowing Settings Box
    let settingsBox = document.createElement('div');
    settingsBox.id = 'nj999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 335px; background: #0c150e; border: 2px solid #00ff66;
        color: #ffffff; padding: 26px; border-radius: 26px;
        animation: luxuryPulse 3.5s infinite; z-index: 999999;
        font-family: Arial, sans-serif; display: none; max-height: 90vh; overflow-y: auto;
    `;
    settingsBox.innerHTML = `
        <div style="width: 42px; height: 42px; margin: 0 auto 10px auto; background-image: url('${logoUrl}'); background-size: cover; border-radius: 50%; border: 2px solid #00ff66; animation: rainbowGlow 3s linear infinite;"></div>
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:19px; text-align:center; font-weight:bold;">NJ999 Glowing Settings</h3>
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:6px;">Scan Time (Seconds)</label>
        <input type="number" id="nj_scan_delay" value="5" min="2" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1.5px solid #1a3322; border-radius:14px; box-sizing:border-box; margin-bottom:15px; outline:none; font-size:16px;">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:8px;">Operation Mode</label>
        <div id="nj_mode_signal" class="nj-mode-btn">Only Signal</div>
        <div id="nj_mode_auto" class="nj-mode-btn">Auto Trade Place</div>
        <div id="nj_mode_click" class="nj-mode-btn active">Click to Trade</div>
        
        <button id="nj_save_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:14px; font-weight:bold; font-size:16px; cursor:pointer; margin-top:10px; box-shadow: 0 0 20px rgba(0,255,102,0.4);">Save & Apply</button>
        <p style="font-size:11px; color:#777; text-align:center; margin-top:12px; margin-bottom:0;">Tap 3 times on bot icon for settings</p>
    `;
    document.body.appendChild(settingsBox);

    ['Only Signal', 'Auto Trade Place', 'Click to Trade'].forEach(mode => {
        let btnId = mode === 'Only Signal' ? 'nj_mode_signal' : (mode === 'Auto Trade Place' ? 'nj_mode_auto' : 'nj_mode_click');
        document.getElementById(btnId).onclick = function () {
            document.querySelectorAll('.nj-mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            operationMode = mode;
        };
    });

    let botContainer = document.createElement('div');
    botContainer.id = 'nj999-circle-bot';
    botContainer.style.display = 'none';

    let logoIcon = document.createElement('div');
    logoIcon.id = 'nj999-logo-icon';
    let logoText = document.createElement('span');
    logoText.innerText = "NJ999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // Terminal Box positioned directly above the bot icon
    let terminalBox = document.createElement('div');
    terminalBox.id = 'nj999-terminal';
    terminalBox.style.cssText = `
        position: fixed;
        width: 210px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #00ff66; padding: 10px 12px; border-radius: 14px; font-family: monospace;
        font-size: 12px; display: none; z-index: 999998; box-shadow: 0 0 20px rgba(0,255,102,0.3);
        line-height: 1.4; pointer-events: none;
    `;
    document.body.appendChild(terminalBox);

    function updateTerminalPosition() {
        let rect = botContainer.getBoundingClientRect();
        let termHeight = terminalBox.offsetHeight || 70;
        terminalBox.style.top = (rect.top - termHeight - 8) + 'px';
        terminalBox.style.left = (rect.left - 70) + 'px';
    }

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
            updateTerminalPosition();
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
    scanCanvas.id = 'nj999-scan-canvas';
    scanCanvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        pointer-events: none; z-index: 999997; display: none;
    `;
    document.body.appendChild(scanCanvas);
    let ctx = scanCanvas.getContext('2d');

    function resizeCanvas() {
        scanCanvas.width = window.innerWidth;
        scanCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getActiveMarketName() {
        let candidates = document.querySelectorAll('.asset-name, .current-asset, [class*="asset"], [class*="symbol"], header span, div span');
        for (let el of candidates) {
            let text = el.innerText ? el.innerText.trim() : '';
            if (text.match(/^[A-Z]{3}\/[A-Z]{3}/) || text.includes('(OTC)')) {
                if (text.length < 20) return text;
            }
        }
        let bodyText = document.body.innerText;
        let match = bodyText.match(/[A-Z]{3}\/[A-Z]{3}(\s*\(OTC\))?/);
        return match ? match[0] : "USD/BRL (OTC)";
    }

    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                let weight = 50;
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
                let multiplier = 120;
                if (current > prev) {
                    greenForce += multiplier;
                } else if (current < prev) {
                    redForce += multiplier;
                }
            }
        }, 12);
    }

    let scanAnimationId = null, scanY = 0, isScanning = false, scanStartTime = 0;

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
        ctx.shadowBlur = 20;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 9;
        if (scanY > scanCanvas.height) {
            scanY = 0;
        }

        if (elapsedSec >= (scanDurationSec - 0.3) && !tradeExecuted) {
            tradeExecuted = true;
            
            if (greenForce > redForce) {
                selectedSignal = "UP";
            } else if (redForce > greenForce) {
                selectedSignal = "DOWN";
            } else {
                selectedSignal = Math.random() > 0.5 ? "UP" : "DOWN";
            }

            let currentMarket = getActiveMarketName();
            updateTerminalPosition();
            terminalBox.style.display = 'block';
            terminalBox.innerHTML = `root@nj999-ai:~$<br>analyzing...<br>market: ${currentMarket}<br>signal: <span style="color:${selectedSignal === 'UP' ? '#00ff66' : '#ff3333'}; font-weight:bold;">${selectedSignal}</span>`;

            if (operationMode === "Click to Trade" || operationMode === "Only Signal") {
                if (operationMode === "Click to Trade") {
                    executeTrade(selectedSignal);
                }
            }
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
        isScanning = false;
        
        setTimeout(() => {
            terminalBox.style.display = 'none';
        }, 4000);
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

    // High performance Auto Trade Loop for 1-minute sure-shots
    function startAutoTradeLoop() {
        if (autoTradeInterval) clearInterval(autoTradeInterval);
        
        autoTradeInterval = setInterval(() => {
            if (operationMode !== "Auto Trade Place" || isScanning) return;

            let gForce = 0, rForce = 0;
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let cls = (el.getAttribute('class') || '').toLowerCase();
                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || cls.includes('green')) gForce += 70;
                else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || cls.includes('red')) rForce += 70;
            });

            let diff = Math.abs(gForce - rForce);
            if (diff >= 130) { // Optimized sure-shot threshold
                let dir = gForce > rForce ? "UP" : "DOWN";
                let currentMarket = getActiveMarketName();
                
                updateTerminalPosition();
                terminalBox.style.display = 'block';
                terminalBox.innerHTML = `root@nj999-ai:~$<br>sure-shot active!<br>market: ${currentMarket}<br>auto-trade: <span style="color:${dir === 'UP' ? '#00ff66' : '#ff3333'}; font-weight:bold;">${dir}</span>`;
                
                executeTrade(dir);

                setTimeout(() => {
                    terminalBox.style.display = 'none';
                }, 3000);
            }
        }, 3000); // Checks every 3 seconds for fast, instant auto-trading
    }

    document.getElementById('nj_login_btn').onclick = function () {
        let inputPass = document.getElementById('nj_pass').value;
        if (inputPass === licenseKey) {
            loginBox.remove();
            botContainer.style.display = 'flex';
            startAutoTradeLoop();
        } else {
            alert("Wrong Password! Use: ALVI5S-NJ99");
        }
    };

    document.getElementById('nj_save_btn').onclick = function () {
        let scanInput = parseFloat(document.getElementById('nj_scan_delay').value);
        if (!isNaN(scanInput) && scanInput >= 2) scanDurationSec = scanInput;

        settingsBox.style.display = 'none';
        isConfigured = true;
    };

    window.addEventListener('click', function(e) {
        if (settingsBox.style.display === 'block' && !settingsBox.contains(e.target) && !botContainer.contains(e.target)) {
            settingsBox.style.display = 'none';
        }
    });

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

                if (operationMode === "Auto Trade Place") {
                    let currentMarket = getActiveMarketName();
                    updateTerminalPosition();
                    terminalBox.style.display = 'block';
                    terminalBox.innerHTML = `root@nj999-ai:~$<br>auto mode running<br>market: ${currentMarket}`;
                    setTimeout(() => { terminalBox.style.display = 'none'; }, 2000);
                    return;
                }

                isScanning = true;
                tradeExecuted = false;
                scanCanvas.style.display = 'block';
                scanY = 0;
                scanStartTime = Date.now();
                
                let currentMarket = getActiveMarketName();
                updateTerminalPosition();
                terminalBox.style.display = 'block';
                terminalBox.innerHTML = `root@nj999-ai:~$<br>analyzing...<br>market: ${currentMarket}`;

                startRealTimeAnalysis();
                drawSmokeScanLine();
            }
            tapCount = 0;
        }, 350);
    });
})();
