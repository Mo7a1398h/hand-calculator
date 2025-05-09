const TOTAL_ROUNDS = 7; // عدد الجولات الثابت


const specialMoves = {
    khales: {
        name: 'خالص',
        penalty: 200,
        down: 100,
        bonus: -30
    },
    hand: {
        name: 'هند',
        penalty: 400,
        down: 200,
        bonus: -60
    },
    ajkari: {
        name: 'أجكري',
        penalty: 800,
        down: 400,
        bonus: -120
    },
    amkari: {
        name: 'أمكري',
        penalty: 1600,
        down: 800,
        bonus: -240
    },
    amkariWalon: {
        name: 'أمكري ولون',
        penalty: 2400,
        down: 1600,
        bonus: -320
    }
};

// تهيئة وضع السمة
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// تبديل وضع السمة
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// إظهار معلومات المطور
function showCreator() {
    document.getElementById('modalOverlay').classList.add('show');
    document.getElementById('creatorModal').classList.add('show');

    // إغلاق النافذة عند الضغط على الخلفية
    document.getElementById('modalOverlay').onclick = function() {
        document.getElementById('modalOverlay').classList.remove('show');
        document.getElementById('creatorModal').classList.remove('show');
    };
}

// تهيئة الوضع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initTheme);

// استرجاع سجل الألعاب من الذاكرة المحلية
document.addEventListener('DOMContentLoaded', () => {
    updateGameHistory();
});

let gameState = {
    player1: {
        name: localStorage.getItem('player1Name') || '',
        total: 0,
        scores: [],
        highScore: parseInt(localStorage.getItem('player1HighScore')) || 0,
        totalGames: parseInt(localStorage.getItem('player1TotalGames')) || 0,
        wins: parseInt(localStorage.getItem('player1Wins')) || 0
    },
    player2: {
        name: localStorage.getItem('player2Name') || '',
        total: 0,
        scores: [],
        highScore: parseInt(localStorage.getItem('player2HighScore')) || 0,
        totalGames: parseInt(localStorage.getItem('player2TotalGames')) || 0,
        wins: parseInt(localStorage.getItem('player2Wins')) || 0
    },
    rounds: [],
    maxRounds: parseInt(localStorage.getItem('maxRounds')) || 7
};

// تحديث أسماء اللاعبين عند الكتابة
document.getElementById('player1Name').addEventListener('input', function(e) {
    gameState.player1.name = e.target.value;
});

document.getElementById('player2Name').addEventListener('input', function(e) {
    gameState.player2.name = e.target.value;
});

// إضافة نقاط للاعب
function addSpecialMove(playerNum, moveType, isDown = false) {
    const move = specialMoves[moveType];
    const score = isDown ? move.down : move.penalty;
    const bonus = move.bonus;

    // اللاعب الحالي والخصم
    const currentPlayerTotal = document.getElementById(`player${playerNum}Total`);
    const otherPlayerTotal = document.getElementById(`player${playerNum === 1 ? 2 : 1}Total`);
    
    // القيم الحالية
    const currentPlayerScore = parseInt(currentPlayerTotal.textContent) || 0;
    const otherPlayerScore = parseInt(otherPlayerTotal.textContent) || 0;
    
    // تحديث النقاط
    currentPlayerTotal.textContent = currentPlayerScore + bonus;  // يحصل على المكافأة (سالبة)
    otherPlayerTotal.textContent = otherPlayerScore + score;    // يحصل على الغرامة (موجبة)

    // تحديث حالة اللعبة
    gameState[`player${playerNum}`].total = parseInt(currentPlayerTotal.textContent);
    gameState[`player${playerNum === 1 ? 2 : 1}`].total = parseInt(otherPlayerTotal.textContent);

    // تسجيل الحركة
    gameState.rounds.push({
        player: playerNum,
        moveType: moveType,
        isDown: isDown,
        details: `اللاعب ${playerNum}: ${isDown ? `نزول ${move.name} (عليه ${score}، له ${bonus})` : `${move.name} (عليه ${score}، له ${bonus})`}`
    });

    // تحديث سجل الجولات
    updateRoundHistory();

    // تشغيل صوت النقر
    playSound('button');

    // التحقق من الفائز
    checkWinner();
}

function updateMaxRounds() {
    const newMaxRounds = parseInt(document.getElementById('maxRoundsInput').value);
    if (newMaxRounds >= 1 && newMaxRounds <= 20) {
        gameState.maxRounds = newMaxRounds;
        document.getElementById('maxRounds').textContent = newMaxRounds;
        updateRoundCounter();
    }
}

