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
            const fill = (el.getAttribute("fill") || "").toLowerCase();
            const stroke = (el.getAttribute("stroke") || "").toLowerCase();
            const cls = (el.getAttribute("class") || "").toLowerCase();

            const value = `${fill} ${stroke} ${cls}`;

            if (
                value.includes("26a69a") ||
                value.includes("00ff66") ||
                value.includes("00ff00") ||
                value.includes("green") ||
                value.includes("bull") ||
                value.includes("up") ||
                value.includes("call")
            ) {
                green++;
            }

            if (
                value.includes("ef5350") ||
                value.includes("ff0000") ||
                value.includes("red") ||
                value.includes("bear") ||
                value.includes("down") ||
                value.includes("put")
            ) {
                red++;
            }
        });

        greenForce = greenForce * 0.82 + green * 1.18;
        redForce = redForce * 0.82 + red * 1.18;

    }, 80);
}

function finishScan() {
    if (analysisTimer) {
        clearInterval(analysisTimer);
        analysisTimer = null;
    }

    scanCanvas.style.display = "none";

    if (scanAnimationId) {
        cancelAnimationFrame(scanAnimationId);
        scanAnimationId = null;
    }

    const total = greenForce + redForce;

    if (total < 5) {
        logoIcon.classList.remove("glowing");
        isScanning = false;
        return;
    }

    const difference = Math.abs(greenForce - redForce);
    const confidence = (difference / total) * 100;

    let selectedSignal = null;

    if (confidence >= 62) {
        selectedSignal =
            greenForce > redForce ? "UP" : "DOWN";
    }

    if (!selectedSignal) {
        logoIcon.classList.remove("glowing");
        isScanning = false;
        return;
    }

    executeTrade(selectedSignal);

    logoIcon.classList.remove("glowing");
    isScanning = false;
}
