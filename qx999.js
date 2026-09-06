(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let licenseKey = "ALVI5S-HECK";
    let logoUrl = "https://i.ibb.co.com/bMmtq310/1000324296-photoaidcom-cropped.png";
    let scanDurationSec = 3; 
    let isScanning = false;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-circle-bot {
            position: fixed; top: 120px; right: 20px;
            display: flex; flex-direction: column; align-items: center;
            z-index: 999999; cursor: move; user-select: none; touch-action: none;
        }
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background: url('${logoUrl}') center/cover no-repeat;
            border-radius: 50%;
            /* এখানে কালো শ্যাডো একদম বড় এবং গাঢ় করা হয়েছে ভিডিওর মতো করে */
            box-shadow: 0 0 25px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 1);
            background-color: transparent;
            border: 2px solid rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease-in-out;
        }
        #qx999-logo-icon.glowing {
            box-shadow: 0 0 35px rgba(0, 255, 102, 0.8), 0 0 60px rgba(0, 0, 0, 0.9) !important;
            transform: scale(1.08);
        }
        ::placeholder {
            color: #777777;
            letter-spacing: normal;
        }
    `;
    document.head.appendChild(style);

    // অটো লগইন চেক: প্রথমবার দেওয়ার পর থেকে সবসময় বক্স দেখাবে এবং পাসওয়ার্ড সেভ বা শিল্ড হয়ে থাকবে
    let savedPass = localStorage.getItem("qx999_saved_pass") || licenseKey;

    let loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';
    loginBox.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 330px; background: #0c150e; border: 1.5px solid #00ff66;
        color: #ffffff; padding: 35px 24px 30px 24px; border-radius: 24px;
        box-shadow: 0 0 25px rgba(0,255,102,0.15); z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: center; display: block;
    `;
    loginBox.innerHTML = `
        <h3 style="margin:0 0 6px 0; color:#00ff66; font-size:24px; font-weight:500; letter-spacing:0.5px;">QX999 Login</h3>
        <p style="font-size:14px; color:#cccccc; margin:0 0 25px 0; font-weight:400;">Enter password to continue</p>
        <input type="password" id="qx_pass" value="${savedPass}" placeholder="••••••••" style="width:100%; padding:14px 16px; background:#070d09; color:#fff; border:1px solid #1a3322; border-radius:12px; box-sizing:border-box; margin-bottom:20px; font-size:18px; outline:none; letter-spacing:3px;-webkit-text-security:disc;">
        <button id="qx_login_btn" style="width:100%; padding:14px; background:#00ff66; color:#000000; border:none; border-radius:12px; font-weight:600; font-size:17px; cursor:pointer;">Enter</button>
    `;
    document.body.appendChild(loginBox);

    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.display = 'none'; // প্রথমে লগইন বক্সের কারণে বট হাই থাকবে

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 13px; margin-top: 6px;
        text-shadow: 0 0 8px #000, 0 0 4px #00ff66; font-family: Arial, sans-serif;
        background: #0b0e14; padding: 1px 6px; border-radius: 4px; border: 1px solid #00ff66;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    let isDragging = false, startX, startY, initialX, initialY;
    
    botContainer.addEventListener('pointerdown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        initialX = botContainer.offsetLeft;
        initialY = botContainer.offsetTop;
        botContainer.setPointerCapture(e.pointerId);
    });

    botContainer.addEventListener('pointermove', (e) => {
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
        botContainer.style.left = (initialX + dx) + 'px';
        botContainer.style.top = (initialY + dy) + 'px';
        botContainer.style.right = 'auto';
    });

    // অ্যানালাইসিস স্ক্যান ক্যানভাস - z-index এমনভাবে দেওয়া হয়েছে যাতে এটি স্ক্রিনের উপর দিয়ে পাস হয়
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

    let scanAnimationId = null, scanY = 0, scanStartTime = 0;

    function drawScanLine() {
        let elapsedSec = (Date.now() - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);

        let grad = ctx.createLinearGradient(0, scanY - 120, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.15)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.75)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - 120), scanCanvas.width, 120);

        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 25;
        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 12;
        if (scanY > scanCanvas.height) scanY = 0;

        scanAnimationId = requestAnimationFrame(drawScanLine);
    }

    function finishScan() {
        scanCanvas.style.display = 'none';
        if (scanAnimationId) cancelAnimationFrame(scanAnimationId);
        
        logoIcon.classList.remove('glowing');
        isScanning = false;

        let direction = Math.random() > 0.5 ? "UP" : "DOWN";
        executeAutoTrade(direction);
    }

    function executeAutoTrade(direction) {
        let allElements = Array.from(document.querySelectorAll('button, div[role="button"], a'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                return text.includes("Up") || text.includes("Call") || text.includes("Higher");
            });
        } else {
            targetBtn = allElements.find(el => {
                let text = (el.innerText || el.textContent || "").trim();
                return text.includes("Down") || text.includes("Put") || text.includes("Lower");
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    // এন্টার প্রেস করলে বা বাটন ক্লিক করলে লগইন হবে এবং পাসওয়ার্ড সেভ হয়ে থাকবে
    function handleLogin() {
        let inputPass = document.getElementById('qx_pass').value;
        if (inputPass === licenseKey) {
            localStorage.setItem("qx999_saved_pass", inputPass);
            loginBox.style.display = 'none';
            botContainer.style.display = 'flex';
        } else {
            alert("Incorrect Password!");
        }
    }

    document.getElementById('qx_login_btn').onclick = handleLogin;
    document.getElementById('qx_pass').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // যদি আগে থেকেই পাসওয়ার্ড সেভ থাকে, তবুও রিলোড দিলে লগইন বক্স দেখাবে কিন্তু পাসওয়ার্ড টাইপ করা ও শিল্ড করা অবস্থায় থাকবে
    if (savedPass === licenseKey) {
        loginBox.style.display = 'block';
        botContainer.style.display = 'none';
    }

    botContainer.onclick = function () {
        if (isDragging) return;
        if (isScanning) return;

        isScanning = true;
        logoIcon.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        drawScanLine();
    };
})();
