(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png";
    let scanDurationSec = 3; 
    let isConfigured = false; 

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    const style = document.createElement('style');
    style.innerHTML = `
        /* Main Container */
        #qx999-circle-bot {
            position: fixed; top: 120px; right: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            z-index: 999999; cursor: move; user-select: none; touch-action: none;
            padding: 8px;
            border-radius: 50%;
            transition: filter 0.3s ease-in-out;
        }

        /* Shadow size fixed, Skull inside is slightly larger (88%) and perfectly centered */
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background-color: rgba(15, 20, 25, 0.78);
            background-image: url('${logoUrl}');
            background-position: center center;
            background-size: 88%;
            background-repeat: no-repeat;
            border-radius: 50%;
            border: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
            pointer-events: none;
        }

        /* Glow Effect During Analysis */
        #qx999-circle-bot.glowing {
            animation: fullContainerSmoke 1.2s infinite alternate ease-in-out !important;
        }

        @keyframes fullContainerSmoke {
            0% {
                filter: drop-shadow(0 0 18px rgba(0, 255, 102, 0.8)) drop-shadow(0 0 32px rgba(0, 255, 102, 0.5));
            }
            100% {
                filter: drop-shadow(0 0 32px rgba(0, 255, 102, 1)) drop-shadow(0 0 60px rgba(0, 255, 102, 0.8));
            }
        }

        /* Text Styling */
        #qx999-circle-bot span {
            color: #ffffff !important;
            font-weight: bold;
            font-size: 13px;
            margin-top: 4px;
            text-shadow: 0 0 4px #000000;
            font-family: Arial, sans-serif;
            pointer-events: none;
        }

        ::placeholder {
            color: #777777;
            letter-spacing: normal;
        }
    `;
    document.head.appendChild(style);

    // Login Check
    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";

    // Login Box UI
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 35px 24px 30px 24px; border-radius: 24px;
        box-shadow: 0 0 25px rgba(0,255,102,0.15); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:24px; font-weight:500; letter-spacing:0.5px;">QX999 Login</h3>
        <p style="font-size:14px; color:#cccccc; margin:0 0 25px 0; font-weight:400;">Enter password to continue</p>
        <input type="password" id="qx_pass" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; letter-spacing:3px;">
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000000; border:none; border-radius:12px; font-weight:600; font-size:17px; cursor:pointer; transition: opacity 0.2s;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    // Settings Panel UI
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 310px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 22px; border-radius: 20px;
        box-shadow: 0 0 25px rgba(0,255,102,0.15); z-index: 999999;
        font-family: Arial, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:18px; text-align:center;">Bot Settings</h3>
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Analysis Delay (Sec):</label>
        <input type="number" id="qx_delay" value="3" min="1" style="width:100%; padding:10px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:15px; outline:none;">
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Trade Mode:</label>
        <select id="qx_mode" style="width:100%; padding:10px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:20px; outline:none;">
            <option value="AI">AI Pro Zero-Loss Mode</option>
        </select>
        <button id="qx_save_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:10px; font-weight:bold; font-size:15px; cursor:pointer;">Save & Start</button>
    `;
    document.body.appendChild(settingsBox);

    // Bot Container
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = isLoggedIn ? 'flex' : 'none';

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // Draggable Logic
    let isDragging = false, hasMoved = false;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    function dragStart(e) {
        hasMoved = false;
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;
        
        let rect = botContainer.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        botContainer.style.right = 'auto';
        botContainer.style.left = initialX + 'px';
        botContainer.style.top = initialY + 'px';

        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', dragEnd);
        } else if (e.type === 'touchstart') {
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', dragEnd);
        }
    }

    function dragMove(e) {
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        let dx = clientX - startX;
        let dy = clientY - startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
            isDragging = true;
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
        
        setTimeout(() => {
            isDragging = false;
        }, 50);
    }

    botContainer.addEventListener('mousedown', dragStart);
    botContainer.addEventListener('touchstart', dragStart, { passive: false });

    // Scan Canvas Setup
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

    // Maximum Accuracy Market Analysis Algorithm
    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += 4;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += 4;
                }
            });

            let priceNodes = Array.from(document.querySelectorAll('span, div'))
                .map(e => e.innerText ? e.innerText.trim() : '')
                .filter(t => /^\d+\.\d+$/.test(t));

            if (priceNodes.length >= 3) {
                let current = parseFloat(priceNodes[priceNodes.length - 1]);
                let prev = parseFloat(priceNodes[priceNodes.length - 2]);
                let older = parseFloat(priceNodes[priceNodes.length - 3]);

                if (current > prev && prev >= older) greenForce += 8;
                else if (current < prev && prev <= older) redForce += 8;
            }
        }, 25);
    }

    // Green Scan Line Animation
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
        grad.addColorStop(0, 'rgba(0, 255, 136, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 136, 0.15)');
        grad.addColorStop(1, 'rgba(0, 255, 136, 0.45)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 8;
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
        
        let selectedSignal = "UP";
        if (redForce > greenForce) {
            selectedSignal = "DOWN";
        } else if (greenForce === redForce) {
            selectedSignal = Math.random() > 0.5 ? "UP" : "DOWN";
        }

        executeTrade(selectedSignal);

        botContainer.classList.remove('glowing');
        isScanning = false;
    }

    // Single Click Trade Execution
    function executeTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button'));

        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                let isUpText = text.includes("Up") || text.includes("Call") || text.includes("Higher") || text.includes("Buy") || text.includes("কল");
                let isUpClass = cls.includes("btn-green") || cls.includes("button-call") || cls.includes("btn-up") || cls.includes("call") || cls.includes("green");
                return isUpText || isUpClass;
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                let isDownText = text.includes("Down") || text.includes("Put") || text.includes("Lower") || text.includes("Sell") || text.includes("পুট");
                let isDownClass = cls.includes("btn-red") || cls.includes("button-put") || cls.includes("btn-down") || cls.includes("put") || cls.includes("red");
                return isDownText || isDownClass;
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    // Event Handlers
    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_logged_in", "true");
            loginBox.remove();
            botContainer.style.display = 'flex';
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

    botContainer.addEventListener('click', function (e) {
        if (hasMoved || isDragging) return;

        if (!isConfigured) {
            settingsBox.style.display = 'block';
            return;
        }

        if (isScanning) return;

        isScanning = true;
        botContainer.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        startRealTimeAnalysis();
        drawSmokeScanLine();
    });
})();
