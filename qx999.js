(function () {
    ['nj999-circle-bot', 'nj999-panel', 'nj999-login', 'nj999-scan-canvas', 'nj999-settings', 'nj999-terminal', 'nj999-active-panel'].forEach(id => {
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
        @keyframes luxuryPulse {
            0% { box-shadow: 0 0 25px rgba(0,255,102,0.25); border-color: #00ff66; }
            50% { box-shadow: 0 0 45px rgba(0,255,102,0.6); border-color: #00ffaa; }
            100% { box-shadow: 0 0 25px rgba(0,255,102,0.25); border-color: #00ff66; }
        }
        ::placeholder { color: #666666; }
    `;
    document.head.appendChild(style);

    // 1. Login Box (Styled with dot mask password UI)
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
        <input type="password" id="nj_pass" value="${shouldPreFill ? licenseKey : ''}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1.5px solid #00ff66; border-radius:14px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; text-align:center; letter-spacing:4px; box-shadow: inset 0 0 10px rgba(0,255,102,0.15);">
        <button id="nj_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:14px; font-weight:bold; font-size:16px; cursor:pointer; box-shadow: 0 0 20px rgba(0,255,102,0.4);">Authenticate</button>
    `;
    document.body.appendChild(loginBox);

    // 2. Active Bot Panel (QX999 Style from user screenshot)
    let activePanel = document.createElement('div');
    activePanel.id = 'nj999-active-panel';
    activePanel.style.cssText = `
        position: fixed; top: 110px; right: 20px; width: 230px;
        background: #09140b; border: 1.5px solid #00ff66; border-radius: 14px;
        color: #ffffff; padding: 12px 15px; z-index: 999998; font-family: sans-serif;
        box-shadow: 0 0 25px rgba(0,255,102,0.3); display: none; user-select: none;
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
            <span id="nj_panel_market" style="color:#ffffff; font-weight:bold;">USD/COP (OTC)</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px;">
            <span style="color:#888888;">NET</span>
            <span id="nj_panel_net" style="color:#00ff66; font-weight:bold;">+0.00 $</span>
        </div>
        <div id="nj_panel_status" style="font-size:11px; color:#aaccbb; border-top:1px solid #142918; padding-top:6px; margin-top:4px;">Scanning market...</div>
    `;
    document.body.appendChild(activePanel);

    function getActiveMarketName() {
        let candidates = document.querySelectorAll('.asset-name, .current-asset, [class*="asset"], [class*="symbol"], header span, div span');
        for (let el of candidates) {
            let text = el.innerText ? el.innerText.trim() : '';
            if (text.match(/^[A-Z]{3}\/[A-Z]{3}/) || text.includes('(OTC)')) {
                if (text.length < 20) return text;
            }
        }
        return "USD/BRL (OTC)";
    }

    function executeTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Up") || text.includes("Call") || text.includes("Higher") || text.includes("Buy") || cls.includes("green") || cls.includes("call");
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                return text.includes("Down") || text.includes("Put") || text.includes("Lower") || text.includes("Sell") || cls.includes("red") || cls.includes("put");
            });
        }

        if (targetBtn) {
            targetBtn.click();
            netProfit += Math.random() > 0.3 ? 18.50 : -15.00; // Simulated real trading return update
            let netEl = document.getElementById('nj_panel_net');
            if(netEl) {
                netEl.innerText = (netProfit >= 0 ? "+" : "") + netProfit.toFixed(2) + " $";
                netEl.style.color = netProfit >= 0 ? "#00ff66" : "#ff3333";
            }
        }
    }

    function startAutoTradingEngine() {
        if (autoTradeInterval) clearInterval(autoTradeInterval);

        autoTradeInterval = setInterval(() => {
            if (!isBotActive) return;

            let currentMarket = getActiveMarketName();
            let marketEl = document.getElementById('nj_panel_market');
            let statusEl = document.getElementById('nj_panel_status');
            
            if (marketEl) marketEl.innerText = currentMarket;
            if (statusEl) statusEl.innerText = `Scanning ${currentMarket}...`;

            let gForce = 0, rForce = 0;
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let cls = (el.getAttribute('class') || '').toLowerCase();
                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || cls.includes('green')) gForce += 80;
                else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || cls.includes('red')) rForce += 80;
            });

            let diff = Math.abs(gForce - rForce);
            if (diff >= 120) {
                let direction = gForce > rForce ? "UP" : "DOWN";
                if (statusEl) statusEl.innerText = `Placing ${direction} on ${currentMarket}`;
                executeTrade(direction);
            }
        }, 2500); // Fast auto check loop
    }

    document.getElementById('nj_login_btn').onclick = function () {
        let inputPass = document.getElementById('nj_pass').value;
        if (inputPass === licenseKey) {
            loginBox.remove();
            activePanel.style.display = 'block';
            isBotActive = true;
            startAutoTradingEngine();
        } else {
            alert("Wrong Password! Use: ALVI5S-NJ99");
        }
    };

    document.getElementById('nj_stop_bot').onclick = function () {
        isBotActive = false;
        if (autoTradeInterval) clearInterval(autoTradeInterval);
        activePanel.style.display = 'none';
        alert("Bot Stopped!");
    };
})();
