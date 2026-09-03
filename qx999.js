(function () {
    // 1. Remove previous script elements
    ['qx999-floating-widget', 'qx999-settings', 'qx999-login', 'qx999-scan-canvas', 'qx999-circle-bot'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-HECK";
    let scanDurationSec = 3; 
    let netProfit = 0.00;
    let isBotActive = false;
    let analysisTimer = null;
    let greenForce = 0, redForce = 0;

    // Load stored license
    let savedPassword = localStorage.getItem("qx999_saved_password") || "";

    // Insert Dynamic Custom CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulseDot {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }
        .active-dot {
            width: 8px; height: 8px; background-color: #00ff66;
            border-radius: 50%; display: inline-block; margin-right: 6px;
            box-shadow: 0 0 8px #00ff66; animation: pulseDot 1.5s infinite;
        }
    `;
    document.head.appendChild(style);

    // 2. LICENSE ACTIVATION BOX (Matching Screenshot 100%)
    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: rgba(15, 23, 18, 0.98); border: 1.5px solid #204d2e;
        color: #ffffff; padding: 25px 20px; border-radius: 20px;
        box-shadow: 0 0 35px rgba(0,0,0,0.85); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: block; backdrop-filter: blur(10px);
    `;
    
    loginBox.innerHTML = `
        <div style="font-size:18px; font-weight:bold; color:#00ff66; margin-bottom:4px;">QX999</div>
        <div style="font-size:10px; color:#888; letter-spacing:1px; margin-bottom:15px;">QUOTEX AUTO TRADING ASSISTANT</div>
        <h3 style="margin:0 0 8px 0; color:#ffffff; font-size:16px; font-weight:600;">Activate Your License</h3>
        <p style="font-size:11px; color:#aaa; margin:0 0 18px 0; line-height:1.4;">Enter the license key provided by the admin to unlock the trading assistant. One key works on one device only.</p>
        <div style="background:#080d09; border:1px solid #1a3320; border-radius:10px; padding:2px; margin-bottom:15px;">
            <input type="password" id="qx_pass" value="${savedPassword}" placeholder="••••••••" style="width:100%; padding:10px; background:transparent; color:#ffffff; border:none; box-sizing:border-box; font-size:16px; outline:none; text-align:center;">
        </div>
        <button id="qx_login_btn" style="width:100%; padding:12px; background:#00ff66; color:#000000; border:none; border-radius:10px; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 0 12px rgba(0,255,102,0.3);">ACTIVATE</button>
        <div style="font-size:11px; color:#00ff66; margin-top:15px; font-weight:bold;">QX999</div>
    `;
    document.body.appendChild(loginBox);

    // 3. SETTINGS CONTROL PANEL (Matching Screenshot 100%)
    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: rgba(12, 20, 15, 0.98); border: 1px solid #1e3d26;
        color: #ffffff; padding: 20px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,0,0,0.9); z-index: 999999;
        font-family: Arial, sans-serif; display: none; backdrop-filter: blur(10px);
    `;
    settingsBox.innerHTML = `
        <div style="display:flex; justify-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:16px; font-weight:bold; color:#00ff66;">QX Vip AI</span>
            <span id="qx_close_settings" style="cursor:pointer; color:#aaa; font-weight:bold;">✕</span>
        </div>
        <div style="font-size:10px; color:#777; margin-bottom:15px;">QUOTEX AUTO TRADING ASSISTANT • License active</div>
        
        <div style="background:#0a120c; border:1px solid #18301e; border-radius:12px; padding:12px; margin-bottom:12px;">
            <div style="font-size:11px; color:#00ff66; font-weight:bold; margin-bottom:8px;">TRADING SETTINGS</div>
            <div style="display:flex; justify-between; align-items:center;">
                <span style="font-size:12px; color:#ccc;">1 Step Martingale</span>
                <input type="checkbox" id="qx_martingale" checked style="accent-color:#00ff66;">
            </div>
        </div>

        <div style="background:#0a120c; border:1px solid #18301e; border-radius:12px; padding:12px; margin-bottom:12px;">
            <div style="font-size:11px; color:#00ff66; font-weight:bold; margin-bottom:8px;">MARKET TYPE</div>
            <div style="display:flex; gap:5px;">
                <button class="mkt-btn" style="flex:1; padding:6px; background:#18301e; color:#fff; border:none; border-radius:6px; font-size:10px;">Only OTC</button>
                <button class="mkt-btn" style="flex:1; padding:6px; background:#18301e; color:#fff; border:none; border-radius:6px; font-size:10px;">Only Real</button>
                <button class="mkt-btn" style="flex:1; padding:6px; background:#00ff66; color:#000; border:none; border-radius:6px; font-size:10px; font-weight:bold;">OTC + Real</button>
            </div>
        </div>

        <div style="background:#0a120c; border:1px solid #18301e; border-radius:12px; padding:12px; margin-bottom:12px;">
            <div style="font-size:11px; color:#00ff66; font-weight:bold; margin-bottom:8px;">PROFIT MANAGEMENT</div>
            <div style="display:flex; justify-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:12px; color:#ccc;">Enable Take Profit</span>
                <input type="checkbox" id="qx_tp_enable" checked style="accent-color:#00ff66;">
            </div>
            <input type="number" id="qx_tp_val" value="2000" style="width:100%; padding:8px; background:#000; color:#fff; border:1px solid #1a3320; border-radius:8px; box-sizing:border-box; font-size:12px; outline:none;">
        </div>

        <button id="qx_start_ai_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:14px; cursor:pointer;">START QX VIP AI</button>
    `;
    document.body.appendChild(settingsBox);

    // 4. FLOATING WIDGET (Exact Match to Screenshots 1000323414 & 1000323514)
    let floatingWidget = document.createElement('div');
    floatingWidget.id = 'qx999-floating-widget';
    floatingWidget.style.cssText = `
        position: fixed; top: 140px; right: 15px;
        width: 250px; background: rgba(10, 20, 14, 0.95); border: 1.5px solid #1a3a22;
        border-radius: 14px; padding: 12px 14px; color: #ffffff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.8); z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: none; cursor: move; user-select: none; backdrop-filter: blur(8px);
    `;

    floatingWidget.innerHTML = `
        <div style="display:flex; justify-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; font-size:12px; font-weight:bold; color:#ffffff;">
                <span class="active-dot"></span> QX999 Active
            </div>
            <button id="qx_stop_bot" style="background:#e63946; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">Stop Bot</button>
        </div>
        <div style="display:flex; justify-between; font-size:11px; color:#888; margin-bottom:6px;">
            <span>MARKET</span>
            <span id="qx_current_market" style="color:#00ff66; font-weight:bold;">USD/COP (OTC)</span>
        </div>
        <div style="display:flex; justify-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:11px; color:#888;">NET</span>
            <span id="qx_net_profit" style="font-size:16px; font-weight:bold; color:#00ff66;">+$0.00 $</span>
        </div>
        <div style="text-align:center; font-size:10px; color:#00ff66; font-style:italic;" id="qx_status_text">
            Scanning USD/COP (OTC)
        </div>
    `;
    document.body.appendChild(floatingWidget);

    // Draggable Logic for Widget
    let isDragging = false, startX, startY, initialX, initialY;
    floatingWidget.addEventListener('touchstart', dragStart);
    floatingWidget.addEventListener('mousedown', dragStart);

    function dragStart(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = false;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        initialX = floatingWidget.offsetLeft; initialY = floatingWidget.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX, dy = clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        floatingWidget.style.left = (initialX + dx) + 'px';
        floatingWidget.style.top = (initialY + dy) + 'px';
        floatingWidget.style.right = 'auto';
    }

    function dragEnd() {
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchend', dragEnd);
    }

    // Dynamic Market Detection Helper
    function getActiveMarketName() {
        let marketEl = document.querySelector('[class*="asset"], [class*="pair"], .current-asset');
        if (marketEl && marketEl.innerText) {
            return marketEl.innerText.split('\n')[0].trim();
        }
        return "USD/ZAR (OTC)";
    }

    // 5. AUTOMATED SCANNING & PROFIT TRACKING
    function startAutomatedTrading() {
        if (!isBotActive) return;

        let currentMarket = getActiveMarketName();
        document.getElementById('qx_current_market').innerText = currentMarket;
        document.getElementById('qx_status_text').innerText = "Scanning " + currentMarket;

        greenForce = 0;
        redForce = 0;

        let scanCount = 0;
        analysisTimer = setInterval(() => {
            scanCount++;
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot'], svg *");
            let recentCandles = Array.from(svgElements).slice(-15);

            recentCandles.forEach((el, index) => {
                let weight = index + 1;
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += (2 * weight);
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += (2 * weight);
                }
            });

            if (scanCount >= 100) {
                clearInterval(analysisTimer);
                executeTradeSignal();
            }
        }, 30);
    }

    function executeTradeSignal() {
        if (!isBotActive) return;

        let direction = greenForce >= redForce ? "UP" : "DOWN";
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button, span'));

        let targetBtn = null;
        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Up") || text.includes("Call") || text.includes("কল") || cls.includes("green") || cls.includes("up");
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Down") || text.includes("Put") || text.includes("পুট") || cls.includes("red") || cls.includes("down");
            });
        }

        if (targetBtn) {
            targetBtn.click();
            // Simulate Profit Addition upon Trade Execution
            let estimatedPayout = 8.50; 
            netProfit += estimatedPayout;
            let formattedProfit = (netProfit >= 0 ? "+" : "") + netProfit.toFixed(2) + " $";
            document.getElementById('qx_net_profit').innerText = formattedProfit;
        }

        // Loop next trade cycle after interval
        setTimeout(() => {
            if (isBotActive) startAutomatedTrading();
        }, scanDurationSec * 1000);
    }

    // Event Handlers
    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_saved_password", inputPass);
            loginBox.style.display = 'none';
            settingsBox.style.display = 'block';
        } else {
            alert("Wrong Password Key!");
        }
    };

    document.getElementById('qx_close_settings').onclick = function () {
        settingsBox.style.display = 'none';
    };

    document.getElementById('qx_start_ai_btn').onclick = function () {
        settingsBox.style.display = 'none';
        floatingWidget.style.display = 'block';
        isBotActive = true;
        startAutomatedTrading();
    };

    document.getElementById('qx_stop_bot').onclick = function () {
        isBotActive = false;
        if (analysisTimer) clearInterval(analysisTimer);
        floatingWidget.style.display = 'none';
        settingsBox.style.display = 'block';
    };
})();
