(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-login', 'qx999-scan-canvas', 'qx999-settings'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    const licenseKey = "Alvi1234";
    const logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";

    let scanDurationSec = 3;
    let isConfigured = false;

    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-logo-icon {
            width:65px;
            height:65px;
            background:url('${logoUrl}') center/cover no-repeat;
            border-radius:50%;
            border:2px solid #00ff66;
            box-shadow:0 0 15px rgba(0,255,102,.4);
            transition:all .3s ease-in-out;
        }

        #qx999-logo-icon.glowing {
            box-shadow:
                0 0 35px #00ff66,
                0 0 15px #00ff66,
                inset 0 0 20px #00ff66 !important;
            transform:scale(1.08);
        }

        ::placeholder {
            color:#777;
            letter-spacing:normal;
        }
    `;
    document.head.appendChild(style);

    let isLoggedIn =
        localStorage.getItem("qx999_logged_in") === "true";

    /* LOGIN */

    const loginBox = document.createElement('div');
    loginBox.id = 'qx999-login';

    loginBox.style.cssText = `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        width:330px;
        background:#0c150e;
        border:1.5px solid #00ff66;
        color:#fff;
        padding:35px 24px 30px;
        border-radius:24px;
        box-shadow:0 0 25px rgba(0,255,102,.15);
        z-index:999999;
        font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
        text-align:center;
        display:${isLoggedIn ? 'none' : 'block'};
    `;

    loginBox.innerHTML = `
        <h3 style="
            margin:0 0 6px;
            color:#00ff66;
            font-size:24px;
            font-weight:500;
            letter-spacing:.5px;
        ">QX999 Login</h3>

        <p style="
            font-size:14px;
            color:#ccc;
            margin:0 0 25px;
        ">Enter password to continue</p>

        <input
            type="password"
            id="qx_pass"
            placeholder="••••••••"
            style="
                width:100%;
                padding:14px 16px;
                background:#070d09;
                color:#fff;
                border:1px solid #1a3322;
                border-radius:12px;
                box-sizing:border-box;
                margin-bottom:20px;
                font-size:18px;
                outline:none;
                letter-spacing:3px;
            "
        >

        <button
            id="qx_login_btn"
            style="
                width:100%;
                padding:14px;
                background:#00ff66;
                color:#000;
                border:none;
                border-radius:12px;
                font-weight:600;
                font-size:17px;
                cursor:pointer;
            "
        >Enter</button>
    `;

    document.body.appendChild(loginBox);

    /* SETTINGS */

    const settingsBox = document.createElement('div');
    settingsBox.id = 'qx999-settings';

    settingsBox.style.cssText = `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        width:310px;
        background:#0c150e;
        border:1.5px solid #00ff66;
        color:#fff;
        padding:22px;
        border-radius:20px;
        box-shadow:0 0 25px rgba(0,255,102,.15);
        z-index:999999;
        font-family:Arial,sans-serif;
        display:none;
    `;

    settingsBox.innerHTML = `
        <h3 style="
            margin:0 0 15px;
            color:#00ff66;
            font-size:18px;
            text-align:center;
        ">Bot Settings</h3>

        <label style="
            font-size:13px;
            color:#ccc;
            display:block;
            margin-bottom:5px;
        ">Analysis Delay (Sec):</label>

        <input
            type="number"
            id="qx_delay"
            value="3"
            min="1"
            style="
                width:100%;
                padding:10px;
                background:#070d09;
                color:#fff;
                border:1px solid #1a3322;
                border-radius:8px;
                box-sizing:border-box;
                margin-bottom:15px;
                outline:none;
            "
        >

        <label style="
            font-size:13px;
            color:#ccc;
            display:block;
            margin-bottom:5px;
        ">Trade Mode:</label>

        <select
            id="qx_mode"
            style="
                width:100%;
                padding:10px;
                background:#070d09;
                color:#fff;
                border:1px solid #1a3322;
                border-radius:8px;
                box-sizing:border-box;
                margin-bottom:20px;
                outline:none;
            "
        >
            <option value="AI">AI Trade</option>
        </select>

        <button
            id="qx_save_btn"
            style="
                width:100%;
                padding:12px;
                background:#00ff66;
                color:#000;
                border:none;
                border-radius:10px;
                font-weight:bold;
                font-size:15px;
                cursor:pointer;
            "
        >Save & Start</button>
    `;

    document.body.appendChild(settingsBox);

    /* BOT */

    const botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';

    botContainer.style.cssText = `
        position:fixed;
        top:120px;
        right:20px;
        display:${isLoggedIn ? 'flex' : 'none'};
        flex-direction:column;
        align-items:center;
        z-index:999999;
        cursor:move;
        user-select:none;
        touch-action:none;
    `;

    const logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    const logoText = document.createElement('span');

    logoText.style.cssText = `
        color:#fff;
        font-weight:bold;
        font-size:13px;
        margin-top:6px;
        text-shadow:0 0 8px #000,0 0 4px #00ff66;
        font-family:Arial,sans-serif;
    `;

    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    /* DRAG */

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    function dragStart(e) {
        isDragging = false;

        const clientX = e.touches
            ? e.touches[0].clientX
            : e.clientX;

        const clientY = e.touches
            ? e.touches[0].clientY
            : e.clientY;

        startX = clientX;
        startY = clientY;

        initialX = botContainer.offsetLeft;
        initialY = botContainer.offsetTop;

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive:false });
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        const clientX = e.touches
            ? e.touches[0].clientX
            : e.clientX;

        const clientY = e.touches
            ? e.touches[0].clientY
            : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
        }

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
    botContainer.addEventListener('touchstart', dragStart, { passive:true });

    /* CANVAS */

    const scanCanvas = document.createElement('canvas');
    scanCanvas.id = 'qx999-scan-canvas';

    scanCanvas.style.cssText = `
        position:fixed;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
        pointer-events:none;
        z-index:999998;
        display:none;
    `;

    document.body.appendChild(scanCanvas);

    const ctx = scanCanvas.getContext('2d');

    function resizeCanvas() {
        scanCanvas.width = window.innerWidth;
        scanCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let scanAnimationId = null;
    let scanY = 0;
    let isScanning = false;
    let scanStartTime = 0;

    /* ANALYSIS */

    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {

            let green = 0;
            let red = 0;

            const elements = document.querySelectorAll(
                "path, rect, line, polyline, [class*='candle'], [class*='plot']"
            );

            elements.forEach(el => {

                const fill =
                    (el.getAttribute('fill') || '').toLowerCase();

                const stroke =
                    (el.getAttribute('stroke') || '').toLowerCase();

                const cls =
                    (el.getAttribute('class') || '').toLowerCase();

                const value =
                    fill + ' ' + stroke + ' ' + cls;

                if (
                    value.includes('26a69a') ||
                    value.includes('00ff66') ||
                    value.includes('00ff00') ||
                    value.includes('green') ||
                    value.includes('bull') ||
                    value.includes('up') ||
                    value.includes('call')
                ) {
                    green++;
                }

                if (
                    value.includes('ef5350') ||
                    value.includes('ff0000') ||
                    value.includes('red') ||
                    value.includes('bear') ||
                    value.includes('down') ||
                    value.includes('put')
                ) {
                    red++;
                }
            });

            greenForce =
                greenForce * 0.82 + green * 1.18;

            redForce =
                redForce * 0.82 + red * 1.18;

        }, 80);
    }

    /* SKULL */

    function drawSkullShadow() {

        const cx = scanCanvas.width / 2;
        const cy = scanCanvas.height / 2;
        const size =
            Math.min(scanCanvas.width, scanCanvas.height) * 0.38;

        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.shadowColor = "rgba(0,255,102,.4)";
        ctx.shadowBlur = 20;

        ctx.beginPath();

        ctx.arc(
            cx,
            cy - size * .1,
            size * .45,
            Math.PI,
            0,
            false
        );

        ctx.lineTo(
            cx + size * .28,
            cy + size * .28
        );

        ctx.lineTo(
            cx - size * .28,
            cy + size * .28
        );

        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation =
            'destination-out';

        ctx.beginPath();

        ctx.ellipse(
            cx - size * .17,
            cy - size * .05,
            size * .12,
            size * .16,
            .1,
            0,
            Math.PI * 2
        );

        ctx.ellipse(
            cx + size * .17,
            cy - size * .05,
            size * .12,
            size * .16,
            -.1,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy + size * .06
        );

        ctx.lineTo(
            cx - size * .05,
            cy + size * .16
        );

        ctx.lineTo(
            cx + size * .05,
            cy + size * .16
        );

        ctx.closePath();
        ctx.fill();

        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(
                cx + (i * size * .08) - (size * .02),
                cy + size * .22,
                size * .035,
                size * .08
            );
        }

        ctx.restore();
    }

    /* SCAN */

    function drawSmokeScanLine() {

        const currentTime = Date.now();

        const elapsedSec =
            (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(
            0,
            0,
            scanCanvas.width,
            scanCanvas.height
        );

        drawSkullShadow();

        const trailHeight = 140;

        const grad =
            ctx.createLinearGradient(
                0,
                scanY - trailHeight,
                0,
                scanY
            );

        grad.addColorStop(
            0,
            'rgba(0,255,102,0)'
        );

        grad.addColorStop(
            .3,
            'rgba(0,255,102,.08)'
        );

        grad.addColorStop(
            .7,
            'rgba(0,255,102,.25)'
        );

        grad.addColorStop(
            1,
            'rgba(0,255,102,.6)'
        );

        ctx.fillStyle = grad;

        ctx.fillRect(
            0,
            Math.max(0, scanY - trailHeight),
            scanCanvas.width,
            trailHeight
        );

        ctx.beginPath();

        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 30;

        ctx.moveTo(0, scanY);
        ctx.lineTo(scanCanvas.width, scanY);
        ctx.stroke();

        scanY += 7;

        if (scanY > scanCanvas.height) {
            scanY = 0;
        }

        scanAnimationId =
            requestAnimationFrame(drawSmokeScanLine);
    }

    /* SIGNAL */

    function finishScan() {

        if (analysisTimer) {
            clearInterval(analysisTimer);
            analysisTimer = null;
        }

        scanCanvas.style.display = 'none';

        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }

        const total =
            greenForce + redForce;

        if (total < 5) {
            logoIcon.classList.remove('glowing');
            isScanning = false;
            return;
        }

        const difference =
            Math.abs(greenForce - redForce);

        const confidence =
            (difference / total) * 100;

        let selectedSignal = null;

        if (confidence >= 62) {
            selectedSignal =
                greenForce > redForce
                    ? "UP"
                    : "DOWN";
        }

        if (!selectedSignal) {
            logoIcon.classList.remove('glowing');
            isScanning = false;
            return;
        }

        console.log(
            "QX999:",
            selectedSignal,
            "Confidence:",
            confidence.toFixed(1) + "%"
        );

        executeTrade(selectedSignal);

        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    /* AUTO TRADE */

    function executeTrade(direction) {

        const allElements = Array.from(
            document.querySelectorAll(
                'button, div[role="button"], a, input[type="button"], div.button'
            )
        );

        let targetBtn = null;

        if (direction === "UP") {

            targetBtn = allElements.find(el => {

                const text =
                    (el.innerText ||
                    el.textContent ||
                    '').trim().toLowerCase();

                const cls =
                    (el.className || '')
                    .toString()
                    .toLowerCase();

                return (
                    text.includes('up') ||
                    text.includes('call') ||
                    text.includes('কল') ||
                    cls.includes('btn-green') ||
                    cls.includes('button-call') ||
                    cls.includes('btn-up') ||
                    cls.includes('call')
                );
            });

        } else {

            targetBtn = allElements.find(el => {

                const text =
                    (el.innerText ||
                    el.textContent ||
                    '').trim().toLowerCase();

                const cls =
                    (el.className || '')
                    .toString()
                    .toLowerCase();

                return (
                    text.includes('down') ||
                    text.includes('put') ||
                    text.includes('পুট') ||
                    cls.includes('btn-red') ||
                    cls.includes('button-put') ||
                    cls.includes('btn-down') ||
                    cls.includes('put')
                );
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    /* LOGIN */

    document.getElementById('qx_login_btn').onclick =
        function () {

            const inputPass =
                document.getElementById('qx_pass').value;

            if (inputPass === licenseKey) {

                localStorage.setItem(
                    "qx999_logged_in",
                    "true"
                );

                loginBox.remove();

                botContainer.style.display =
                    'flex';
            }
        };

    /* SETTINGS */

    document.getElementById('qx_save_btn').onclick =
        function () {

            const delayInput =
                parseInt(
                    document.getElementById('qx_delay').value,
                    10
                );

            if (
                !isNaN(delayInput) &&
                delayInput > 0
            ) {
                scanDurationSec =
                    delayInput;
            }

            settingsBox.style.display =
                'none';

            isConfigured = true;
        };

    /* BOT CLICK */

    botContainer.addEventListener(
        'click',
        function () {

            if (isDragging) return;

            if (!isConfigured) {
                settingsBox.style.display =
                    'block';
                return;
            }

            if (isScanning) return;

            isScanning = true;

            logoIcon.classList.add(
                'glowing'
            );

            scanCanvas.style.display =
                'block';

            scanY = 0;
            scanStartTime = Date.now();

            startRealTimeAnalysis();
            drawSmokeScanLine();
        }
    );

})();
