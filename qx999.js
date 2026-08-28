(function () {
    ['qx999-circle-bot', 'qx999-login', 'qx999-style'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";

    const style = document.createElement('style');
    style.id = 'qx999-style';
    style.innerHTML = `
        @keyframes qxGlow {
            0% { box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66, inset 0 0 15px #00ff66; transform: scale(1); }
            50% { box-shadow: 0 0 25px #00ff66, 0 0 50px #00ff66, inset 0 0 25px #00ff66; transform: scale(1.08); }
            100% { box-shadow: 0 0 10px #00ff66, 0 0 20px #00ff66, inset 0 0 15px #00ff66; transform: scale(1); }
        }
        @keyframes qxScanPulse {
            0% { box-shadow: 0 0 0 0px rgba(0, 255, 102, 0.8); }
            100% { box-shadow: 0 0 0 80px rgba(0, 255, 102, 0); }
        }
        .qx-analyzing {
            animation: qxGlow 1s infinite ease-in-out, qxScanPulse 1.2s infinite linear !important;
        }
    `;
    document.head.appendChild(style);

    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";
    let isAnalyzing = false;

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 300px; background: rgba(12, 21, 14, 0.95); border: 1.5px solid #00ff66;
        color: #ffffff; padding: 25px 20px; border-radius: 15px;
        box-shadow: 0 0 30px rgba(0,255,102,0.3); z-index: 999999;
        font-family: sans-serif; text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
        backdrop-filter: blur(10px);
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#00ff66; font-size:22px; font-weight:bold;">QX999 Login</h3>
        <p style="font-size:12px; color:#ccc; margin:0 0 15px 0;">Enter password to continue</p>
        <input type="password" id="qx_pass" placeholder="••••••••" style="width:100%; padding:12px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; margin-bottom:15px; font-size:16px; outline:none; text-align:center; box-sizing:border-box;">
        <button id="qx_login_btn" style="width:100%; padding:12px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 140px; right: 20px;
        display: ${isLoggedIn ? 'flex' : 'none'}; flex-direction: column; align-items: center;
        z-index: 999999; cursor: pointer; user-select: none; touch-action: none;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-icon-main';
    logoIcon.style.cssText = `
        width: 65px; height: 65px;
        background: url('${logoUrl}') center/cover no-repeat;
        border-radius: 50%; border: 2.5px solid #00ff66;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.6);
        display: flex; align-items: center; justify-content: center;
        color: #ffffff; font-weight: bold; font-size: 24px; font-family: sans-serif;
        text-shadow: 0 0 8px #000; transition: all 0.3s ease;
    `;

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 12px; margin-top: 6px;
        text-shadow: 0 0 6px #000, 0 0 4px #00ff66; font-family: sans-serif;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
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

    function analyzeCandleMomentum() {
        let greenScore = 0;
        let redScore = 0;

        let elements = document.querySelectorAll("path, rect");
        elements.forEach(el => {
            if (el.closest('#qx999-circle-bot') || el.closest('#qx999-login')) return;
            let fill = (el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || '').toLowerCase();

            if (fill.includes('26a69a') || fill.includes('00e676') || fill.includes('0, 255')) greenScore++;
            else if (fill.includes('ef5350') || fill.includes('ff5252') || fill.includes('255, 0')) redScore++;
        });

        return greenScore >= redScore ? "UP" : "DOWN";
    }

    function executeTrade(signal) {
        let targetButton = null;

        if (signal === "UP") {
            targetButton = document.querySelector('.btn-call, button.call, div[class*="call"], .button-up, button[class*="up"]') ||
                           Array.from(document.querySelectorAll('button, div[role="button"], div')).find(el => {
                               if (el.closest('#qx999-circle-bot') || el.closest('#qx999-login')) return false;
                               let txt = (el.innerText || el.textContent || "").trim().toLowerCase();
                               return txt === "up" || txt.includes("call");
                           });
        } else {
            targetButton = document.querySelector('.btn-put, button.put, div[class*="put"], .button-down, button[class*="down"]') ||
                           Array.from(document.querySelectorAll('button, div[role="button"], div')).find(el => {
                               if (el.closest('#qx999-circle-bot') || el.closest('#qx999-login')) return false;
                               let txt = (el.innerText || el.textContent || "").trim().toLowerCase();
                               return txt === "down" || txt.includes("put");
                           });
        }

        if (targetButton) {
            targetButton.click();
            let eventOptions = { bubbles: true, cancelable: true, view: window };
            targetButton.dispatchEvent(new MouseEvent('mousedown', eventOptions));
            targetButton.dispatchEvent(new MouseEvent('mouseup', eventOptions));
            targetButton.dispatchEvent(new MouseEvent('click', eventOptions));
            targetButton.dispatchEvent(new TouchEvent('touchstart', eventOptions));
            targetButton.dispatchEvent(new TouchEvent('touchend', eventOptions));
        }
    }

    function startAnalysis() {
        if (isAnalyzing) return;
        isAnalyzing = true;

        logoIcon.classList.add('qx-analyzing');
        let timeLeft = 3;
        logoIcon.innerText = timeLeft;

        let interval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                logoIcon.innerText = timeLeft;
            } else {
                clearInterval(interval);
                
                let signal = analyzeCandleMomentum();
                executeTrade(signal);

                logoIcon.classList.remove('qx-analyzing');
                logoIcon.innerText = "✓";
                logoText.innerText = signal + " PLACED!";

                setTimeout(() => {
                    logoIcon.innerText = "";
                    logoText.innerText = "QX999";
                    isAnalyzing = false;
                }, 1200);
            }
        }, 1000);
    }

    document.getElementById('qx_login_btn').onclick = function () {
        let pass = document.getElementById('qx_pass').value;
        if (pass === licenseKey) {
            localStorage.setItem("qx999_logged_in", "true");
            loginBox.style.display = 'none';
            botContainer.style.display = 'flex';
        }
    };

    botContainer.addEventListener('click', function () {
        if (isDragging || isAnalyzing) return;
        startAnalysis();
    });
})();