function resetStats() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإحصائيات؟')) {
        gameState.player1.highScore = 0;
        gameState.player1.totalGames = 0;
        gameState.player1.wins = 0;
        gameState.player2.highScore = 0;
        gameState.player2.totalGames = 0;
        gameState.player2.wins = 0;
        updateStats();
        localStorage.removeItem('gameStats');
    }
}

function updateStats() {
    // تحديث إحصائيات اللاعب 1
    document.getElementById('player1HighScore').textContent = gameState.player1.highScore;
    document.getElementById('player1Wins').textContent = gameState.player1.wins;
    document.getElementById('player1Average').textContent = 
        gameState.player1.totalGames > 0 ? 
        Math.round(gameState.player1.highScore / gameState.player1.totalGames) : 0;

    // تحديث إحصائيات اللاعب 2
    document.getElementById('player2HighScore').textContent = gameState.player2.highScore;
    document.getElementById('player2Wins').textContent = gameState.player2.wins;
    document.getElementById('player2Average').textContent = 
        gameState.player2.totalGames > 0 ? 
        Math.round(gameState.player2.highScore / gameState.player2.totalGames) : 0;
}

function loadStats() {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        gameState.player1.highScore = stats.player1.highScore || 0;
        gameState.player1.totalGames = stats.player1.totalGames || 0;
        gameState.player1.wins = stats.player1.wins || 0;
        gameState.player2.highScore = stats.player2.highScore || 0;
        gameState.player2.totalGames = stats.player2.totalGames || 0;
        gameState.player2.wins = stats.player2.wins || 0;
        updateStats();
    }
}

function saveStats() {
    const stats = {
        player1: {
            highScore: gameState.player1.highScore,
            totalGames: gameState.player1.totalGames,
            wins: gameState.player1.wins
        },
        player2: {
            highScore: gameState.player2.highScore,
            totalGames: gameState.player2.totalGames,
            wins: gameState.player2.wins
        }
    };
    localStorage.setItem('gameStats', JSON.stringify(stats));
}

function addScore(playerNum) {
    // الحصول على قيم الإدخال
    const addInput = document.getElementById(`player${playerNum}Down`);
    const minusInput = document.getElementById(`player${playerNum}Minus`);
    
    // تحويل القيم إلى أرقام
    let addValue = parseInt(addInput.value);
    let minusValue = parseInt(minusInput.value);
    
    // التحقق من صحة القيم
    if (isNaN(addValue)) addValue = 0;
    if (isNaN(minusValue)) minusValue = 0;
    
    // الحصول على مجموع النقاط الحالي
    const totalElement = document.getElementById(`player${playerNum}Total`);
    let currentTotal = parseInt(totalElement.textContent) || 0;
    
    // إضافة النقاط الجديدة إلى المجموع
    if (addValue > 0) {
        // إذا كان المجموع الحالي سالب، نضيف القيمة سالبة
        if (currentTotal < 0) {
            currentTotal -= addValue;
        } else {
            // إذا كان المجموع الحالي موجب، نطرح القيمة
            currentTotal -= addValue;
        }
    }
    
    // خصم النقاط من المجموع
    if (minusValue > 0) {
        // إذا كان المجموع الحالي سالب، نضيف القيمة المخصومة
        if (currentTotal < 0) {
            currentTotal += minusValue;
        } else {
            // إذا كان المجموع الحالي موجب، نضيف القيمة المخصومة
            currentTotal += minusValue;
        }
    }
    
    // تحديث المجموع في واجهة المستخدم وحالة اللعبة
    totalElement.textContent = currentTotal;
    gameState[`player${playerNum}`].total = currentTotal;
    
    // تسجيل الحركة في سجل الجولات
    if (addValue > 0 || minusValue > 0) {
        const details = [];
        if (addValue > 0) details.push(`إضافة ${addValue}`);
        if (minusValue > 0) details.push(`خصم ${minusValue}`);
        
        gameState.rounds.push({
            player: playerNum,
            add: addValue,
            minus: minusValue,
            newTotal: currentTotal,
            details: `اللاعب ${playerNum}: ${details.join(' - ')}`
        });
        
        // تحديث سجل الجولات
        updateRoundHistory();
    }

    // مسح حقول الإدخال
    addInput.value = '';
    minusInput.value = '';

    // تشغيل صوت النقر
    playSound('button');

    // التحقق من الفائز
    checkWinner();
}

