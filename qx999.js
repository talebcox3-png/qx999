(function () {
    ['qx999-circle-bot', 'qx999-panel', 'qx999-scan-canvas'].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.remove();
    });

    let logoUrl = "https://i.ibb.co/35vKSFyz/image.jpg";
    let scanDurationSec = 3; 
    let greenForce = 0;
    let redForce = 0;
    let analysisTimer = null;

    const style = document.createElement('style');
    style.innerHTML = `
        #qx999-logo-icon {
            width: 65px; height: 65px;
            background: url('${logoUrl}') center/cover no-repeat;
            border-radius: 50%;
            border: 2px solid #00ff66;
            box-shadow: 0 0 15px rgba(0, 255, 102, 0.4);
            transition: all 0.3s ease-in-out;
        }
        #qx999-logo-icon.glowing {
            box-shadow: 0 0 35px #00ff66, 0 0 15px #00ff66, inset 0 0 20px #00ff66 !important;
            transform: scale(1.08);
        }
    `;
    document.head.appendChild(style);

    // Floating Bot Icon
    let botContainer = document.createElement('div');
    botContainer.id = 'qx999-circle-bot';
    botContainer.style.cssText = `
        position: fixed; top: 120px; right: 20px;
        display: flex; flex-direction: column; align-items: center;
        z-index: 999999; cursor: move; user-select: none;
        touch-action: none;
    `;

    let logoIcon = document.createElement('div');
    logoIcon.id = 'qx999-logo-icon';

    let logoText = document.createElement('span');
    logoText.style.cssText = `
        color: #ffffff; font-weight: bold; font-size: 13px; margin-top: 6px;
        text-shadow: 0 0 8px #000, 0 0 4px #00ff66; font-family: Arial, sans-serif;
    `;
    logoText.innerText = "QX999";

    botContainer.appendChild(logoIcon);
    botContainer.appendChild(logoText);
    document.body.appendChild(botContainer);

    // Drag Logic
    let isDragging = false, startX, startY, initialX, initialY;
    
    function dragStart(e) {
        isDragging = false;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        initialX = botContainer.offsetLeft;
        initialY = botContainer.offsetTop;
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let dx = clientX - startX;
        let dy = clientY - startY;
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

    // Scan Canvas & Smoke Animation
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

    let scanAnimationId = null, scanY = 0, isScanning = false, scanStartTime = 0;

    function startRealTimeAnalysis() {
        greenForce = 0;
        redForce = 0;

        analysisTimer = setInterval(() => {
            let svgElements = document.querySelectorAll("path, rect, [class*='candle'], [class*='plot']");
            svgElements.forEach(el => {
                let fill = el.getAttribute('fill') || el.style.fill || el.getAttribute('stroke') || el.style.stroke || '';
                let className = (el.getAttribute('class') || '').toLowerCase();

                if (fill.includes('0, 255') || fill.includes('00ff') || fill.includes('26a69a') || className.includes('green') || className.includes('up')) {
                    greenForce += 2;
                } else if (fill.includes('255, 0') || fill.includes('ff00') || fill.includes('ef5350') || className.includes('red') || className.includes('down')) {
                    redForce += 2;
                }
            });
        }, 40);
    }

    function drawSkullShadow() {
        let cx = scanCanvas.width / 2;
        let cy = scanCanvas.height / 2;
        let size = Math.min(scanCanvas.width, scanCanvas.height) * 0.38;

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.shadowColor = "rgba(0, 255, 102, 0.4)";
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.1, size * 0.45, Math.PI, 0, false);
        ctx.lineTo(cx + size * 0.28, cy + size * 0.28);
        ctx.lineTo(cx - size * 0.28, cy + size * 0.28);
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.ellipse(cx - size * 0.17, cy - size * 0.05, size * 0.12, size * 0.16, 0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + size * 0.17, cy - size * 0.05, size * 0.12, size * 0.16, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.06);
        ctx.lineTo(cx - size * 0.05, cy + size * 0.16);
        ctx.lineTo(cx + size * 0.05, cy + size * 0.16);
        ctx.closePath();
        ctx.fill();

        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(cx + (i * size * 0.08) - (size * 0.02), cy + size * 0.22, size * 0.035, size * 0.08);
        }

        ctx.restore();
    }

    function drawSmokeScanLine() {
        let currentTime = Date.now();
        let elapsedSec = (currentTime - scanStartTime) / 1000;

        if (elapsedSec >= scanDurationSec) {
            finishScan();
            return;
        }

        ctx.clearRect(0, 0, scanCanvas.width, scanCanvas.height);
        drawSkullShadow();

        let trailHeight = 140;
        let grad = ctx.createLinearGradient(0, scanY - trailHeight, 0, scanY);
        grad.addColorStop(0, 'rgba(0, 255, 102, 0)');
        grad.addColorStop(0.3, 'rgba(0, 255, 102, 0.08)');
        grad.addColorStop(0.7, 'rgba(0, 255, 102, 0.25)');
        grad.addColorStop(1, 'rgba(0, 255, 102, 0.6)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, Math.max(0, scanY - trailHeight), scanCanvas.width, trailHeight);

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

        scanAnimationId = requestAnimationFrame(drawSmokeScanLine);
    }

    function finishScan() {
        if (analysisTimer) clearInterval(analysisTimer);
        scanCanvas.style.display = 'none';
        if (scanAnimationId) {
            cancelAnimationFrame(scanAnimationId);
            scanAnimationId = null;
        }
        
        let selectedSignal = greenForce >= redForce ? "UP" : "DOWN";
        executeTrade(selectedSignal);

        logoIcon.classList.remove('glowing');
        isScanning = false;
    }

    // Direct Auto-Click Execution
    function executeTrade(direction) {
        let allButtons = Array.from(document.querySelectorAll('button, div[role="button"], a, input[type="button"]'));
        let targetBtn = null;

        if (direction === "UP") {
            targetBtn = allButtons.find(b => {
                let text = (b.innerText || b.textContent || "").trim();
                let cls = (b.className || "").toString().toLowerCase();
                return (text.includes("Up") || text.includes("Call") || cls.includes("button-call") || cls.includes("btn-up") || cls.includes("call"));
            });
        } else {
            targetBtn = allButtons.find(b => {
                let text = (b.innerText || b.textContent || "").trim();
                let cls = (b.className || "").toString().toLowerCase();
                return (text.includes("Down") || text.includes("Put") || cls.includes("button-put") || cls.includes("btn-down") || cls.includes("put"));
            });
        }

        if (targetBtn) {
            targetBtn.click();
        }
    }

    botContainer.addEventListener('click', function () {
        if (isDragging || isScanning) return;

        isScanning = true;
        logoIcon.classList.add('glowing');
        scanCanvas.style.display = 'block';
        scanY = 0;
        scanStartTime = Date.now();
        startRealTimeAnalysis();
        drawSmokeScanLine();
    });
})();
