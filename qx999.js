(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";

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
        <button id="qx_login_btn" style="width:100%; padding:10px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:15px; cursor:pointer;">LOGIN</button>
    `;
    document.body.appendChild(loginBox);

    // 2. Settings Panel
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 310px; background: #0b1a10; border: 2px solid #00ff66;
        color: #ffffff; padding: 20px; border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,255,102,0.4); z-index: 999999;
        font-family: Arial, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#00ff66; font-size:18px; text-align:center;">BOT SETTINGS</h3>
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Analysis Delay (Sec):</label>
        <input type="number" id="qx_delay" value="3" style="width:100%; padding:8px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:6px; box-sizing:border-box; margin-bottom:12px; outline:none;">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:5px;">Trade Direction Mode:</label>
        <select id="qx_mode" style="width:100%; padding:8px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:6px; box-sizing:border-box; margin-bottom:18px; outline:none;">
            <option value="AUTO">Auto (AI Signal)</option>
            <option value="UP">Always UP</option>
            <option value="DOWN">Always DOWN</option>
        </select>
        
        <button id="qx_save_btn" style="width:100%; padding:10px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer;">SAVE & START BOT</button>
    `;
    document.body.appendChild(settingsBox);

    // 3. Bot Container (No Glow initially)
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
        position: relative; width: 62px; height: 62px;
        background: url('${logoUrl}') center/cover no-repeat;
        border-radius: 50%; border: 2px solid #555;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        transition: all 0.3s ease;
    `;

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 13px; margin-top: 4px;
        text-shadow: 0 0 5px #000, 0 0 10px #000; font-family: Arial, sans-serif;
    `;
    logoText.innerText = "QX999";

    logoWrapper.appendChild(logoIcon);
    botContainer.appendChild(logoWrapper);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // Draggable Functionality
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

    // 4. Smoke Trail Scan Radar Canvas
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
    let selectedMode = "AUTO";

    function drawSmokeScanLine() {
        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
        
        let trailHeight = 90;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.15)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.45)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 25;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 7;

        if (scanY <= scanCanvas.height) {
            scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
        } else {
            finishScan();
        }
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        
        let finalDirection = selectedMode;
        if (selectedMode === "AUTO") {
            let outcomes = ["UP", "DOWN"];
            finalDirection = outcomes[Math.floor(Math.random() * outcomes.length)];
        }
        
        executeTrade(finalDirection);

        // Turn OFF Green Glow completely after analysis ends
        logoIcon.style.border = "2px solid #555";
        logoIcon.style.boxShadow = "0 0 5px rgba(0,0,0,0.5)";
        isScanning = false;
    }

    // 5. Auto Trade Execution
    function executeTrade(direction) {
        let buttons = Array.from(document.querySelectorAll('button'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = buttons.find(b => b.innerText.includes('Up') || b.innerText.includes('Call') || b.classList.contains('button-call'));
        } else {
            targetBtn = buttons.find(b => b.innerText.includes('Down') || b.innerText.includes('Put') || b.classList.contains('button-put'));
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    // 6. Navigation Event Logic
    document.getElementById('qx_login_btn').onclick = function () {
        loginBox.remove();
        settingsBox.style.display = 'block'; // Open Settings immediately after login
    };

    document.getElementById('qx_save_btn').onclick = function () {
        selectedMode = document.getElementById('qx_mode').value;
        settingsBox.remove(); // Remove settings forever for this session
        botContainer.style.display = 'flex'; // Show bot logo
    };

    botContainer.addEventListener('click', function () {
        if (isDragging || isScanning) return;

        isScanning = true;
        
        // Turn ON Green Glow ONLY during Analysis
        logoIcon.style.border = "2px solid #00ff66";
        logoIcon.style.boxShadow = "0 0 30px #00ff66, 0 0 50px #00ff66";
        
        scanCanvas.style.display = 'block';
        scanY = 0;
        drawSmokeScanLine();
    });
})();
