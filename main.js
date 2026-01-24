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
}