// تحديث سجل الجولات
function updateRoundCounter(isSpecialMove = false) {
    let currentRound;
    // حساب عدد الجولات العادية فقط (بدون النزول والخصم)
    const normalRounds = gameState.rounds.filter(round => 
        !(round.player1Down || round.player2Down || round.player1Minus || round.player2Minus)
    ).length;

    if (isSpecialMove) {
        currentRound = normalRounds + 1;
    } else {
        currentRound = normalRounds;
    }
    
    document.getElementById('currentRound').textContent = currentRound;
    document.getElementById('maxRounds').textContent = gameState.maxRounds;
    document.getElementById('maxRoundsInput').value = gameState.maxRounds;

    // تحديث المخزون المحلي
    localStorage.setItem('maxRounds', gameState.maxRounds);
}

// تحديث عدد الجولات
function updateMaxRounds() {
    const newMaxRounds = parseInt(document.getElementById('maxRoundsInput').value);
    if (newMaxRounds >= 1 && newMaxRounds <= 20) {
        gameState.maxRounds = newMaxRounds;
        localStorage.setItem('maxRounds', newMaxRounds);
        updateRoundCounter();
        playSound('button');
    }
}

// تحديث نقاط الفوز


function updateRoundHistory(isSpecialMove = false) {
    const history = document.getElementById('roundHistory');
    history.innerHTML = '';

    // تحديث عداد الجولات فقط للحركات الخاصة
    if (isSpecialMove) {
        document.getElementById('currentRound').textContent = gameState.rounds.length + 1;
    }

    gameState.rounds.forEach((round, index) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round-entry';
        
        const player1Name = gameState.player1.name || 'الفريق 1';
        const player2Name = gameState.player2.name || 'الفريق 2';

        if (round.specialMove) {
            const move = specialMoves[round.specialMove.type];
            const winner = round.specialMove.winner === 1 ? player1Name : player2Name;
            const loser = round.specialMove.winner === 1 ? player2Name : player1Name;
            roundDiv.innerHTML = `
                <span>الجولة ${index + 1}:</span>
                <span>${winner} فاز بـ ${move.name}${round.specialMove.divided ? ' (مقسوم على 2)' : ''}</span>
                <span>(للفريق: ${round.player1Score} نقطة، للخصم: ${round.player2Score} نقطة)</span>
            `;
        } else {
            let player1Info = `${round.player1Score} نقطة`;
            let player2Info = `${round.player2Score} نقطة`;

            if (round.player1Down > 0) {
                player1Info = `⬇️ ${round.player1Down} نزول`;
            }
            if (round.player2Down > 0) {
                player2Info = `⬇️ ${round.player2Down} نزول`;
            }
            if (round.player1Minus > 0) {
                player1Info = `${player1Info} \n➖ ${round.player1Minus} خصم من المجموع`;
            }
            if (round.player2Minus > 0) {
                player2Info = `${player2Info} \n➖ ${round.player2Minus} خصم من المجموع`;
            }

            roundDiv.innerHTML = `
                <span>الجولة ${index + 1}:</span>
                <span>${player1Name}: ${player1Info}</span>
                <span>${player2Name}: ${player2Info}</span>
            `;
        }
        
        history.appendChild(roundDiv);
    });

    // تمرير إلى آخر جولة
    history.scrollTop = history.scrollHeight;
}


// التحقق من الفائز
function checkWinner() {
    const winnerDisplay = document.getElementById('winnerDisplay');
    const player1Name = gameState.player1.name || 'الفريق 1';
    const player2Name = gameState.player2.name || 'الفريق 2';

    winnerDisplay.textContent = ''; // مسح الرسالة السابقة

    // التحقق من انتهاء الجولات
    if (gameState.rounds.length >= TOTAL_ROUNDS) {
        let winner, winnerScore;
        
        if (gameState.player1.total < gameState.player2.total) {
            winner = player1Name;
            winnerScore = gameState.player1.total;
        } else {
            winner = player2Name;
            winnerScore = gameState.player2.total;
        }

        winnerDisplay.textContent = `🎉 مبروك! ${winner} هو الفائز بمجموع ${winnerScore} نقطة! 🎉`;
        disableGameButtons();
        sounds.win.play();

        // حفظ اللعبة في السجل
        saveGameToHistory(winner === player1Name ? gameState.player1 : gameState.player2);
    } else {
        // عرض عدد الجولات المتبقية
        const remainingRounds = TOTAL_ROUNDS - gameState.rounds.length;
        winnerDisplay.textContent = `باقي ${remainingRounds} جولات`;
    }

}

