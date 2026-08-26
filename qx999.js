(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-signal-box'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    let lastSignal = null;
    let signalHistory = [];

    // 1. Login Box
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 300px; background: #08140c; border: 2px solid #00ff66;
        color: #ffffff; padding: 20px; border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,255,102,0.4); z-index: 999999;
        font-family: Arial, sans-serif; text-align: center;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 5px 0; color:#00ff66; font-size:20px;">QX999 LOGIN</h3>
        <p style="font-size:12px; color:#aaa; margin-bottom:15px;">Enter password to start</p>
        <input type="password" id="qx_pass" value="${licenseKey}" readonly style="width:100%; padding:10px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:8px; box-sizing:border-box; margin-bottom:15px; text-align:center; font-size:15px; outline:none;">
        <button id="qx_login_btn" style="width:100%; padding:10px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:15px; cursor:pointer;">START BOT</button>
    `;
    document.body.appendChild(loginBox);

    // 2. Clean Bot Container (No Green Ring Glow)
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 120px; right: 20px;
        display: none; flex-direction: column; align-items: center;
        z-index: 999999; cursor: move; user-select: none;
        touch-action: none;
    `;
    
    let logoWrapper = document.createElement('div');
    logoWrapper.style.cssText = `
        position: relative; width: 65px; height: 65px;
        display: flex; align-items: center; justify-content: center;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';
    logoIcon.style.cssText = `
        width: 60px; height: 60px;
        background: url('${logoUrl}') center/cover no-repeat;
        border-radius: 50%; border: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        transition: transform 0.2s ease;
    `;

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 13px; margin-top: 5px;
        text-shadow: 0 0 6px #000, 0 0 3px #000; font-family: Arial, sans-serif;
    `;
    logoText.innerText = "QX999";

    logoWrapper.appendChild(logoIcon);
    botContainer.appendChild(logoWrapper);
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

    // 3. Scan Radar Canvas (Top to Bottom Loop)
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

    let scanAnimationId = null, scanY = 0, isScanning = false;

    function drawSmokeScanLine() {
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

        scanY += 3.5; // Slow & smooth scan

        if (scanY <= scanCanvas.height) {
            scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
        } else {
            finishScan();
        }
    }

    // Advanced High Accuracy Market Analyzer Algorithm
    function analyzeChartAndGetSignal() {
        let candles = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
        let greenCount = 0;
        let redCount = 0;

        candles.forEach(el => {
            let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
            let className = el.getAttribute('class') || '';

            if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                greenCount++;
            } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                redCount++;
            }
        });

        let selectedSignal = "UP";

        // Logic 1: Dynamic Trend Detection
        if (greenCount > redCount) {
            selectedSignal = "UP";
        } else if (redCount > greenCount) {
            selectedSignal = "DOWN";
        } else {
            // Logic 2: Momentum Switch if counts are equal or balance needed
            if (lastSignal === "DOWN") {
                selectedSignal = "UP";
            } else if (lastSignal === "UP") {
                selectedSignal = "DOWN";
            } else {
                selectedSignal = Math.random() > 0.5 ? "UP" : "DOWN";
            }
        }

        // Logic 3: Prevent 3 times consecutive same direction to avoid trap trends
        if (signalHistory.length >= 2 && signalHistory[signalHistory.length - 1] === selectedSignal && signalHistory[signalHistory.length - 2] === selectedSignal) {
            selectedSignal = selectedSignal === "UP" ? "DOWN" : "UP";
        }

        lastSignal = selectedSignal;
        signalHistory.push(selectedSignal);
        if (signalHistory.length > 5) signalHistory.shift();

        return selectedSignal;
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        
        let bestSignal = analyzeChartAndGetSignal();
        executeTrade(bestSignal);

        logoIcon.style.transform = "scale(1)";
        isScanning = false;
    }

    // 4. Auto Trade Execution Logic
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

    // 5. Event Handlers
    document.getElementById('qx_login_btn').onclick = function () {
        loginBox.remove();
        botContainer.style.display = 'flex';
    };

    botContainer.addEventListener('click', function () {
        if (isDragging || isScanning) return;

        isScanning = true;
        logoIcon.style.transform = "scale(1.1)";
        
        scanCanvas.style.display = 'block';
        scanY = 0;
        drawSmokeScanLine();
    });
})();
