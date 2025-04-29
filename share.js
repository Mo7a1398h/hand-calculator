// تصدير النتائج كملف PDF
async function exportToPDF() {
    // إنشاء نسخة من المحتوى للتصدير
    const content = document.createElement('div');
    content.style.padding = '20px';
    content.style.direction = 'rtl';
    
    // إضافة العنوان
    const title = document.createElement('h1');
    title.textContent = 'حاسبة الهند - نتائج اللعبة';
    content.appendChild(title);

    // إضافة معلومات اللاعبين
    const players = document.createElement('div');
    players.innerHTML = `
        <h2>النتيجة النهائية:</h2>
        <p>${gameState.player1.name || 'الفريق 1'}: ${gameState.player1.total} نقطة</p>
        <p>${gameState.player2.name || 'الفريق 2'}: ${gameState.player2.total} نقطة</p>
    `;
    content.appendChild(players);

    // إضافة سجل الجولات
    const history = document.createElement('div');
    history.innerHTML = `
        <h2>سجل الجولات:</h2>
        ${document.getElementById('roundHistory').innerHTML}
    `;
    content.appendChild(history);

    // خيارات PDF
    const options = {
        margin: 1,
        filename: 'حاسبة-الهند.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
        // تصدير المحتوى كملف PDF
        await html2pdf().from(content).set(options).save();
        playSound('button');
    } catch (error) {
        console.error('خطأ في تصدير PDF:', error);
    }
}

// مشاركة النتائج
async function shareResults() {
    const player1Name = gameState.player1.name || 'الفريق 1';
    const player2Name = gameState.player2.name || 'الفريق 2';
    
    const text = `حاسبة الهند - نتائج اللعبة\n\n${player1Name}: ${gameState.player1.total} نقطة\n${player2Name}: ${gameState.player2.total} نقطة`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: 'حاسبة الهند',
                text: text
            });
        } else {
            // إذا لم يكن Web Share API متوفراً، نفتح WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        }
        playSound('button');
    } catch (error) {
        console.error('خطأ في المشاركة:', error);
    }
}