// بدء لعبة جديدة
function disableGameButtons() {
    // تعطيل أزرار الحركات الخاصة
    document.querySelectorAll('.special-btn').forEach(btn => btn.disabled = true);
    
    // تعطيل حقول إدخال النقاط
    document.querySelectorAll('input[type="number"]').forEach(input => input.disabled = true);
    
    // تعطيل أزرار إضافة النقاط
    document.querySelectorAll('button[onclick^="addScore"]').forEach(btn => btn.disabled = true);
}

function enableGameButtons() {
    // تفعيل أزرار الحركات الخاصة
    document.querySelectorAll('.special-btn').forEach(btn => btn.disabled = false);
    
    // تفعيل حقول إدخال النقاط
    document.querySelectorAll('input[type="number"]').forEach(input => input.disabled = false);
    
    // تفعيل أزرار إضافة النقاط
    document.querySelectorAll('button[onclick^="addScore"]').forEach(btn => btn.disabled = false);
}

function resetDowns() {
    // إعادة تعيين حقول النزول إلى الصفر
    document.getElementById('player1Down1').value = '0';
    document.getElementById('player1Down2').value = '0';
    document.getElementById('player2Down1').value = '0';
    document.getElementById('player2Down2').value = '0';
}

function saveGameToHistory(winner) {
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    const gameData = {
        date: new Date().toLocaleString('ar'),
        winner: winner.name || `اللاعب ${winner === gameState.player1 ? '1' : '2'}`,
        player1: {
            name: gameState.player1.name || 'اللاعب 1',
            score: gameState.player1.total
        },
        player2: {
            name: gameState.player2.name || 'اللاعب 2',
            score: gameState.player2.total
        }
    };
    gameHistory.unshift(gameData);
    if (gameHistory.length > 10) gameHistory.pop(); // الاحتفاظ بآخر 10 ألعاب فقط
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
    updateGameHistory();
}

function updateGameHistory() {
    const gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
    const historyContainer = document.getElementById('gameHistory');
    historyContainer.innerHTML = gameHistory.map(game => `
        <div class="history-item">
            <span>${game.date}</span>
            <span>الفائز: ${game.winner}</span>
            <span>${game.player1.name}: ${game.player1.score} | ${game.player2.name}: ${game.player2.score}</span>
        </div>
    `).join('');
}

function newGame() {
    if (!confirm('هل أنت متأكد من بدء لعبة جديدة؟')) {
        return;
    }

    const oldState = gameState;
    gameState = {
        player1: {
            name: gameState.player1.name,
            total: 0,
            scores: [],
            highScore: oldState.player1.highScore || 0,
            totalGames: oldState.player1.totalGames || 0,
            wins: oldState.player1.wins || 0
        },
        player2: {
            name: gameState.player2.name,
            total: 0,
            scores: [],
            highScore: oldState.player2.highScore || 0,
            totalGames: oldState.player2.totalGames || 0,
            wins: oldState.player2.wins || 0
        },
        rounds: [],
        maxRounds: oldState.maxRounds || 7
    };

    // إعادة تعيين العرض
    document.getElementById('player1Total').textContent = '0';
    document.getElementById('player2Total').textContent = '0';
    document.getElementById('roundHistory').innerHTML = '';
    document.getElementById('winnerDisplay').textContent = '';
    document.getElementById('currentRound').textContent = '0';
    enableGameButtons();
    playSound('newGame');
}

// التراجع عن آخر جولة
function undoLastRound() {
    playSound('undo');
    if (gameState.rounds.length === gameState.maxRounds) {
        // إعادة تفعيل الأزرار عند التراجع عن الجولة الأخيرة
        enableGameButtons();
    }


    if (gameState.rounds.length === 0) {
        alert('لا توجد جولات للتراجع عنها');
        return;
    }

    const lastRound = gameState.rounds.pop();
    
    // تحديث مجاميع اللاعبين
    gameState.player1.total -= lastRound.player1Score;
    gameState.player2.total -= lastRound.player2Score;

    // تحديث العرض
    document.getElementById('player1Total').textContent = gameState.player1.total;
    document.getElementById('player2Total').textContent = gameState.player2.total;
    document.getElementById('winnerDisplay').textContent = '';
    
    updateRoundHistory();
}
