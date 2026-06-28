document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash');
    const mainContent = document.getElementById('app');
    const body = document.body;

    async function initApp() {
        try {
            // 1. Dışarıdaki menu.html dosyasını çağır
            const response = await fetch('menu.html');
            
            if (!response.ok) {
                throw new Error('Menü dosyası bulunamadı! Live Server kullandığından emin ol.');
            }
            
            const htmlContent = await response.text();

            // 2. Marka görünsün diye yapay bekleme süresi (2.5 sn)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // 3. İçeriği sayfaya bas
            mainContent.innerHTML = htmlContent;
            initFunZone();

            // 4. Splash ekranını kapat, menüyü aç
            splashScreen.style.opacity = '0';
            mainContent.classList.add('visible');
            body.style.overflow = 'auto'; // Kaydırmayı aç

            // Splash elementini tamamen kaldır
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 800);

        } catch (error) {
            console.error('Hata:', error);
            mainContent.innerHTML = '<p style="text-align:center; padding:50px;">Menü yüklenirken bir hata oluştu.<br>Lütfen Live Server ile çalıştırdığından emin ol.</p>';
            splashScreen.style.display = 'none';
            mainContent.classList.add('visible');
        }
    }

    initApp();
});

// FİLTRELEME SİSTEMİ
window.filterMenu = function(category, btnElement) {
    // Aktif buton rengi
    const allBtns = document.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // Kartları filtrele
    const allCards = document.querySelectorAll('.product-card');
    
    allCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            // Yeniden render efekti
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        } else {
            card.style.display = 'none';
        }
    });
};

// --- EĞLENCE KÖŞESİ ---
const WHEEL_COLORS = [
    '#D4AF37', '#a67c52', '#2d6a4f', '#4a3b2a', '#1b4332',
    '#bc6c25', '#606c38', '#283618', '#9b2226', '#005f73',
    '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702',
    '#bb3e03', '#ae2012', '#335c67'
];

function initFunZone() {
    initFunTabs();
    initWheel();
    initMatcher();
}

function initFunTabs() {
    const tabs = document.querySelectorAll('.fun-tab');
    const panels = document.querySelectorAll('.fun-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.panel).classList.add('active');
        });
    });
}

function getMenuItems(category = 'all') {
    const cards = document.querySelectorAll('.product-card');
    const items = [];

    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (category !== 'all' && cat !== category) return;
        const name = card.querySelector('.card-header h3')?.textContent.trim();
        const price = card.querySelector('.price')?.textContent.trim();
        if (name) items.push({ name, category: cat, price: price || '' });
    });

    return items;
}

