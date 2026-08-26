(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-signal-box'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://ibb.co.com/35vKSFyz";

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #08140c; border: 2px solid #00ff66;
        color: #ffffff; padding: 25px; border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,255,102,0.4); z-index: 999999;
        font-family: Arial, sans-serif; text-align: center;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 5px 0; color:#00ff66; font-size:22px;">QX999 Login</h3>
        <p style="font-size:12px; color:#aaa; margin-bottom:20px;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${licenseKey}" readonly style="width:100%; padding:12px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:8px; box-sizing:border-box; margin-bottom:20px; text-align:center; font-size:16px; outline:none;">
        <button id="qx_login_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        display: none; flex-direction: column; align-items: center;
        z-index: 999999; cursor: pointer; user-select: none;
    `;
    botContainer.innerHTML = `
        <div style="width: 65px; height: 65px; background: url('${logoUrl}') center/cover no-repeat; border-radius: 50%; box-shadow: 0 0 15px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2);"></div>
        <span style="color: #ffffff; font-weight: bold; font-size: 14px; margin-top: 6px; text-shadow: 0 0 4px #000, 0 0 8px #000; font-family: Arial, sans-serif; letter-spacing: 0.5px;">QX999</span>
    `;
    document.body.appendChild(botContainer);

    let signalBox = document.createElement('div');
    signalBox.id = 'qx999-signal-box';
    signalBox.style.cssText = `
        position: fixed; top: 30px; right: 100px; background: rgba(8, 20, 12, 0.95);
        border: 2px solid #00ff66; color: #00ff66; padding: 10px 15px; border-radius: 8px;
        font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; z-index: 999999; display: none;
        box-shadow: 0 0 15px rgba(0,255,102,0.4);
    `;
    document.body.appendChild(signalBox);

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

    let scanAnimationId = null;
    let scanY = 0;
    let scanDirection = 1;

    function drawScanLine() {
        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 15;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 5 * scanDirection;
        if (scanY >= scanCanvas.height || scanY <= 0) scanDirection *= -1;
        scanAnimationId = requestAnimationFrame(drawScanLine);
    }

    let panel = document.createElement('div');
    panel.id = 'qx999-panel';
    panel.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #08140c; border: 2px solid #00ff66;
        color: #ffffff; padding: 25px; border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,255,102,0.4); z-index: 999999; display: none;
        font-family: Arial, sans-serif;
    `;
    panel.innerHTML = `
        <h3 style="margin:0 0 15px 0; text-align:center; color:#00ff66; font-size:22px;">QX999 Settings</h3>
        <label style="font-size:12px; color:#ccc; display:block; margin-bottom:5px;">Scan delay (seconds)</label>
        <input type="number" id="scan_delay" value="5" style="width:100%; margin-bottom:15px; padding:10px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:8px; box-sizing:border-box;">
        <label style="font-size:12px; color:#ccc; display:block; margin-bottom:2px;">After trade scan (seconds)</label>
        <input type="number" id="after_scan" value="5" style="width:100%; margin-bottom:15px; padding:10px; background:#112e1f; color:#fff; border:1px solid #00ff66; border-radius:8px; box-sizing:border-box;">
        <label style="font-size:12px; color:#ccc; display:block; margin-bottom:8px;">Trade direction mode</label>
        <button style="width:100%; padding:10px; margin-bottom:8px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">SURE SHOT</button>
        <button id="save_bot_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;">Save Settings</button>
    `;
    document.body.appendChild(panel);

    document.getElementById('qx_login_btn').onclick = function () {
        loginBox.remove();
        botContainer.style.display = 'flex';
    };

    function executeTrade(direction) {
        let btnSelector = direction === "UP" ? ".button-call, .btn-call, [class*='call']" : ".button-put, .btn-put, [class*='put']";
        let tradeBtn = document.querySelector(btnSelector);
        if (tradeBtn) {
            tradeBtn.click();
        }
    }

    let clickTimer = null;
    botContainer.addEventListener('click', function () {
        if (clickTimer == null) {
            clickTimer = setTimeout(function () {
                clickTimer = null;
                
                scanCanvas.style.display = 'block';
                signalBox.style.display = 'block';
                signalBox.innerText = "Analyzing Market...";
                scanY = 0;
                if (!scanAnimationId) drawScanLine();

                setTimeout(() => {
                    scanCanvas.style.display = 'none';
                    if (scanAnimationId) {
                        cancelAnimationFrame(scanAnimationId);
                        scanAnimationId = null;
                    }
                    
                    let outcomes = ["UP", "DOWN"];
                    let selectedSignal = outcomes[Math.floor(Math.random() * outcomes.length)];
                    signalBox.innerText = "Signal: " + selectedSignal + " (Executing Trade)";
                    
                    executeTrade(selectedSignal);

                    setTimeout(() => {
                        signalBox.style.display = 'none';
                    }, 4000);
                }, 3000);

            }, 300);
        } else {
            clearTimeout(clickTimer);
            clickTimer = null;
            panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
        }
    });

    document.getElementById('save_bot_btn').onclick = function () {
        panel.style.display = 'none';
    };
})();
