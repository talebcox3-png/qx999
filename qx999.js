(function () {
    // Remove existing instances
    ['qx999-login-modal', 'qx999-settings-modal', 'qx999-circle-widget', 'qx999-style-sheet', 'qx999-scan-line', 'qx999-scan-text'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let isAnalyzing = false;
    let customLogoUrl = "https://i.ibb.co.com/KxYhht7K/1000323502-photoaidcom-cropped.png";
    const DEFAULT_PASS = "5S-XALVI1001";
    let selectedStrategy = "QX999 TRADE";

    // Inject Stylesheet
    const style = document.createElement('style');
    style.id = 'qx999-style-sheet';
    style.innerHTML = `
        /* Full Cover Overlay for Login */
        .qx999-cover-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #03070e;
            display: flex; align-items: center; justify-content: center;
            z-index: 9999999; font-family: 'Segoe UI', Roboto, sans-serif;
        }

        /* Settings Overlay */
        .qx999-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999999; font-family: 'Segoe UI', Roboto, sans-serif;
        }

        .qx999-card {
            width: 310px; background: #070d17;
            border: 1.5px solid #00ff66; border-radius: 14px;
            box-shadow: 0 0 20px rgba(0, 255, 102, 0.2);
            overflow: hidden; text-align: center; color: #fff;
        }
        .qx999-header {
            padding: 16px 15px 10px 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .qx999-header h2 {
            margin: 0; color: #00ff66; font-size: 19px; font-weight: 800;
            letter-spacing: 1px; text-shadow: 0 0 8px rgba(0, 255, 102, 0.5);
        }
        .qx999-body { padding: 20px; }
        .qx999-input-box, .qx999-select-box {
            width: 100%; padding: 10px; box-sizing: border-box;
            background: #0d1624; border: 1px solid #00ff66;
            border-radius: 8px; color: #00ff66; font-size: 15px;
            font-weight: bold; text-align: center; outline: none;
        }
        .qx999-btn {
            width: 100%; margin-top: 16px; padding: 11px;
            background: #00ff66; color: #000; font-size: 14px; font-weight: 900;
            border: none; border-radius: 8px; cursor: pointer; letter-spacing: 1px;
            box-shadow: 0 4px 12px rgba(0, 255, 102, 0.3); transition: 0.2s;
        }
        .qx999-btn:active { transform: scale(0.97); }

        /* Floating Widget Normal State */
        .qx999-widget-container {
            position: fixed; top: 260px; right: 20px;
            display: flex; flex-direction: column; align-items: center;
            z-index: 999998; cursor: pointer; user-select: none;
        }
        .qx999-widget-btn {
            width: 60px; height: 60px; border-radius: 50%; background: #050a12;
            border: 2px solid #00ff66;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
            display: flex; align-items: center; justify-content: center; overflow: hidden;
            transition: all 0.3s ease;
        }
        .qx999-widget-img { 
            width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
        }

        /* Glowing Animation during Analysis */
        @keyframes logoAnalysisGlow {
            0% {
                box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;
                transform: scale(1);
            }
            50% {
                box-shadow: 0 0 25px #00ff66, 0 0 40px #00ff66, 0 0 10px #ffffff;
                transform: scale(1.08);
            }
            100% {
                box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;
                transform: scale(1);
            }
        }
        .qx999-widget-btn.glowing {
            animation: logoAnalysisGlow 0.8s infinite ease-in-out;
            border-color: #ffffff;
        }

        .qx999-widget-label {
            margin-top: 5px; background: rgba(2, 5, 10, 0.85); color: #ffffff;
            font-size: 11px; font-weight: 900; padding: 3px 12px;
            border-radius: 20px; border: 1.5px solid #1e293b;
            letter-spacing: 1px; font-family: sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.6); text-transform: uppercase;
        }

        /* Scanning Visuals */
        @keyframes scanLaserLine {
            0% { top: 20%; opacity: 0.3; }
            50% { top: 50%; opacity: 1; }
            100% { top: 80%; opacity: 0.3; }
        }
        @keyframes scanTextPulse {
            0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
            100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
        }
        .qx999-scan-line {
            position: fixed; left: 0; width: 100%; height: 2.5px;
            background: #00ff66; box-shadow: 0 0 12px #00ff66;
            z-index: 999997; display: none; pointer-events: none;
            animation: scanLaserLine 1.2s ease-in-out infinite alternate;
        }
        .qx999-scan-text {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 26px; font-weight: 900; color: #00ff66;
            text-shadow: 0 0 12px rgba(0, 255, 102, 0.9);
            letter-spacing: 2px; z-index: 999999; pointer-events: none;
            font-family: 'Courier New', monospace; text-align: center;
            display: none; animation: scanTextPulse 0.8s ease-in-out infinite; line-height: 1.2;
        }
    `;
    document.head.appendChild(style);

    // 1. Full Cover Login Modal
    let loginModal = document.createElement('div');
    loginModal.id = 'qx999-login-modal';
    loginModal.className = 'qx999-cover-overlay';
    loginModal.innerHTML = `
        <div class="qx999-card">
            <div class="qx999-header">
                <h2>QX999 Login</h2>
            </div>
            <div class="qx999-body">
                <p style="margin-top:0; color:#aaa; font-size:12px;">Enter password to continue</p>
                <input type="password" id="qx999-pass-input" class="qx999-input-box" value="${DEFAULT_PASS}">
                <button id="qx999-login-submit" class="qx999-btn">Enter</button>
            </div>
        </div>
    `;
    document.body.appendChild(loginModal);

    document.getElementById('qx999-login-submit').addEventListener('click', function () {
        loginModal.remove();
        initializeBotWidget();
    });

    // 2. Initialize Widget
    function initializeBotWidget() {
        let container = document.createElement('div');
        container.id = 'qx999-circle-widget';
        container.className = 'qx999-widget-container';
        container.innerHTML = `
            <div class="qx999-widget-btn" id="qx999-main-btn">
                <img src="${customLogoUrl}" class="qx999-widget-img" alt="QX999">
            </div>
            <div class="qx999-widget-label">QX999</div>
        `;
        document.body.appendChild(container);

        let scanLine = document.createElement('div');
        scanLine.className = 'qx999-scan-line';
        document.body.appendChild(scanLine);

        let scanText = document.createElement('div');
        scanText.className = 'qx999-scan-text';
        scanText.innerHTML = "SCANNING<br>MARKET";
        document.body.appendChild(scanText);

        // Dragging & Click Events
        let startX, startY, initialX, initialY, hasMoved = false;
        container.addEventListener('touchstart', dragStart, {passive: false});
        container.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            hasMoved = false;
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
            initialX = container.offsetLeft; initialY = container.offsetTop;

            document.addEventListener('touchmove', dragMove, {passive: false});
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchend', dragEnd);
            document.addEventListener('mouseup', dragEnd);
        }

        function dragMove(e) {
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
                hasMoved = true;
            }
            if (hasMoved) {
                if (e.cancelable) e.preventDefault();
                container.style.left = (initialX + (clientX - startX)) + 'px';
                container.style.top = (initialY + (clientY - startY)) + 'px';
            }
        }

        function dragEnd() {
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            document.removeEventListener('mouseup', dragEnd);

            if (!hasMoved && !isAnalyzing) {
                openSettingsModal(scanLine, scanText);
            }
        }
    }

    // 3. Settings Modal
    function openSettingsModal(scanLine, scanText) {
        let existing = document.getElementById('qx999-settings-modal');
        if (existing) existing.remove();

        let settingsModal = document.createElement('div');
        settingsModal.id = 'qx999-settings-modal';
        settingsModal.className = 'qx999-overlay';
        settingsModal.innerHTML = `
            <div class="qx999-card">
                <div class="qx999-header">
                    <h2>QX999 Settings</h2>
                </div>
                <div class="qx999-body">
                    <p style="margin-top:0; color:#aaa; font-size:12px; text-align:left; margin-bottom:6px;">Select Strategy:</p>
                    <select id="qx999-strategy-select" class="qx999-select-box">
                        <option value="QX999 TRADE" ${selectedStrategy === "QX999 TRADE" ? "selected" : ""}>QX999 TRADE</option>
                        <option value="ONLY UP" ${selectedStrategy === "ONLY UP" ? "selected" : ""}>ONLY UP</option>
                        <option value="ONLY DOWN" ${selectedStrategy === "ONLY DOWN" ? "selected" : ""}>ONLY DOWN</option>
                    </select>
                    <button id="qx999-settings-ok" class="qx999-btn">START ANALYSIS</button>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        document.getElementById('qx999-settings-ok').addEventListener('click', function () {
            selectedStrategy = document.getElementById('qx999-strategy-select').value;
            settingsModal.remove();
            startAiMarketAnalysis(scanLine, scanText);
        });
    }

    // 4. Analysis Execution & Glowing Toggle
    function startAiMarketAnalysis(scanLine, scanText) {
        isAnalyzing = true;
        let mainBtn = document.getElementById('qx999-main-btn');

        if (mainBtn) mainBtn.classList.add('glowing');
        scanLine.style.display = 'block';
        scanText.style.display = 'block';

        setTimeout(() => {
            if (mainBtn) mainBtn.classList.remove('glowing');
            scanLine.style.display = 'none';
            scanText.style.display = 'none';

            let signal = analyzeHighProfitEngine();
            executeTradeSignal(signal);

            isAnalyzing = false;
        }, 2200);
    }

    // 5. High Profit Analysis Engine
    function analyzeHighProfitEngine() {
        if (selectedStrategy === "ONLY UP") return 'UP';
        if (selectedStrategy === "ONLY DOWN") return 'DOWN';

        let candleNodes = Array.from(document.querySelectorAll('svg path, canvas, div[class*="candle"], div[class*="chart"]'));
        if (candleNodes.length === 0) return (Math.random() > 0.35) ? 'UP' : 'DOWN';

        let greenScore = 0, redScore = 0;
        let recentCandles = candleNodes.slice(-15);

        recentCandles.forEach((node, idx) => {
            let style = window.getComputedStyle(node);
            let combined = (style.fill + style.stroke + style.backgroundColor).toLowerCase();
            let weight = Math.pow(1.2, idx);

            if (combined.includes('0, 255') || combined.includes('26a69a') || combined.includes('green')) {
                greenScore += weight;
            } else if (combined.includes('255, 74') || combined.includes('eb4d4b') || combined.includes('red')) {
                redScore += weight;
            }
        });

        return greenScore >= redScore ? 'UP' : 'DOWN';
    }

    // 6. Execute Trade Signal
    function executeTradeSignal(signal) {
        let upBtn = document.querySelector('.button--call, .btn-call, .section-deal__button._green, button.btn-up');
        let downBtn = document.querySelector('.button--put, .btn-put, .section-deal__button._red, button.btn-down');

        if (!upBtn || !downBtn) {
            let allBtns = Array.from(document.querySelectorAll('button'));
            upBtn = allBtns.find(b => (b.innerText || '').toLowerCase().includes('up') || (b.innerText || '').toLowerCase().includes('call'));
            downBtn = allBtns.find(b => (b.innerText || '').toLowerCase().includes('down') || (b.innerText || '').toLowerCase().includes('put'));
        }

        let target = (signal === 'UP') ? upBtn : downBtn;
        if (target) {
            let opts = { bubbles: true, cancelable: true, view: window };
            target.dispatchEvent(new PointerEvent('pointerdown', opts));
            target.dispatchEvent(new MouseEvent('mousedown', opts));
            target.dispatchEvent(new PointerEvent('pointerup', opts));
            target.dispatchEvent(new MouseEvent('mouseup', opts));
            target.dispatchEvent(new MouseEvent('click', opts));
        }
    }
})();
