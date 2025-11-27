// グローバル変数としてタイマー操作関数を公開するための準備
window.GameTimer = window.GameTimer || {};

let timerStringDOM;
let startTime;
let timerId = null;
let currentTimerTime = 0;

// window.onload の競合を避けるため addEventListener を使用
window.addEventListener('load', function() {
    timerStringDOM = document.getElementById('timer');
    timerStringDOM.innerHTML = '00:00:00.00';
});

function msecToSecString(time) {
    const mseconds = time % 1000;
    time = Math.trunc(time / 1000);
    const seconds = time % 60;
    const minutes = Math.trunc(time / 60);
    const hours = Math.trunc(minutes / 60);

    const msecStr = String(Math.trunc(mseconds / 10)).padStart(2, '0');
    const secondStr = String(seconds).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');

    return hoursStr + ":" + minutesStr + ":" + secondStr + "." + msecStr;
}

function UpdateTimer() {
    const nowTime = new Date().getTime();
    timerStringDOM.innerHTML = msecToSecString(nowTime - startTime);
}

// 外部から呼び出すためのスタート関数
window.GameTimer.start = function() {
    if(timerId == null) {
        startTime = new Date().getTime() - currentTimerTime;
        timerId = setInterval(UpdateTimer, 10);
    }
};

// 外部から呼び出すためのストップ関数
window.GameTimer.stop = function() {
    if(timerId != null) {
        clearInterval(timerId);
        timerId = null;
        const nowTime = new Date().getTime();
        currentTimerTime = nowTime - startTime;
        timerStringDOM.innerHTML = msecToSecString(currentTimerTime);
    }
};

// 外部から呼び出すためのリセット関数
window.GameTimer.reset = function() {
    window.GameTimer.stop();
    if(timerStringDOM) {
        timerStringDOM.innerHTML = '00:00:00.00';
    }
    currentTimerTime = 0;
};