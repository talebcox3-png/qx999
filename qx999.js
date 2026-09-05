(function () {
    // 1. Clean previous instances
    ['qx999-login-overlay', 'qx999-settings-overlay', 'qx999-circle-bot', 'qx999-style-sheet', 'qx999-scan-laser'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-HECK";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    
    let scanDelay = 5;
    let afterTradeScan = 5;
    let tradeDirection = "Random";
    let isAnalyzing = false;
    let tapCount = 0;
    let tapTimer = null;

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    // Inject Stylesheet
    const style = document.createElement('style');
    style.id = 'qx999-style-sheet';
    style.innerHTML = `
        .qx999-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .qx999-card {
            width: 310px; background: #0a110e;
            border: 1.5px solid #00ff66; border-radius: 20px;
            padding: 24px 20px; text-align: center; color: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 102, 0.15);
            box-sizing: border-box;
        }

        .qx999-card h3 {
            margin: 0 0 6px 0; color: #00ff66; font-size: 20px; font-weight: 700;
        }
        .qx999-card p {
            margin: 0 0 18px 0; color: #a0aab0; font-size: 13px;
        }

        .qx999-input {
            width: 100%; padding: 12px; background: #000000;
            border: 1px solid #1c3d27; border-radius: 12px;
            color: #ffffff; font-size: 16px; outline: none;
            box-sizing: border-box; text-align: left; margin-bottom: 16px;
        }
        .qx999-input:focus { border-color: #00ff66; }

        .qx999-btn-submit {
            width: 100%; padding: 14px; background: #00ff66;
            color: #000000; font-size: 16px; font-weight: 800;
            border: none; border-radius: 14px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 255, 102, 0.3); transition: 0.2s;
        }
        .qx999-btn-submit:active { transform: scale(0.98); }

        .qx999-dir-btn {
            width: 100%; padding: 11px; background: #0d1712;
            border: 1px solid #1c3d27; border-radius: 12px;
            color: #ffffff; font-size: 14px; font-weight: 600;
            margin-bottom: 10px; cursor: pointer; transition: 0.2s;
        }
        .qx999-dir-btn.active {
            border-color: #00ff66; background: rgba(0, 255, 102, 0.1); color: #00ff66;
        }

        #qx999-circle-bot {
            position: fixed; top: 250px; right: 20px;
            display: flex; flex-direction: column; align-items: center;
            z-index: 999998; cursor: pointer; user-select: none; touch-action: none;
        }
        
        .qx999-bot-wrapper {
            position: relative;
            width: 65px;
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .qx999-bot-icon {
            width: 58px; height: 58px; border-radius: 50%;
            background: url('${logoUrl}') center/cover no-repeat;
            border: 2px solid #00ff66;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8), 0 0 10px rgba(0, 255, 102, 0.3);
            z-index: 2;
        }

        .qx999-scan-ring {
            position: absolute;
            top: -4px; left: -4px; right: -4px; bottom: -4px;
            border-radius: 50%;
            border: 2px dashed #00ff66;
            opacity: 0;
            z-index: 1;
        }

        .qx999-bot-wrapper.scanning .qx999-scan-ring {
            opacity: 1;
            animation: qx999Rotate 2s linear infinite;
        }

        .qx999-bot-wrapper.scanning .qx999-bot-icon {
            animation: qx999GlowPulse 0.8s infinite alternate ease-in-out;
        }

        .qx999-stars {
            display: flex;
            gap: 2px;
            margin-top: 4px;
            font-size: 10px;
            color: #00ff66;
        }

        .qx999-bot-label {
            margin-top: 2px; color: #ffffff; font-size: 11px; font-weight: 800;
            text-shadow: 0 0 6px #000, 0 0 4px #00ff66; font-family: sans-serif;
        }

        @keyframes qx999Rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes qx999GlowPulse {
            0% {
                box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66;
                transform: scale(1);
            }
            100% {
                box-shadow: 0 0 25px #00ff66, 0 0 45px #00ff66, 0 0 10px #ffffff;
                transform: scale(1.05);
            }
        }

        #qx999-scan-laser {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            pointer-events: none; z-index: 999997; display: none;
            background: linear-gradient(to bottom, transparent 0%, rgba(0, 255, 102, 0.12) 50%, rgba(0, 255, 102, 0.4) 98%, #00ff66 100%);
            animation: qx999LaserMove 1.5s infinite linear;
        }
        @keyframes qx999LaserMove {
            0% { height: 0vh; opacity: 0.2; }
            50% { opacity: 0.8; }
            100% { height: 100vh; opacity: 0.1; }
        }
    `;
    document.head.appendChild(style);

    // Scan Laser Overlay
    let scanLaser = document.createElement('div');
    scanLaser.id = 'qx999-scan-laser';
    document.body.appendChild(scanLaser);

    // Always show Login Overlay first
    showLoginOverlay();

    function showLoginOverlay() {
        let loginOverlay = document.createElement('div');
        loginOverlay.id = 'qx999-login-overlay';
        loginOverlay.className = 'qx999-modal-overlay';
        loginOverlay.innerHTML = `
            <div class="qx999-card">
                <h3>QX999 Login</h3>
                <p>Enter password to continue</p>
                <input type="password" id="qx999-pass" class="qx999-input" placeholder="••••••••">
                <button id="qx999-login-btn" class="qx999-btn-submit">Enter</button>
            </div>
        `;
        document.body.appendChild(loginOverlay);

        document.getElementById('qx999-login-btn').onclick = function () {
            let pass = document.getElementById('qx999-pass').value;
            if (pass === licenseKey) {
                loginOverlay.remove();
                createFloatingBot();
            } else {
                alert("Wrong Password!");
            }
        };
    }

    // Settings Overlay
    function openSettingsModal() {
        if (document.getElementById('qx999-settings-overlay')) return;

        let settingsOverlay = document.createElement('div');
        settingsOverlay.id = 'qx999-settings-overlay';
        settingsOverlay.className = 'qx999-modal-overlay';
        settingsOverlay.innerHTML = `
            <div class="qx999-card" style="text-align: left;">
                <h3 style="text-align: center; margin-bottom: 18px;">QX999 Settings</h3>
                
                <label style="font-size: 12px; color: #a0aab0; display: block; margin-bottom: 6px;">Scan delay (seconds)</label>
                <input type="number" id="qx999-scan-delay" class="qx999-input" value="${scanDelay}">
                
                <label style="font-size: 12px; color: #a0aab0; display: block; margin-bottom: 6px;">After trade scan (seconds)</label>
                <p style="font-size: 11px; color: #667075; margin: -4px 0 6px 0;">0 = stop only when you tap the icon</p>
                <input type="number" id="qx999-after-trade" class="qx999-input" value="${afterTradeScan}">
                
                <label style="font-size: 12px; color: #a0aab0; display: block; margin-bottom: 8px;">Trade direction</label>
                <button class="qx999-dir-btn ${tradeDirection === 'Up' ? 'active' : ''}" data-dir="Up">Up</button>
                <button class="qx999-dir-btn ${tradeDirection === 'Down' ? 'active' : ''}" data-dir="Down">Down</button>
                <button class="qx999-dir-btn ${tradeDirection === 'Random' ? 'active' : ''}" data-dir="Random">Random</button>
                
                <button id="qx999-save-settings" class="qx999-btn-submit" style="margin-top: 10px;">Save</button>
                
                <p style="text-align: center; font-size: 11px; color: #778288; margin: 16px 0 0 0;">3 taps on icon to open · tap outside to close</p>
            </div>
        `;
        document.body.appendChild(settingsOverlay);

        let dirBtns = settingsOverlay.querySelectorAll('.qx999-dir-btn');
        dirBtns.forEach(btn => {
            btn.onclick = function () {
                dirBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                tradeDirection = this.getAttribute('data-dir');
            };
        });

        document.getElementById('qx999-save-settings').onclick = function () {
            scanDelay = parseInt(document.getElementById('qx999-scan-delay').value) || 5;
            afterTradeScan = parseInt(document.getElementById('qx999-after-trade').value) || 5;
            settingsOverlay.remove();
        };

        settingsOverlay.onclick = function (e) {
            if (e.target === settingsOverlay) {
                settingsOverlay.remove();
            }
        };
    }

    // Floating Bot
    function createFloatingBot() {
        let bot = document.createElement('div');
        bot.id = 'qx999-circle-bot';
        bot.innerHTML = `
            <div class="qx999-bot-wrapper" id="qx999-wrapper">
                <div class="qx999-scan-ring"></div>
                <div class="qx999-bot-icon" id="qx999-icon-img"></div>
            </div>
            <div class="qx999-stars">★★★★★</div>
            <div class="qx999-bot-label">QX999</div>
        `;
        document.body.appendChild(bot);

        let botWrapper = document.getElementById('qx999-wrapper');

        let isDragging = false, startX, startY, initialX, initialY;
        bot.addEventListener('touchstart', dragStart, {passive: false});
        bot.addEventListener('mousedown', dragStart);

        function dragStart(e) {
            isDragging = false;
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX; startY = clientY;
            initialX = bot.offsetLeft; initialY = bot.offsetTop;

            document.addEventListener('touchmove', dragMove, {passive: false});
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchend', dragEnd);
            document.addEventListener('mouseup', dragEnd);
        }

        function dragMove(e) {
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (Math.abs(clientX - startX) > 5 || Math.abs(clientY - startY) > 5) {
                isDragging = true;
            }
            if (isDragging) {
                if (e.cancelable) e.preventDefault();
                bot.style.left = (initialX + (clientX - startX)) + 'px';
                bot.style.top = (initialY + (clientY - startY)) + 'px';
                bot.style.right = 'auto';
            }
        }

        function dragEnd() {
            document.removeEventListener('touchmove', dragMove);
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            document.removeEventListener('mouseup', dragEnd);
        }

        bot.onclick = function () {
            if (isDragging) return;

            tapCount++;
            clearTimeout(tapTimer);

            if (tapCount === 3) {
                tapCount = 0;
                openSettingsModal();
            } else {
                tapTimer = setTimeout(() => {
                    if (tapCount === 1 && !isAnalyzing) {
                        triggerAnalysisProcess(botWrapper);
                    }
                    tapCount = 0;
                }, 350);
            }
        };
    }

    // Real-time chart analysis engine
    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot'], svg *");
            let recentCandles = Array.from(svgElements).slice(-20);

            recentCandles.forEach((el, index) => {
                let weight = index + 1;
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += (3 * weight);
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += (3 * weight);
                }
            });
        }, 30);
    }

    function triggerAnalysisProcess(botWrapper) {
        isAnalyzing = true;
        botWrapper.classList.add('scanning');
        scanLaser.style.display = 'block';

        startRealTimeAnalysis();

        setTimeout(() => {
            if (analysisTimer) clearInterval(analysisTimer);

            botWrapper.classList.remove('scanning');
            scanLaser.style.display = 'none';

            let selectedSignal = "UP";

            if (tradeDirection === "Up") {
                selectedSignal = "UP";
            } else if (tradeDirection === "Down") {
                selectedSignal = "DOWN";
            } else {
                if (redForce > greenForce) {
                    selectedSignal = "DOWN";
                } else if (greenForce > redForce) {
                    selectedSignal = "UP";
                } else {
                    selectedSignal = Math.random() > 0.5 ? "UP" : "DOWN";
                }
            }

            executeTrade(selectedSignal);
            isAnalyzing = false;
        }, scanDelay * 1000);
    }

    // Precise Trade Execution Trigger
    function executeTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"], div.button, span'));
        let targetBtn = null;

        if (direction === "UP" || direction === "Up") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                let isUpText = text.includes("Up") || text.includes("Call") || text.includes("কল") || text.includes("উপরে");
                let isUpClass = cls.includes("btn-green") || cls.includes("button-call") || cls.includes("btn-up") || cls.includes("call");
                return isUpText || isUpClass;
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                let cls = (el.className || "").toString().toLowerCase();
                let isDownText = text.includes("Down") || text.includes("Put") || text.includes("পুট") || text.includes("নিচে");
                let isDownClass = cls.includes("btn-red") || cls.includes("button-put") || cls.includes("btn-down") || cls.includes("put");
                return isDownText || isDownClass;
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }
})();
