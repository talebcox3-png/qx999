(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    
    let scanDelay = 5;
    let afterTradeScan = 5;
    let selectedDirection = "Random";

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background: url('${logoUrl}') center/cover no-repeat;
            border-radius: 50%;
            border: 2px solid #00ff66;
            box-shadow: 0 0 15px rgba(0, 255, 102, 0.5);
            transition: transform 0.1s ease-in-out;
            cursor: pointer;
        }
        #qx999-logo-icon:active {
            transform: scale(0.92);
        }
        .qx-input {
            width: 100%; padding: 12px; background: #080d0a; color: #fff;
            border: 1px solid #1c3524; border-radius: 10px; box-sizing: border-box;
            margin-bottom: 15px; font-size: 15px; outline: none;
        }
        .qx-btn-dir {
            width: 100%; padding: 12px; background: #0c1810; color: #ffffff;
            border: 1px solid #1c3524; border-radius: 10px; margin-bottom: 10px;
            font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s;
        }
        .qx-btn-dir.active {
            background: #00ff66 !important; color: #000000 !important; border-color: #00ff66 !important;
        }
        #qx-settings-trigger {
            background: rgba(0, 255, 102, 0.2); color: #00ff66; border: 1px solid #00ff66;
            padding: 3px 8px; font-size: 10px; font-weight: bold; border-radius: 5px;
            margin-top: 4px; cursor: pointer; text-transform: uppercase;
        }
    `;
    document.head.appendChild(style);

    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #09130c; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 25px 20px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,255,102,0.2); z-index: 999999;
        font-family: Arial, sans-serif; text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
    `;
    loginBox.innerHTML = `
        <h2 style="margin:0 0 5px 0; color:#00ff66; font-size:22px; font-weight:bold;">QX999 Login</h2>
        <p style="font-size:13px; color:#aaa; margin:0 0 20px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" class="qx-input" placeholder="••••••••" style="letter-spacing:3px; text-align:center;">
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:16px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';
    settingsBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 320px; background: #08110a; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 22px; border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,255,102,0.2); z-index: 999999;
        font-family: Arial, sans-serif; display: none;
    `;
    settingsBox.innerHTML = `
        <h3 style="margin:0 0 15px 0; color:#00ff66; font-size:20px; text-align:center; font-weight:bold;">QX999 Settings</h3>
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:6px;">Scan delay (seconds)</label>
        <input type="number" id="qx_scan_delay" class="qx-input" value="5">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:4px;">After trade scan (seconds)</label>
        <span style="font-size:11px; color:#777; display:block; margin-bottom:6px;">0 = stop only when you tap the icon</span>
        <input type="number" id="qx_after_scan" class="qx-input" value="5">
        
        <label style="font-size:13px; color:#ccc; display:block; margin-bottom:8px;">Trade direction</label>
        <button id="dir_up" class="qx-btn-dir">Up</button>
        <button id="dir_down" class="qx-btn-dir">Down</button>
        <button id="dir_random" class="qx-btn-dir active">Random</button>
        
        <button id="qx_save_btn" style="width:100%; padding:14px; background:#00ff66; color:#000; border:none; border-radius:12px; font-weight:bold; font-size:16px; margin-top:10px; cursor:pointer;">Save</button>
    `;
    document.body.appendChild(settingsBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 140px; right: 20px;
        display: ${isLoggedIn ? 'flex' : 'none'}; flex-direction: column; align-items: center;
        z-index: 999999; user-select: none; touch-action: none;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let settingsBtn = document.createElement('button');
    settingsBtn.id = 'qx-settings-trigger';
    settingsBtn.innerText = "Settings";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(settingsBtn);
    document.body.appendChild(botContainer);

    let isDragging = false, startX, startY, initialX, initialY;
    function dragStart(e) {
        isDragging = false;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        initialX = botContainer.offsetLeft; initialY = botContainer.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }
    function dragMove(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX; let dy = clientY - startY;
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

    ['dir_up', 'dir_down', 'dir_random'].forEach(id => {
        document.getElementById(id).onclick = function () {
            document.querySelectorAll('.qx-btn-dir').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedDirection = this.innerText;
        };
    });

    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_logged_in", "true");
            loginBox.style.display = 'none';
            botContainer.style.display = 'flex';
        }
    };

    document.getElementById('qx_save_btn').onclick = function () {
        scanDelay = parseInt(document.getElementById('qx_scan_delay').value) || 5;
        afterTradeScan = parseInt(document.getElementById('qx_after_scan').value) || 5;
        settingsBox.style.display = 'none';
    };

    settingsBtn.onclick = function (e) {
        e.stopPropagation();
        settingsBox.style.display = 'block';
    };

    window.addEventListener('click', function (e) {
        if (settingsBox.style.display === 'block' && !settingsBox.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsBox.style.display = 'none';
        }
    });

    function fireClick(element) {
        if (!element) return;
        let opts = { bubbles: true, cancelable: true, view: window };
        element.dispatchEvent(new PointerEvent('pointerdown', opts));
        element.dispatchEvent(new MouseEvent('mousedown', opts));
        element.dispatchEvent(new PointerEvent('pointerup', opts));
        element.dispatchEvent(new MouseEvent('mouseup', opts));
        element.dispatchEvent(new MouseEvent('click', opts));
        if (typeof element.click === 'function') element.click();
    }

    function analyzeChartCandles() {
        let greenScore = 0;
        let redScore = 0;
        let svgElements = document.querySelectorAll("path, rect, circle, g");

        svgElements.forEach(el => {
            if (el.closest('#qx999-circle-bot') || el.closest('#qx999-settings') || el.closest('#qx999-login')) return;
            let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
            let cls = (el.getAttribute('class') || '').toLowerCase();

            if (fill.includes('26a69a') || fill.includes('00e676') || fill.includes('0, 255') || cls.includes('green') || cls.includes('up')) {
                greenScore += 5;
            } else if (fill.includes('ef5350') || fill.includes('ff5252') || fill.includes('255, 0') || cls.includes('red') || cls.includes('down')) {
                redScore += 5;
            }
        });

        return greenScore >= redScore ? "Up" : "Down";
    }

    function executeTrade() {
        let finalDirection = selectedDirection;

        if (finalDirection === "Random") {
            finalDirection = analyzeChartCandles();
        }

        let targetBtn = null;
        let allElements = Array.from(document.querySelectorAll('button, div, a, span'));

        targetBtn = allElements.find(el => {
            if (el.closest('#qx999-circle-bot') || el.closest('#qx999-settings')) return false;
            let text = (el.innerText || el.textContent || "").trim();
            if (finalDirection === "Up") {
                return (text === "Up" || text === "UP" || text.startsWith("Up\n")) && el.children.length <= 2;
            } else {
                return (text === "Down" || text === "DOWN" || text.startsWith("Down\n")) && el.children.length <= 2;
            }
        });

        if (!targetBtn) {
            if (finalDirection === "Up") {
                targetBtn = document.querySelector('.button-call, .btn-call, [class*="call"], [class*="green"]');
            } else {
                targetBtn = document.querySelector('.button-put, .btn-put, [class*="put"], [class*="red"]');
            }
        }

        if (targetBtn) {
            fireClick(targetBtn);
        } else {
            let screenW = window.innerWidth;
            let screenH = window.innerHeight;
            let posX = finalDirection === "Up" ? screenW * 0.25 : screenW * 0.75;
            let posY = screenH * 0.84;

            let pointEl = document.elementFromPoint(posX, posY);
            if (pointEl) fireClick(pointEl);
        }
    }

    // SINGLE TAP ON LOGO EXECUTES TRADE DIRECTLY
    logoIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isDragging) return;
        executeTrade();
    });
})();
