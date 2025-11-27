// ../scripts/modal.js

document.addEventListener('DOMContentLoaded', function() {
    const riddleImage = document.getElementById('riddle-image');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const closeModalButton = document.getElementById('modal-close-button');

    if (riddleImage && modalOverlay && modalImage && closeModalButton) {
        // 元の画像をクリックしたときの処理
        riddleImage.addEventListener('click', function() {
            modalImage.src = this.src; // モーダル内の画像に元の画像のソースを設定
            modalOverlay.classList.remove('modal-hidden'); // 非表示クラスを削除
            modalOverlay.classList.add('modal-visible');   // 表示クラスを追加
        });

        // 閉じるボタンをクリックしたときの処理
        closeModalButton.addEventListener('click', function() {
            modalOverlay.classList.remove('modal-visible'); // 表示クラスを削除
            modalOverlay.classList.add('modal-hidden');   // 非表示クラスを追加
            // アニメーション終了後にsrcをクリアすると、次回表示時に前の画像が一瞬見えるのを防げる（任意）
            // setTimeout(() => {
            //     modalImage.src = "";
            // }, 300); // CSSのtransition時間と合わせる
        });

        // モーダルの背景（オーバーレイ）をクリックしたときの処理
        modalOverlay.addEventListener('click', function(event) {
            // クリックされたのがモーダル画像自身でなければ閉じる
            if (event.target === modalOverlay) {
                modalOverlay.classList.remove('modal-visible');
                modalOverlay.classList.add('modal-hidden');
                // setTimeout(() => {
                //     modalImage.src = "";
                // }, 300);
            }
        });
    } else {
        console.error('Modal elements not found!');
    }
});