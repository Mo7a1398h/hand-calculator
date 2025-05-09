const TOTAL_ROUNDS = 7; // عدد الجولات الثابت

// معاملات الضرب للنزول
const DOWN_MULTIPLIERS = {
    hand: 2,
    ajkari: 4,
    amkari: 8,
    amkariWalon: 12
};

// تحديث نتيجة حاسبة النزول
function updateDownCalculator() {
    const input = document.getElementById('downCalculatorInput');
    const type = document.getElementById('downCalculatorType');
    const result = document.getElementById('downCalculatorResult');
    
    const value = parseInt(input.value) || 0;
    const multiplier = DOWN_MULTIPLIERS[type.value];
    
    result.textContent = value * multiplier;
}

// إضافة مستمعي الأحداث لحاسبة النزول
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('downCalculatorInput');
    const type = document.getElementById('downCalculatorType');
    
    input.addEventListener('input', updateDownCalculator);
    type.addEventListener('change', updateDownCalculator);
});



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
// وظيفة التحكم في العداد
function handleTimerClick() {
    if (isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateGameHistory();
    resetTimer(); // تهيئة العداد عند تحميل الصفحة
});

// متغيرات العداد
let timerInterval;
let startTime;
let isTimerRunning = false;

// وظيفة بدء العداد
function startTimer() {
    if (!isTimerRunning) {
        startTime = Date.now();
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        document.getElementById('startTimerBtn').innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('startTimerBtn').classList.add('running');
    }
}

// وظيفة إيقاف العداد
function stopTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        document.getElementById('startTimerBtn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('startTimerBtn').classList.remove('running');
    }
}

// وظيفة إعادة ضبط العداد
function resetTimer() {
    stopTimer();
    document.getElementById('timer').textContent = '00:00:00';
}

// وظيفة تحديث العداد
function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
    
    // إضافة تأثير تحذيري عندما يتجاوز الوقت ساعة
    if (hours >= 1) {
        document.getElementById('timer').classList.add('warning');
    }
}

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
    maxRounds: parseInt(localStorage.getItem('maxRounds')) || 7,
    currentRound: 1,
    startTime: null,
    timerInterval: null
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

    // تحديث رقم الجولة
    updateRoundCounter(true);

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
    // لا نريد تحديث رقم الجولة مع الإضافة والخصم
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

    // التحقق من الفائز مع تحديد أن الاستدعاء من addScore
    checkWinner(true);
}

// تحديث سجل الجولات
function updateRoundCounter(isSpecialMove = false) {
    if (!isSpecialMove) return; // لا تحدث الجولة إلا مع الحركات الخاصة

    const currentRoundSpan = document.getElementById('currentRound');
    const maxRoundsSpan = document.getElementById('maxRounds');
    const currentRound = Math.min(gameState.rounds.length + 1, gameState.maxRounds);
    
    currentRoundSpan.textContent = currentRound;
    maxRoundsSpan.textContent = gameState.maxRounds;
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

    // فلترة الجولات لإظهار الحركات الخاصة فقط
    const specialRounds = gameState.rounds.filter(round => round.moveType);
    
    // تحديث عداد الجولات فقط للحركات الخاصة
    if (isSpecialMove) {
        document.getElementById('currentRound').textContent = specialRounds.length;
    }

    specialRounds.forEach((round, index) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'round-entry';
        
        const playerName = gameState[`player${round.player}`].name || `الفريق ${round.player}`;
        const move = specialMoves[round.moveType];
        
        roundDiv.innerHTML = `
            <span>الجولة ${index + 1}:</span>
            <span>${playerName}: ${round.isDown ? `نزول ${move.name}` : move.name}</span>
            <span>(المجموع: ${round.newTotal})</span>
        `;
        
        history.appendChild(roundDiv);
    });

    // تمرير إلى آخر جولة
    history.scrollTop = history.scrollHeight;
}


