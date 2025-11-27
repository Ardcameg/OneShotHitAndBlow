// 設定定数
const NUM_DIGITS = 4;
const AUTORESET_DELAY = 1250; // 失敗時のリセット待ち時間(ms)

// ゲーム状態変数
let secretNumber = [];
let isTimerStarted = false; // タイマーが既に動いているか
let isGameLocked = false; // 判定中・リセット待ち中に操作をブロックするフラグ
let autoResetTimeout = null; // 自動リセットのタイマーID保持用

// DOM要素
let messageArea;
let inputElement;
let submitButton;
let historyList;
let abortButton;
let restartButton;

window.addEventListener('load', function() {
    // 要素の取得
    messageArea = document.getElementById('message-area');
    inputElement = document.getElementById('user-input');
    submitButton = document.getElementById('submit-button');
    historyList = document.getElementById('history-list');
    abortButton = document.getElementById('abort-button'); // 追加
    restartButton = document.getElementById('restart-button'); // 追加

    // 入力制限 (数字のみ)
    inputElement.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
    });

    // Enterキー対応
    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });

    // ボタンイベントリスナー
    submitButton.addEventListener('click', handleSubmit);
    abortButton.addEventListener('click', abortGame); // 追加
    restartButton.addEventListener('click', fullResetGame); // 追加

    // ゲーム初期化（最初はタイマーを動かさない）
    initGame();
});

// 秘密の数字生成
function generateSecretNumber() {
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    // シャッフル
    for (let i=digits.length-1;i>0;i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    secretNumber = digits.slice(0, NUM_DIGITS);
    console.log('Secret:', secretNumber.join('')); // デバッグ用
}

/**
 * ゲームのラウンド初期化（失敗時の自動リセット用）
 * タイマーはリセットせず維持する
 */
function initGame() {
    generateSecretNumber();
    inputElement.value = '';
    historyList.innerHTML = ''; 
    
    isGameLocked = false;
    
    submitButton.classList.remove('btn-disabled');
    // inputはdisabledプロパティのままでOK
    inputElement.disabled = false;
    inputElement.focus();
    
    if (isTimerStarted) {
        updateMessage("Next Game Start! Guess again.", "message-info");
        abortButton.style.display = 'inline-block';
        restartButton.style.display = 'none';
    } else {
        updateMessage("Enter 4 digits to start timer.", "message-default");
        abortButton.style.display = 'none';
        restartButton.style.display = 'none';
    }
}

/**
 * 完全リセット（リスタートボタン用）
 * タイマーも履歴も全てリセットして初期状態に戻す
 */
function fullResetGame() {
    // もし自動リセット待ちならキャンセル
    if (autoResetTimeout) {
        clearTimeout(autoResetTimeout);
        autoResetTimeout = null;
    }

    // タイマーリセット
    window.GameTimer.reset();
    isTimerStarted = false;

    // ゲーム初期化
    initGame();
}

/**
 * 中止・ギブアップ処理
 */
function abortGame() {
    if (!isTimerStarted || isGameLocked) return;

    window.GameTimer.stop();
    isGameLocked = true;

    const secretStr = secretNumber.join('');
    updateMessage(`GIVE UP... Answer was ${secretStr}`, 'message-error');

    // クラスを追加して見た目を無効化
    submitButton.classList.add('btn-disabled');
    
    inputElement.disabled = true;
    abortButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
}

// 判定ロジック
function checkGuess(guessArray, secretArray) {
    let hit = 0;
    let blow = 0;
    for (let i=0;i<NUM_DIGITS; i++) {
        const guessDigit = guessArray[i];
        const secretIndex = secretArray.indexOf(guessDigit);
        if (secretIndex === i) {
            hit++;
        } else if (secretIndex !== -1) {
            blow++;
        }
    }
    return { hit, blow };
}

// メッセージ更新
function updateMessage(text, className) {
    messageArea.textContent = text;
    messageArea.className = className;
}

// 履歴追加
function addHistory(guess, hit, blow) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="history-guess">${guess}</span>
        <span class="history-result">
            <span class="res-h">${hit}H</span> / <span class="res-b">${blow}B</span>
        </span>
    `;
    historyList.prepend(li);
}

// 送信処理
function handleSubmit() {
    // ゲームロック中にボタンが押されたら揺らす
    if (isGameLocked) {
        // 連打対応：クラスを一旦外して強制的に再描画させる
        submitButton.classList.remove('shake');
        void submitButton.offsetWidth; // リフロー（再描画）の強制
        submitButton.classList.add('shake');
        
        // アニメーションが終わる頃にクラスを外す
        setTimeout(() => {
            submitButton.classList.remove('shake');
        }, 400);
        return;
    }

    const guessValue = inputElement.value;

    // 1. バリデーション
    if (!/^\d{4}$/.test(guessValue)) {
        updateMessage('Please enter 4 digits.', 'message-error');
        // エラー時も揺らすと分かりやすいので追加
        submitButton.classList.remove('shake');
        void submitButton.offsetWidth;
        submitButton.classList.add('shake');
        return;
    }
    const guessDigits = guessValue.split('').map(Number);
    const uniqueDigits = new Set(guessDigits);
    if (uniqueDigits.size !== NUM_DIGITS) {
        updateMessage('Digits must be unique.', 'message-error');
        // エラー時も揺らす
        submitButton.classList.remove('shake');
        void submitButton.offsetWidth;
        submitButton.classList.add('shake');
        return;
    }

    // 2. タイマー開始
    if (!isTimerStarted) {
        window.GameTimer.start();
        isTimerStarted = true;
        abortButton.style.display = 'inline-block';
    }

    const secretDigits = secretNumber.map(Number);
    const { hit, blow } = checkGuess(guessDigits, secretDigits);
    const secretStr = secretNumber.join('');

    addHistory(guessValue, hit, blow);

    // 3. 結果判定
    if (hit === NUM_DIGITS) {
        // --- 正解 ---
        window.GameTimer.stop();
        isGameLocked = true;
        updateMessage(`CONGRATULATIONS! Answer: ${secretStr}`, 'message-success');
        
        // クラスで無効化
        submitButton.classList.add('btn-disabled');
        
        inputElement.disabled = true;
        abortButton.style.display = 'none';
        restartButton.style.display = 'inline-block';

    } else {
        // --- 不正解 ---
        isGameLocked = true;
        updateMessage(`MISS! Answer was ${secretStr}. Resetting...`, 'message-error');
        
        autoResetTimeout = setTimeout(() => {
            initGame();
        }, AUTORESET_DELAY);
    }
}
