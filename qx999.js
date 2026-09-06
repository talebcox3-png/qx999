(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-NJQX";
    let logoUrl = "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png";
    let scanDurationSec = 3; 
    let isConfigured = false; 
    let isScanning = false;

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

    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";
    let savedPass = localStorage.getItem("qx999_saved_pass") || "";

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #111827; border: 2px solid #00ff88;
        color: #ffffff; padding: 30px 20px; border-radius: 16px;
        box-shadow: 0 0 30px rgba(0,255,136,0.3); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 5px 0; color:#ffffff; font-size:20px; font-weight:700;">QX999 Login</h3>
        <p style="font-size:12px; color:#9ca3af; margin:0 0 20px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${savedPass}" placeholder="••••••••" style="width:100%; padding:12px 15px; background:#1f2937; color:#fff; border:1px solid #374151; border-radius:8px; box-sizing:border-box; margin-bottom:20px; font-size:15px; outline:none; letter-spacing:2px;">
        <button id="qx_login_btn" style="width:100%; padding:12px; background:#00ff88; color:#0b0e14; border:none; border-radius:8px; font-weight:800; font-size:15px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = isLoggedIn ? 'flex' : 'none';

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

    let isDragging = false, startX, startY, initialX, initialY;
    
    botContainer.addEventListener('pointerdown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        initialX = botContainer.offsetLeft;
        initialY = botContainer.offsetTop;
        botContainer.setPointerCapture(e.pointerId);
    });

    botContainer.addEventListener('pointermove', (e) => {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.right = 'auto';
    });

    botContainer.addEventListener('pointerup', () => {});

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

        if (elapsedSec >= scanDurationSec) {
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

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) cancelAnimationFrame(scanAnimationId);
        
        logoIcon.classList.remove('glowing');
        isScanning = false;

        let direction = Math.random() > 0.5 ? "UP" : "DOWN";
        executeAutoTrade(direction);
    }

    function executeAutoTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a'));
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
            localStorage.setItem("qx999_logged_in", "true");
            localStorage.setItem("qx999_saved_pass", inputPass);
            loginBox.remove();
            botContainer.style.display = 'flex';
        } else {
            alert("Incorrect Password!");
        }
    };

    botContainer.onclick = function () {
        if (isDragging) return;
        if (isScanning) return;

        isScanning = true;
        logoIcon.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        drawScanLine();
    };
})();
