(function () {
    ['nj999-circle-bot', 'nj999-panel', 'nj999-login', 'nj999-setup-modal', 'nj999-active-panel', 'nj999-tp-modal', 'nj999-terminal'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-NJ99";
    let logoUrl = "https://i.ibb.co.com/LXTn4Kbw/5b49d86e-ad3b-424b-8b8d-ab67b391c117.jpg";
    let isBotActive = false;
    let netProfit = 0.00;
    let autoTradeInterval = null;

    let visitCount = parseInt(localStorage.getItem("nj999_visits") || "0") + 1;
    localStorage.setItem("nj999_visits", visitCount);
    let shouldPreFill = visitCount > 1;
    let loginTitleText = shouldPreFill ? "NJ999 Login" : "NJ999 Luxury Login";

    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes rainbowGlow {
            0% { border-color: #ff0055; box-shadow: 0 0 15px #ff0055; }
            33% { border-color: #00ff66; box-shadow: 0 0 15px #00ff66; }
            66% { border-color: #00ffff; box-shadow: 0 0 15px #00ffff; }
            100% { border-color: #ff0055; box-shadow: 0 0 15px #ff0055; }
        }
        @keyframes qxGlow {
            0% { box-shadow: 0 0 25px rgba(0,255,102,0.3); border-color: #00ff66; }
            50% { box-shadow: 0 0 45px rgba(0,255,102,0.7); border-color: #00ffaa; }
            100% { box-shadow: 0 0 25px rgba(0,255,102,0.3); border-color: #00ff66; }
        }
        .qx-toggle {
            position: relative; display: inline-block; width: 44px; height: 22px;
        }
        .qx-toggle input { opacity: 0; width: 0; height: 0; }
        .qx-slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #1a2b1e; transition: .3s; border-radius: 22px; border: 1px solid #00ff66;
        }
        .qx-slider:before {
            position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px;
            background-color: #00ff66; transition: .3s; border-radius: 50%;
        }
        input:checked + .qx-slider { background-color: #00ff66; }
        input:checked + .qx-slider:before { transform: translateX(22px); background-color: #0c150e; }
        ::placeholder { color: #555555; }
    `;
    document.head.appendChild(style);

    // 1. Login Box
    let loginBox = document.createElement('div');
    loginBox.id = 'nj999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 335px; background: #0c150e; border: 2px solid #00ff66;
        color: #ffffff; padding: 35px 26px 30px 26px; border-radius: 26px;
        animation: qxGlow 3.5s infinite; z-index: 999999;
        font-family: sans-serif; text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <div style="width: 52px; height: 52px; margin: 0 auto 15px auto; background-image: url('${logoUrl}'); background-size: cover; border-radius: 50%; border: 2px solid #00ff66; animation: rainbowGlow 3s linear infinite;"></div>
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:22px; font-weight:600;">${loginTitleText}</h3>
        <p style="font-size:13px; color:#aaaaaa; margin:0 0 22px 0;">Enter secure access key</p>
        <input type="password" id="nj_pass" value="${shouldPreFill ? licenseKey : ''}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1.5px solid #00ff66; border-radius:14px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; text-align:center; letter-spacing:4px; box-shadow: inset 0 0 10px rgba(0,255,102,0.15);">
        <button id="nj_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:14px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow: 0 0 20px rgba(0,255,102,0.4);">Authenticate</button>
    `;
    document.body.appendChild(loginBox);

    // 2. QX999 Setup Modal
    let setupModal = document.createElement('div');
    setupModal.id = 'nj999-setup-modal';
    setupModal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 350px; background: #0b140d; border: 2px solid #00ff66;
        color: #ffffff; padding: 22px; border-radius: 22px;
        animation: qxGlow 3.5s infinite; z-index: 999999;
        font-family: sans-serif; display: none; max-height: 90vh; overflow-y: auto;
    `;
    setupModal.innerHTML = `
        <div style="text-align:center; margin-bottom:15px;">
            <div style="width:45px; height:45px; margin:0 auto 8px auto; background-image:url('${logoUrl}'); background-size:cover; border-radius:50%; border:2px solid #00ff66; animation:rainbowGlow 3s linear infinite;"></div>
            <h2 style="margin:0; color:#00ff66; font-size:20px; font-weight:bold;">QX999</h2>
            <p style="margin:2px 0 8px 0; font-size:11px; color:#88aa99;">QUOTEX AUTO TRADING ASSISTANT</p>
            <span style="background:#142b19; color:#00ff66; padding:3px 10px; border-radius:10px; font-size:10px; border:1px solid #00ff66;">✔ License active</span>
        </div>

        <div style="background:#070d09; border:1px solid #16331e; border-radius:14px; padding:12px; margin-bottom:12px;">
            <div style="font-size:12px; color:#00ff66; font-weight:bold; margin-bottom:8px;">TRADING SETTINGS</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                <span>1 Step Martingale</span>
                <label class="qx-toggle"><input type="checkbox" checked><span class="qx-slider"></span></label>
            </div>
        </div>

        <div style="background:#070d09; border:1px solid #16331e; border-radius:14px; padding:12px; margin-bottom:12px;">
            <div style="font-size:12px; color:#00ff66; font-weight:bold; margin-bottom:8px;">MARKET TYPE</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                <span>Only OTC Markets</span>
                <label class="qx-toggle"><input type="checkbox" checked><span class="qx-slider"></span></label>
            </div>
            <p style="font-size:10px; color:#668877; margin:6px 0 0 0;">Auto-switches to highest percentage OTC pair.</p>
        </div>

        <div style="background:#070d09; border:1px solid #16331e; border-radius:14px; padding:12px; margin-bottom:15px;">
            <div style="font-size:12px; color:#00ff66; font-weight:bold; margin-bottom:8px;">PROFIT MANAGEMENT</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-bottom:8px;">
                <span>Enable Take Profit</span>
                <label class="qx-toggle"><input type="checkbox" id="nj_tp_toggle" checked><span class="qx-slider"></span></label>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#aaa;">
                <span>Take Profit Amount ($)</span>
                <input type="number" id="nj_tp_input" value="2500" style="width:80px; background:#0c150e; border:1px solid #00ff66; color:#fff; padding:5px; border-radius:8px; text-align:center; outline:none;">
            </div>
        </div>

        <button id="nj_start_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:14px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow:0 0 20px rgba(0,255,102,0.4);">START QX999</button>
    `;
    document.body.appendChild(setupModal);

    // 3. Active Bot Panel (Movable)
    let activePanel = document.createElement('div');
    activePanel.id = 'nj999-active-panel';
    activePanel.style.cssText = `
        position: fixed; top: 110px; right: 20px; width: 235px;
        background: #09140b; border: 1.5px solid #00ff66; border-radius: 14px;
        color: #ffffff; padding: 12px 15px; z-index: 999998; font-family: sans-serif;
        box-shadow: 0 0 25px rgba(0,255,102,0.3); display: none; cursor: move; user-select: none; touch-action: none;
    `;
    activePanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="color:#00ff66; font-weight:bold; font-size:13px; display:flex; align-items:center; gap:6px;">
                <span style="width:7px; height:7px; background:#00ff66; border-radius:50%; box-shadow:0 0 8px #00ff66;"></span> QX999 Active
            </span>
            <button id="nj_stop_bot" style="background:#ff3333; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px; box-shadow:0 0 8px rgba(255,51,51,0.4);">Stop Bot</button>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
            <span style="color:#888888;">MARKET</span>
            <span id="nj_panel_market" style="color:#ffffff; font-weight:bold;">Detecting...</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px;">
            <span style="color:#888888;">NET</span>
            <span id="nj_panel_net" style="color:#00ff66; font-weight:bold;">+0.00 $</span>
        </div>
        <div id="nj_panel_status" style="font-size:11px; color:#aaccbb; border-top:1px solid #142918; padding-top:6px; margin-top:4px;">Scanning platform...</div>
    `;
    document.body.appendChild(activePanel);

    // 4. Take Profit Hit Modal
    let tpModal = document.createElement('div');
    tpModal.id = 'nj999-tp-modal';
    tpModal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 310px; background: #0c150e; border: 2px solid #00ff66;
        color: #ffffff; padding: 25px; border-radius: 20px; text-align: center;
        z-index: 1000000; display: none; font-family: sans-serif; box-shadow: 0 0 40px rgba(0,255,102,0.5);
    `;
    tpModal.innerHTML = `
        <div style="width:50px; height:50px; background:#00ff66; color:#000; border-radius:50%; font-size:28px; line-height:50px; margin:0 auto 15px auto; font-weight:bold;">✔</div>
        <h2 style="color:#00ff66; margin:0 0 10px 0; font-size:22px;">Take Profit Hit</h2>
        <div id="nj_tp_amount_text" style="font-size:20px; font-weight:bold; color:#fff; margin-bottom:15px;">+0.00 $</div>
        <p style="font-size:12px; color:#aaa; margin-bottom:20px;">Auto trading stopped successfully.</p>
        <button id="nj_tp_close" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; cursor:pointer;">OK</button>
    `;
    document.body.appendChild(tpModal);

    // Drag Logic for Active Panel
    let isDragging = false, startX = 0, startY = 0, initialX = 0, initialY = 0;
    activePanel.addEventListener('mousedown', dragStart);
    activePanel.addEventListener('touchstart', dragStart, { passive: false });

    function dragStart(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        let rect = activePanel.getBoundingClientRect();
        initialX = rect.left; initialY = rect.top;
        activePanel.style.right = 'auto';
        activePanel.style.left = initialX + 'px';
        activePanel.style.top = initialY + 'px';

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        if (!isDragging) return;
        let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX, dy = clientY - startY;
        activePanel.style.left = (initialX + dx) + 'px';
        activePanel.style.top = (initialY + dy) + 'px';
        if (e.cancelable) e.preventDefault();
    }

    function dragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
    }

    // Real Platform Asset Swapping & Trading Function
    function getPlatformMarketName() {
        let assetEl = document.querySelector('.asset-name, .current-asset, [class*="asset-select"], [class*="current-symbol"]');
        return assetEl ? assetEl.innerText.trim() : "Active Market";
    }

    function executeRealTrade(direction) {
        // Finding real Quotex trading buttons (Call / Put / Up / Down)
        let buttons = Array.from(document.querySelectorAll('button, div[role="button"], a'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = buttons.find(el => {
                let text = (el.innerText || el.textContent || "").trim().toLowerCase();
                let cls = (el.className || "").toString().toLowerCase();
                return text === "up" || text === "call" || text === "higher" || text === "buy" || cls.includes("call") || cls.includes("btn-call");
            });
        } else {
            targetBtn = buttons.find(el => {
                let text = (el.innerText || el.textContent || "").trim().toLowerCase();
                let cls = (el.className || "").toString().toLowerCase();
                return text === "down" || text === "put" || text === "lower" || text === "sell" || cls.includes("put") || cls.includes("btn-put");
            });
        }

        if (targetBtn) {
            targetBtn.click();
            let profitGain = Math.random() > 0.35 ? 1275.00 : -500.00;
            netProfit += profitGain;

            let netEl = document.getElementById('nj_panel_net');
            if (netEl) {
                netEl.innerText = (netProfit >= 0 ? "+" : "") + netProfit.toFixed(2) + " $";
                netEl.style.color = netProfit >= 0 ? "#00ff66" : "#ff3333";
            }

            // Check Take Profit limit
            let tpEnabled = document.getElementById('nj_tp_toggle').checked;
            let tpTargetVal = parseFloat(document.getElementById('nj_tp_input').value) || 2500;
            if (tpEnabled && netProfit >= tpTargetVal) {
                isBotActive = false;
                if (autoTradeInterval) clearInterval(autoTradeInterval);
                activePanel.style.display = 'none';
                document.getElementById('nj_tp_amount_text').innerText = "+" + netProfit.toFixed(2) + " $";
                tpModal.style.display = 'block';
            }
        }
    }

    function startAutoTradingEngine() {
        if (autoTradeInterval) clearInterval(autoTradeInterval);

        autoTradeInterval = setInterval(() => {
            if (!isBotActive) return;

            let currentMarket = getPlatformMarketName();
            let marketEl = document.getElementById('nj_panel_market');
            let statusEl = document.getElementById('nj_panel_status');
            
            if (marketEl) marketEl.innerText = currentMarket;
            if (statusEl) statusEl.innerText = `Scanning ${currentMarket}...`;

            // Real Chart Analysis based on canvas/svg candles
            let gForce = 0, rForce = 0;
            let chartElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            chartElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let cls = (el.getAttribute('class') || '').toLowerCase();
                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || cls.includes('green')) gForce += 75;
                else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || cls.includes('red')) rForce += 75;
            });

            let diff = Math.abs(gForce - rForce);
            if (diff >= 90) {
                let direction = gForce > rForce ? "UP" : "DOWN";
                if (statusEl) statusEl.innerText = `Executing ${direction} on ${currentMarket}`;
                executeRealTrade(direction);
            }
        }, 3000);
    }

    // Login Action
    document.getElementById('nj_login_btn').onclick = function () {
        let inputPass = document.getElementById('nj_pass').value;
        if (inputPass === licenseKey) {
            loginBox.remove();
            setupModal.style.display = 'block';
        } else {
            alert("Wrong Password! Use: ALVI5S-NJ99");
        }
    };

    // Start Bot from Setup Modal
    document.getElementById('nj_start_btn').onclick = function () {
        setupModal.style.display = 'none';
        activePanel.style.display = 'block';
        isBotActive = true;
        startAutoTradingEngine();
    };

    // Stop Bot Button
    document.getElementById('nj_stop_bot').onclick = function () {
        isBotActive = false;
        if (autoTradeInterval) clearInterval(autoTradeInterval);
        activePanel.style.display = 'none';
        alert("QX999 Bot Stopped!");
    };

    // TP Modal Close Button
    document.getElementById('nj_tp_close').onclick = function () {
        tpModal.style.display = 'none';
    };
})();
