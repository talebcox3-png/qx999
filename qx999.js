(function () {
    ['qx999-circle-bot', 'qx999-login'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "Alvi1234";
    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";

    let isLoggedIn = localStorage.getItem("qx999_logged_in") === "true";
    let isAnalyzing = false;

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 300px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 25px 20px; border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,255,102,0.2); z-index: 999999;
        font-family: sans-serif; text-align: center; display: ${isLoggedIn ? 'none' : 'block'};
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#00ff66; font-size:20px;">QX999 3-Sec SureShot</h3>
        <p style="font-size:12px; color:#ccc; margin:0 0 15px 0;">Enter License Password</p>
        <input type="password" id="qx_pass" placeholder="••••••••" style="width:100%; padding:10px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:8px; margin-bottom:12px; font-size:15px; outline:none; text-align:center;">
        <button id="qx_login_btn" style="width:100%; padding:10px; background:#00ff66; color:#000; border:none; border-radius:8px; font-weight:bold; font-size:15px; cursor:pointer;">Activate Bot</button>
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
    logoIcon.style.cssText = `
        width: 65px; height: 65px;
        background: url('${logoUrl}') center/cover no-repeat;
        border-radius: 50%; border: 2.5px solid #00ff66;
        box-shadow: 0 0 15px rgba(0, 255, 102, 0.5);
        display: flex; align-items: center; justify-content: center;
        color: #00ff66; font-weight: bold; font-size: 22px; font-family: sans-serif;
        text-shadow: 0 0 5px #000;
    `;

    let logoText = document.createElement('span');
    logoText.id = 'qx999-btn-label';
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 11px; margin-top: 5px;
        text-shadow: 0 0 6px #000, 0 0 4px #00ff66; font-family: sans-serif;
    `;
    logoText.innerText = "TAP FOR 3S";

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

    function analyzeMarket() {
        let greenCount = 0;
        let redCount = 0;

        let elements = document.querySelectorAll("path, rect");
        elements.forEach(el => {
            if (el.closest('#qx999-circle-bot') || el.closest('#qx999-login')) return;
            let fill = (el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || '').toLowerCase();

            if (fill.includes('26a69a') || fill.includes('00e676') || fill.includes('0, 255')) greenCount++;
            else if (fill.includes('ef5350') || fill.includes('ff5252') || fill.includes('255, 0')) redCount++;
        });

        return greenCount >= redCount ? "UP" : "DOWN";
    }

    function triggerTrade(signal) {
        let callButtons = document.querySelectorAll('.btn-call, button.call, div[class*="call"], .button-up, button[class*="up"]');
        let putButtons = document.querySelectorAll('.btn-put, button.put, div[class*="put"], .button-down, button[class*="down"]');

        let target = null;
        if (signal === "UP") {
            target = Array.from(callButtons).find(el => !el.closest('#qx999-circle-bot'));
        } else {
            target = Array.from(putButtons).find(el => !el.closest('#qx999-circle-bot'));
        }

        if (!target) {
            let allBtns = Array.from(document.querySelectorAll('button, div[role="button"]'));
            target = allBtns.find(b => {
                if (b.closest('#qx999-circle-bot') || b.closest('#qx999-login')) return false;
                let text = (b.innerText || b.textContent || "").toLowerCase().trim();
                return signal === "UP" ? (text === "call" || text === "up") : (text === "put" || text === "down");
            });
        }

        if (target) {
            target.click();
        }
    }

    function start3SecAnalysis() {
        if (isAnalyzing) return;
        isAnalyzing = true;

        let timeLeft = 3;
        logoIcon.innerText = timeLeft;
        logoText.innerText = "ANALYZING...";

        let timer = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                logoIcon.innerText = timeLeft;
            } else {
                clearInterval(timer);
                
                let finalSignal = analyzeMarket();
                triggerTrade(finalSignal);

                logoIcon.innerText = "✓";
                logoText.innerText = finalSignal + " PLACED!";

                setTimeout(() => {
                    logoIcon.innerText = "";
                    logoText.innerText = "TAP FOR 3S";
                    isAnalyzing = false;
                }, 1200);
            }
        }, 1000);
    }

    document.getElementById('qx_login_btn').onclick = function () {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_logged_in", "true");
            loginBox.style.display = 'none';
            botContainer.style.display = 'flex';
        }
    };

    botContainer.addEventListener('click', function () {
        if (isDragging || isAnalyzing) return;
        start3SecAnalysis();
    });
})();
