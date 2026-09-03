(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    let scanDurationSec = 3; 
    let isConfigured = false; 

    let lastCalculatedDirection = null;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-logo-icon {
            width: 60px; height: 60px;
            background: url('${logoUrl}') center/cover no-repeat;
            border-radius: 50%;
            border: 2px solid rgba(0, 255, 102, 0.6);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            transition: box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out;
        }
        #qx999-logo-icon.glowing {
            border-color: #00ff66 !important;
            box-shadow: 0 0 20px #00ff66, 0 0 40px #00ff66, 0 0 60px rgba(0, 255, 102, 0.8) !important;
            transform: scale(1.0) !important;
        }
        ::placeholder {
            color: #777777;
            letter-spacing: normal;
        }
    `;
    document.head.appendChild(style);

    // 1. Storage Login Logic
    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: rgba(12, 21, 14, 0.95); border: 1.5px solid #00ff66;
        color: #ffffff; padding: 35px 24px 30px 24px; border-radius: 24px;
        box-shadow: 0 0 25px rgba(0,255,102,0.2); z-index: 999999;
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

    // 2. Settings Panel UI
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 310px; background: rgba(12, 21, 14, 0.95); border: 1.5px solid #00ff66;
        color: #ffffff; padding: 22px; border-radius: 20px;
        box-shadow: 0 0 25px rgba(0,255,102,0.2); z-index: 999999;
        font-family: Arial, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:18px; text-align:center;">Bot Settings</h3>
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Analysis Delay (Sec):</label>
        <input type="number" id="qx_delay" value="3" min="1" style="width:100%; padding:10px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:15px; outline:none;">
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Trade Mode:</label>
        <select id="qx_mode" style="width:100%; padding:10px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; box-sizing:border-box; margin-bottom:20px; outline:none;">
            <option value="AI">Strict Trend Analysis Engine</option>
        </select>
        <button id="qx_save_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:10px; font-weight:bold; font-size:15px; cursor:pointer;">Save & Start</button>
    `;
    document.body.appendChild(settingsBox);

    // 3. Bot Container
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 120px; right: 20px;
        display: ${isLoggedIn ? 'flex' : 'none'}; flex-direction: column; align-items: center;
        z-index: 999999; cursor: move; user-select: none;
        touch-action: none; background: transparent;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 12px; margin-top: 4px;
        text-shadow: 0 0 6px #000, 0 0 10px #000, 0 0 4px #00ff66; font-family: Arial, sans-serif;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // Draggable Logic
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

    // 4. Scan Canvas
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

    // DIRECT CHART SCANNER
    function analyzeMarketDirection() {
        let greenCount = 0;
        let redCount = 0;

        let allSvgNodes = document.querySelectorAll("svg path, svg rect");

        allSvgNodes.forEach(node => {
            let fill = (node.getAttribute('fill') || node.style.fill || '').toLowerCase();
            let stroke = (node.getAttribute('stroke') || node.style.stroke || '').toLowerCase();

            if (fill.includes('26a69a') || fill.includes('00e676') || stroke.includes('26a69a') || stroke.includes('00e676')) {
                greenCount++;
            } else if (fill.includes('ef5350') || fill.includes('ff5252') || stroke.includes('ef5350') || stroke.includes('ff5252')) {
                redCount++;
            }
        });

        if (greenCount > redCount) {
            return "UP";
        } else if (redCount > greenCount) {
            return "DOWN";
        } else {
            // Alternating balance logic if equal
            return lastCalculatedDirection === "UP" ? "DOWN" : "UP";
        }
    }

    // Laser Scanning Overlay Animation
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

        let trailHeight = 120;
        let grad = ctx.createLinearGradient(0, currentScanY - trailHeight, 0, currentScanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.12)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.5)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, currentScanY - trailHeight), scanCanvas.width, trailHeight);

        // Bright Laser Line
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
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }

        let direction = analyzeMarketDirection();
        lastCalculatedDirection = direction;

        executeTrade(direction);

        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    // Dynamic Multi-Language / Class Trade Execution
    function executeTrade(direction) {
        let buttons = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"]'));

        let target = null;

        if (direction === "UP") {
            target = buttons.find(btn => {
                let txt = (btn.innerText || btn.textContent || "").toLowerCase();
                let cls = (btn.className || "").toString().toLowerCase();
                return txt.includes("up") || txt.includes("call") || cls.includes("green") || cls.includes("up") || cls.includes("call");
            });
        } else if (direction === "DOWN") {
            target = buttons.find(btn => {
                let txt = (btn.innerText || btn.textContent || "").toLowerCase();
                let cls = (btn.className || "").toString().toLowerCase();
                return txt.includes("down") || txt.includes("put") || cls.includes("red") || cls.includes("down") || cls.includes("put");
            });
        }

        if (target) {
            target.click();
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
        scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
    });
})();