// التحقق من الفائز
function checkWinner(fromAddScore = false) {
    // التحقق من عدد الجولات الحالي
    const currentRound = parseInt(document.getElementById('currentRound').textContent);
    
    // التحقق من النقاط
    const player1Score = gameState.player1.total;
    const player2Score = gameState.player2.total;
    
    // لا نتحقق من الفائز قبل الجولة السابعة
    if (currentRound < 7) {
        return;
    }

    // إذا وصلنا للجولة 7 وهناك تعادل
    if (currentRound === 7 && player1Score === player2Score) {
        // تمديد اللعب إلى 9 جولات
        gameState.maxRounds = 9;
        document.getElementById('maxRounds').textContent = '9';
        document.getElementById('maxRoundsInput').value = '9';
        // إظهار رسالة التمديد
        document.getElementById('winnerDisplay').textContent = 'تم تمديد اللعب إلى 9 جولات بسبب التعادل!';
        return;
    }

    // إيقاف العداد عند وجود فائز
    if (!fromAddScore) {
        stopTimer();
    }
    const winnerDisplay = document.getElementById('winnerDisplay');
    const player1Name = gameState.player1.name || 'اللاعب 1';
    const player2Name = gameState.player2.name || 'اللاعب 2';

    let winner = null;
    let winnerName = '';
    let winnerScore = 0;

    // التحقق من الفائز في الجولة السابعة أو التاسعة
    if ((currentRound === 7 || currentRound === 9) && player1Score !== player2Score) {
        if (player1Score < player2Score) {
            winner = 1;
            winnerName = player1Name;
            winnerScore = player1Score;
        } else {
            winner = 2;
            winnerName = player2Name;
            winnerScore = player2Score;
        }
    }

    if (winner) {
        winnerDisplay.textContent = `🎉 مبروك! ${winnerName} هو الفائز بمجموع ${winnerScore} نقطة! 🎉`;
        disableGameButtons();
        sounds.win.play();

        // حفظ اللعبة في السجل
        saveGameToHistory(winner === player1Name ? gameState.player1 : gameState.player2);
    } else if (!fromAddScore) {
        // عرض عدد الجولات المتبقية فقط عندما لا يتم الاستدعاء من addScore
        const remainingRounds = TOTAL_ROUNDS - specialRounds;
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

// وظائف عداد الوقت
function startTimer() {
    gameState.startTime = new Date();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    if (!gameState.startTime) return;

    const now = new Date();
    const diff = now - gameState.startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetTimer() {
    stopTimer();
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = '00:00:00';
    gameState.startTime = null;
}

function newGame() {
    // إعادة ضبط العداد فقط
    resetTimer();
    if (!confirm('هل أنت متأكد من بدء لعبة جديدة؟')) {
        return;
    }

    // إعادة تشغيل العداد
    resetTimer();
    startTimer();

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

// التراجع عن آخر حركة
function undoLastMove() {
    if (gameState.rounds.length === 0) {
        alert('لا توجد حركات للتراجع عنها');
        return;
    }

    const lastMove = gameState.rounds.pop();
    const playerNum = lastMove.player;

    if (lastMove.moveType) {
        // إذا كانت حركة خاصة
        const move = specialMoves[lastMove.moveType];
        const score = lastMove.isDown ? move.down : move.penalty;
        const bonus = move.bonus;

        // اللاعب الحالي والخصم
        const currentPlayerTotal = document.getElementById(`player${playerNum}Total`);
        const otherPlayerTotal = document.getElementById(`player${playerNum === 1 ? 2 : 1}Total`);
        
        // القيم الحالية
        const currentPlayerScore = parseInt(currentPlayerTotal.textContent) || 0;
        const otherPlayerScore = parseInt(otherPlayerTotal.textContent) || 0;
        
        // تحديث النقاط
        currentPlayerTotal.textContent = currentPlayerScore - bonus;  // إزالة المكافأة
        otherPlayerTotal.textContent = otherPlayerScore - score;    // إزالة الغرامة

        // تحديث حالة اللعبة
        gameState[`player${playerNum}`].total = parseInt(currentPlayerTotal.textContent);
        gameState[`player${playerNum === 1 ? 2 : 1}`].total = parseInt(otherPlayerTotal.textContent);
    } else {
        // إذا كانت حركة عادية
        const totalElement = document.getElementById(`player${playerNum}Total`);
        let currentTotal = parseInt(totalElement.textContent) || 0;

        if (lastMove.add) {
            currentTotal += lastMove.add; // إضافة القيمة التي تم طرحها
        }
        if (lastMove.minus) {
            currentTotal -= lastMove.minus; // طرح القيمة التي تمت إضافتها
        }

        // تحديث المجموع في واجهة المستخدم وحالة اللعبة
        totalElement.textContent = currentTotal;
        gameState[`player${playerNum}`].total = currentTotal;
    }

    // تحديث سجل الجولات
    updateRoundHistory();
    updateRoundCounter();

    // تشغيل صوت التراجع
    playSound('button');

    // إعادة تفعيل الأزرار إذا كانت معطلة
    enableGameButtons();

    // إخفاء رسالة الفائز إذا كانت ظاهرة
    document.getElementById('winnerDisplay').textContent = '';
}