function initWheel() {
    const canvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('spin-btn');
    const resultEl = document.getElementById('wheel-result');
    const resultName = document.getElementById('wheel-result-name');
    const resultPrice = document.getElementById('wheel-result-price');
    const overlay = document.getElementById('wheel-result-overlay');
    const overlayTitle = document.getElementById('wheel-overlay-title');
    const overlayPrice = document.getElementById('wheel-overlay-price');
    const overlayClose = document.getElementById('wheel-result-close');
    const overlayAgain = document.getElementById('wheel-result-again');
    const catBtns = document.querySelectorAll('.wheel-cat-btn');

    if (!canvas || !spinBtn) return;

    const ctx = canvas.getContext('2d');
    let items = getMenuItems('all');
    let currentRotation = 0;
    let isSpinning = false;
    let wheelSize = 320;

    function resizeCanvas() {
        wheelSize = Math.min(320, Math.floor(window.innerWidth * 0.82));
        canvas.width = wheelSize;
        canvas.height = wheelSize;
        canvas.style.width = wheelSize + 'px';
        canvas.style.height = wheelSize + 'px';
        drawWheel(currentRotation);
    }

    function hideWheelResult() {
        overlay.classList.add('hidden');
        document.body.classList.remove('wheel-overlay-open');
    }

    function showWheelResult(item) {
        resultName.textContent = item.name;
        resultPrice.textContent = item.price;
        overlayTitle.textContent = item.name;
        overlayPrice.textContent = item.price;

        resultEl.classList.remove('hidden');
        overlay.classList.remove('hidden');
        document.body.classList.add('wheel-overlay-open');

        setTimeout(() => {
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    function drawWheel(rotation = 0) {
        const size = wheelSize;
        const center = size / 2;
        const radius = center - 8;
        const labelFont = Math.max(8, Math.min(11, size / 28));
        const hubRadius = Math.max(18, size / 14);

        ctx.clearRect(0, 0, size, size);

        if (items.length === 0) {
            ctx.fillStyle = '#1a2029';
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#888';
            ctx.font = `${labelFont}px Montserrat, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('Bu kategoride ürün yok', center, center);
            return;
        }

        const sliceAngle = (Math.PI * 2) / items.length;

        items.forEach((item, i) => {
            const start = rotation + i * sliceAngle;
            const end = start + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, start, end);
            ctx.closePath();
            ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
            ctx.fill();
            ctx.strokeStyle = '#0b1016';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(start + sliceAngle / 2);
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${labelFont}px Montserrat, sans-serif`;
            ctx.textAlign = 'right';
            const maxLen = size < 280 ? 10 : 14;
            const label = item.name.length > maxLen ? item.name.slice(0, maxLen - 1) + '…' : item.name;
            ctx.fillText(label, radius - 10, 4);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(center, center, hubRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b1016';
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#D4AF37';
        ctx.font = `bold ${Math.max(8, labelFont - 1)}px Montserrat, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('ÖZGÜR', center, center - 3);
        ctx.fillText('KAFE', center, center + 9);
    }

    function getWinnerIndex(rotation) {
        const sliceAngle = (Math.PI * 2) / items.length;
        const normalized = ((Math.PI * 1.5 - rotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        return Math.floor(normalized / sliceAngle) % items.length;
    }

    function spin() {
        if (isSpinning || items.length === 0) return;

        isSpinning = true;
        spinBtn.disabled = true;
        resultEl.classList.add('hidden');
        hideWheelResult();

        const extraSpins = 4 + Math.random() * 3;
        const randomOffset = Math.random() * Math.PI * 2;
        const targetRotation = currentRotation + extraSpins * Math.PI * 2 + randomOffset;
        const startRotation = currentRotation;
        const duration = 4000;
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            currentRotation = startRotation + (targetRotation - startRotation) * eased;
            drawWheel(currentRotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentRotation = targetRotation;
                isSpinning = false;
                spinBtn.disabled = false;
                showWheelResult(items[getWinnerIndex(currentRotation)]);
            }
        }

        requestAnimationFrame(animate);
    }

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isSpinning) return;
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            items = getMenuItems(btn.dataset.cat);
            currentRotation = 0;
            drawWheel(0);
            resultEl.classList.add('hidden');
            hideWheelResult();
        });
    });

    overlayClose.addEventListener('click', hideWheelResult);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) hideWheelResult();
    });
    overlayAgain.addEventListener('click', () => {
        hideWheelResult();
        spin();
    });

    spinBtn.addEventListener('click', spin);
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

function initMatcher() {
    const input = document.getElementById('player-name-input');
    const addBtn = document.getElementById('add-player-btn');
    const list = document.getElementById('player-list');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const clearBtn = document.getElementById('clear-players-btn');
    const overlay = document.getElementById('team-result-overlay');
    const funnyMsg = document.getElementById('team-funny-message');
    const teamList = document.getElementById('team-result-list');
    const teamEmoji = document.getElementById('team-result-emoji');
    const overlayClose = document.getElementById('team-result-close');
    const overlayAgain = document.getElementById('team-result-again');
    const hintEl = document.getElementById('matcher-hint');

    if (!input || !addBtn) return;

    const MAX_PLAYERS = 4;
    let players = [];

    const TEAM_EMOJIS = ['🃏', '🎲', '🤝', '☕', '😄', '🎯', '🔥', '👑'];

    const TEAM_MESSAGES = [
        (teams) => `Kura çekildi! ${teams.length} takım hazır — kim kaybederse çayı o öder! ☕`,
        (teams) => `Özgür Kafe algoritması konuştu: ${teams[0][0]} & ${teams[0][1]} aynı tarafta. Kader böyle istedi!`,
        (teams) => `${teams.length} takım kuruldu. Bu masada ya efsane yazılır ya da güzel hikaye çıkar, ortası yok!`,
        (teams) => `Tebrikler! Artık birbirinizle kazanmak zorundasınız. Kaçış yok. 🎲`,
        (teams) => `Bu eşleşme bilimsel değil ama çok eğlenceli. ${teams.length} takım, sınırsız muhabbet!`,
        (teams) => `"${teams[0][0]}" ile "${teams[0][1]}" beraber! Biri okey açar, diğeri eli dağıtır derler...`,
        (teams) => `Takımlar belli! Hayırlı oyunlar — ama önce bi çay söyleyin. 🍵`,
        (teams) => `Kader çarkı döndü, ${teams.length} takım çıktı. İtiraz mercii: tekrar kur butonu.`,
        (teams) => `Dostluk bitti mi? Hayır! Ama rekabet başladı. ${teams.length} takım sahada!`,
        (teams) => `Bu ikililer batak masasında korku filmi mi komedi mi — izleyelim! 🃏`,
        (teams) => `Algoritma dedi ki: siz ikiniz. Geri kalanlar da aynı şekilde eşleşti. Şanslılar!`,
        (teams) => `${teams.length} takım, ${teams.length * 2} kişi, 1 kafe: Özgür Kafe. Başlasın oyun!`,
        (teams) => `Eşleşme tamam! "${teams[teams.length - 1][0]}" & "${teams[teams.length - 1][1]}" bile anlaştı... sanırız. 😄`,
        (teams) => `Kura adil, sonuç kesin. ${teams.length} takım kuruldu — haydi masaya!`,
        (teams) => `Bu takımlar ya çok iyi oynar ya çok kötü. Ara yok, eğlence tam! 🔥`
    ];

    const UNPAIRED_MESSAGES = [
        (name) => `"${name}" tek kaldı! Bu tur kaleci sensin, bir sonraki eşleştirmede şans yanında. 🧤`,
        (name) => `${name}, şimdilik tribündesin. Bir çay daha iç, yakında takım gelir! ☕`,
        (name) => `"${name}" eşleşemedi ama moral bozma — üçüncü kişi aranıyor... şaka, tekrar dene! 😅`,
        (name) => `${name} solo modda! Bir dahaki "Takımları Kur"a kadar bekletme listesindesin.`,
        (name) => `Kura "${name}" demedi bu sefer. Üzülme, belki çay söyleyen sensindir! 🍵`,
        (name) => `"${name}" tek başına ama yalnız değil — tüm kafe seninle! Bir sonraki turda şansın açılır.`
    ];

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getFunnyMessage(teams, unpaired) {
        if (unpaired) {
            return pickRandom(UNPAIRED_MESSAGES)(unpaired);
        }
        return pickRandom(TEAM_MESSAGES)(teams);
    }

    function hideTeamResult() {
        overlay.classList.add('hidden');
        document.body.classList.remove('wheel-overlay-open');
    }

    function showTeamResult(teams, unpaired) {
        teamEmoji.textContent = pickRandom(TEAM_EMOJIS);
        funnyMsg.textContent = getFunnyMessage(teams, unpaired);

        let listHtml = teams.map((team, idx) => `
            <div class="team-result-item">
                <span class="team-result-num">Takım ${idx + 1}</span>
                <div class="team-pair">
                    <span class="player-chip gold">${team[0]}</span>
                    <span class="team-and">&</span>
                    <span class="player-chip gold">${team[1]}</span>
                </div>
            </div>
        `).join('');

        if (unpaired) {
            listHtml += `
                <div class="team-result-item unpaired">
                    <span class="team-result-num">Tek kalan</span>
                    <span class="player-chip dim">${unpaired}</span>
                </div>`;
        }

        teamList.innerHTML = listHtml;
        overlay.classList.remove('hidden');
        document.body.classList.add('wheel-overlay-open');
    }

    function updateUI() {
        list.innerHTML = players.map((name, i) => `
            <li class="player-item">
                <span>${name}</span>
                <button class="player-remove" data-index="${i}" aria-label="Kaldır">×</button>
            </li>
        `).join('');

        list.querySelectorAll('.player-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                players.splice(Number(btn.dataset.index), 1);
                updateUI();
            });
        });

        shuffleBtn.disabled = players.length !== MAX_PLAYERS;
        const atLimit = players.length >= MAX_PLAYERS;
        addBtn.disabled = atLimit;
        input.disabled = atLimit;
        hintEl.textContent = atLimit
            ? `${MAX_PLAYERS} isim tamam! Takımları kurabilirsin.`
            : `${players.length}/${MAX_PLAYERS} isim — tam ${MAX_PLAYERS} isim girilmeden takım kurulamaz.`;
    }

    function addPlayer() {
        const name = input.value.trim();
        if (!name) return;
        if (players.length >= MAX_PLAYERS) {
            input.placeholder = `En fazla ${MAX_PLAYERS} isim!`;
            setTimeout(() => { input.placeholder = 'İsim gir...'; }, 1500);
            return;
        }
        if (players.some(p => p.toLowerCase() === name.toLowerCase())) {
            input.value = '';
            input.placeholder = 'Bu isim zaten var!';
            setTimeout(() => { input.placeholder = 'İsim gir...'; }, 1500);
            return;
        }
        players.push(name);
        input.value = '';
        updateUI();
        hideTeamResult();
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function matchPlayers() {
        if (players.length !== MAX_PLAYERS) return;

        const shuffled = shuffleArray(players);
        const teams = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            teams.push([shuffled[i], shuffled[i + 1]]);
        }

        showTeamResult(teams, null);
    }

    overlayClose.addEventListener('click', hideTeamResult);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) hideTeamResult();
    });
    overlayAgain.addEventListener('click', () => {
        hideTeamResult();
        matchPlayers();
    });

    addBtn.addEventListener('click', addPlayer);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(); });
    shuffleBtn.addEventListener('click', matchPlayers);
    clearBtn.addEventListener('click', () => {
        players = [];
        updateUI();
        hideTeamResult();
    });

    updateUI();
}