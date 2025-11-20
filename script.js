// script.js (更新版)
// Inject shared header partial (JA/EN) into #site-header
async function injectSharedHeader(){
    const container = document.getElementById('site-header');
    if (!container) return;
    try {
        const lang = (document.documentElement.getAttribute('lang') || 'ja').toLowerCase();
        const isEn = lang.startsWith('en');
        // Compute project base robustly from script URL (works at root or /repo/)
        const scriptUrl = document.currentScript?.src || new URL('script.js', document.baseURI).href;
        let base = new URL(scriptUrl, location.origin).pathname.replace(/\/[^\/]*$/, '/');
        if (!base.endsWith('/')) base += '/';

        const partial = isEn ? 'partials/header-en.html' : 'partials/header-ja.html';
        const res = await fetch(base + partial, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Failed to load header partial');
        const html = await res.text();
        container.innerHTML = html;

        // Fix relative links inside the injected header
        const fixLink = (a)=>{
            const href = a.getAttribute('href') || '';
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('tel:')) return;
            // convert to absolute under project base
            a.setAttribute('href', base + href.replace(/^\/?/, ''));
        };
        container.querySelectorAll('a').forEach(fixLink);

        // Mark current page in nav
        try {
            const here = location.pathname.replace(/\/index\.html?$/, '/');
            container.querySelectorAll('a.nav-link').forEach(a => {
                let u = a.getAttribute('href') || '';
                // normalize for comparison
                u = u.replace(/\/index\.html?$/, '/');
                const abs = new URL(u, location.origin).pathname;
                if (here === abs) a.setAttribute('aria-current', 'page');
            });
        } catch(e){}
    } catch(e) {
        // silent fail to avoid blocking page
        console.warn(e);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await injectSharedHeader();

    const mainContent = document.getElementById('main-content');
    const cursor = document.querySelector('.cursor');
    const navTrigger = document.getElementById('nav-trigger');
    const navigation = document.getElementById('navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    const siteHeader = document.getElementById('site-header');
    const notesOverlay = document.getElementById('notes-overlay');
    const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    // ページ読み込み時の初期化
    if(navTrigger) {
        navTrigger.style.opacity = '1';
    }

    // カスタムカーソルの追従（fine pointer のみ）
    if (pointerFine && cursor) {
        window.addEventListener('mousemove', e => {
            cursor.style.top = e.clientY + 'px';
            cursor.style.left = e.clientX + 'px';
        }, { passive: true });
    } else if (cursor) {
        cursor.style.display = 'none';
    }

    // ホバーエフェクト
    document.querySelectorAll('a, button, .grid-item, #nav-trigger, input, audio, .work-image-container').forEach(el => {
        el.addEventListener('mouseover', () => {
            if (!pointerFine || !cursor) return;
            cursor.style.width = '32px';
            cursor.style.height = '32px';
            cursor.style.backgroundColor = 'rgba(228, 161, 193, 0.2)'; // 桜色
            cursor.style.boxShadow = '0 0 12px rgba(228, 161, 193, 0.4)';
        });
        el.addEventListener('mouseout', () => {
            if (!pointerFine || !cursor) return;
            cursor.style.width = '16px';
            cursor.style.height = '16px';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.boxShadow = '0 0 8px rgba(228, 161, 193, 0.3)';
        });
    });

    // ナビゲーションの開閉
    if(navTrigger) {
        navTrigger.addEventListener('click', () => {
            const isActive = navigation.classList.toggle('active');
            const expanded = isActive ? 'true' : 'false';
            navTrigger.setAttribute('aria-expanded', expanded);
        });
    }
    
    // ナビゲーションリンククリックでメニューを閉じる
    if(navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // index.html内でのスムーススクロールの場合
                if(link.getAttribute('href').startsWith('#')) {
                    navigation.classList.remove('active');
                    if (navTrigger) navTrigger.setAttribute('aria-expanded','false');
                }
                // ページ遷移の場合は何もしない
            });
        });
    }

    // スクロールに応じたフェードイン
    const sections = document.querySelectorAll('.creation-section, .about-section');
    if(sections.length > 0){
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.15 
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // 浮遊する花びらを生成 (最適化版)
    function createFloatingPetals() {
        const petalsContainer = document.getElementById('petals-container');
        if (!petalsContainer) return;

        // 画面サイズに応じて数を制限
        const maxPetals = window.innerWidth < 768 ? 5 : 12;
        let activePetals = 0;

        function createPetal() {
            if (document.hidden || activePetals >= maxPetals) return;

            const petal = document.createElement('div');
            petal.className = 'petal';
            
            // ランダムな位置
            petal.style.left = Math.random() * 100 + '%';
            // アニメーション時間を少し長めに
            const duration = 15 + Math.random() * 10;
            petal.style.animationDuration = duration + 's';
            
            // ランダムなサイズ
            const size = 4 + Math.random() * 6;
            petal.style.width = size + 'px';
            petal.style.height = size + 'px';
            
            petalsContainer.appendChild(petal);
            activePetals++;
            
            // アニメーション完了後に削除
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                    activePetals--;
                }
            }, duration * 1000);
        }

        // 生成間隔を少し広げる
        setInterval(createPetal, 2000);
        
        // 初期生成
        for (let i = 0; i < 3; i++) {
            setTimeout(createPetal, i * 1500);
        }
    }

    // 回転する小花を各セクションタイトルに追加
    function addRotatingFlowers() {
        const titleWrappers = document.querySelectorAll('.section-title-wrapper');
        titleWrappers.forEach((wrapper, index) => {
            const flower = document.createElement('div');
            flower.className = 'rotating-flower';
            flower.style.animationDelay = (index * 2) + 's';
            wrapper.appendChild(flower);
        });
    }

    // 光の粒子エフェクトを追加
    function addLightParticles() {
        const sections = document.querySelectorAll('.creation-section, .about-section');
        sections.forEach(section => {
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'light-particles';
            section.appendChild(particlesContainer);
            
            function createParticle() {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 4 + 's';
                
                particlesContainer.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 4000);
            }
            
            // 定期的に粒子を生成
            setInterval(createParticle, 2000);
            
            // 初期粒子を生成
            for (let i = 0; i < 3; i++) {
                setTimeout(createParticle, i * 500);
            }
        });
    }

    // 揺れるエフェクトを特定の要素に追加
    function addSwayingEffect() {
        const sectionsToSway = document.querySelectorAll('.section-title, .vertical-text');
        sectionsToSway.forEach((element, index) => {
            element.classList.add('swaying-element');
            element.style.animationDelay = (index * 0.5) + 's';
        });
    }


    // エフェクトを初期化（低モーション環境に配慮）
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
        if (!reduceMotion) {
            // 控えめに有効化
            createFloatingPetals();
            // addRotatingFlowers(); // 削除: 視覚的ノイズを減らす
            // addLightParticles(); // 削除: パフォーマンス優先
            // addSwayingEffect(); // 削除: テキストの可読性優先
        }
        initMediaGalleries();
        initForestParallax(reduceMotion);
        initFieldNotes();
        initShowreel(reduceMotion);
        initHeaderOnHero();
        initWorksStack();
        initOhanaBackground(reduceMotion);
        initRelatedWorks();
        initCartBadge();
    }, 600);

    // 初期表示: 工程非表示・衣は控えめ（特集のみ）
    try { applyAtlasFilter(); } catch(e){}

    // メディアギャラリーの初期化（サムネクリックでメイン切替）
    function initMediaGalleries() {
        const galleries = document.querySelectorAll('[data-gallery]');
        galleries.forEach(gallery => {
            const mainImg = gallery.querySelector('img.gallery-main');
            let mainVideo = gallery.querySelector('video.gallery-main-video');
            const mainPlaceholder = gallery.querySelector('.gallery-main-placeholder');
            const thumbs = gallery.querySelectorAll('.gallery-thumb');

            // 最初の有効サムネをメインに適用
            let initialized = false;
            thumbs.forEach((thumb, idx) => {
                const src = thumb.getAttribute('data-src');
                const vsrc = thumb.getAttribute('data-video');
                // サムネ画像が用意されていれば img を入れる
                if (src) {
                    // プレースホルダーがあれば外す
                    const ph = thumb.querySelector('.placeholder-image');
                    if (ph) ph.remove();
                    // 既存のimgがあれば差し替え、なければ追加（重複防止）
                    let thumbImg = thumb.querySelector('img');
                    if (!thumbImg){
                        thumbImg = document.createElement('img');
                        thumbImg.alt = `ギャラリー サムネイル ${idx+1}`;
                        thumb.appendChild(thumbImg);
                    }
                    thumbImg.src = src;
                } else if (vsrc) {
                    // 動画サムネは簡易なビデオアイコン風のプレースホルダーに
                    let badge = thumb.querySelector('.placeholder-image');
                    if (!badge){
                        badge = document.createElement('div');
                        badge.className = 'placeholder-image';
                        const p = document.createElement('p'); p.textContent = '▶'; badge.appendChild(p);
                        thumb.appendChild(badge);
                    }
                }
                thumb.addEventListener('click', () => {
                    thumbs.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    const showImage = !!src && !vsrc;
                    if (showImage && mainImg){
                        // 画像表示
                        if (mainVideo){ try { mainVideo.pause(); } catch(e){} mainVideo.style.display = 'none'; }
                        mainImg.style.opacity = '0';
                        const nextSrc = src;
                        // 画像のロード完了後にフェードイン
                        const onload = () => {
                            mainImg.style.display = 'block';
                            mainImg.style.opacity = '1';
                            mainImg.removeEventListener('load', onload);
                        };
                        mainImg.addEventListener('load', onload);
                        mainImg.src = nextSrc;
                        if (mainPlaceholder) mainPlaceholder.style.display = 'none';
                    } else if (vsrc){
                        // 動画表示
                        if (!mainVideo){
                            mainVideo = document.createElement('video');
                            mainVideo.className = 'gallery-main-video';
                            mainVideo.setAttribute('playsinline','');
                            mainVideo.setAttribute('muted','');
                            mainVideo.setAttribute('loop','');
                            mainVideo.controls = true;
                            // 挿入（mainImgの直前に）
                            if (mainImg && mainImg.parentNode){
                                mainImg.parentNode.insertBefore(mainVideo, mainImg);
                            } else {
                                gallery.querySelector('.main-media')?.appendChild(mainVideo);
                            }
                        }
                        if (mainImg){ mainImg.style.display = 'none'; }
                        if (mainPlaceholder) mainPlaceholder.style.display = 'none';
                        try { mainVideo.pause(); } catch(e){}
                        mainVideo.src = vsrc;
                        mainVideo.style.display = 'block';
                        try { mainVideo.play(); } catch(e){}
                    }
                });
                // 初期選択
                if (!initialized && (src || vsrc)) {
                    thumb.click();
                    initialized = true;
                }
            });
        });
    }
    // expose for dynamic content
    window.__initMediaGalleries = initMediaGalleries;
});

// ===== Simple Cart badge updater (shared across pages) =====
function initCartBadge(){
    const KEY = 'ohana_cart';
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    function total(){
        try { return (JSON.parse(localStorage.getItem(KEY))||[]).reduce((s,x)=> s + (x.qty||0), 0); } catch(e){ return 0; }
    }
    function render(){ const n = total(); badge.textContent = n? String(n) : ''; }
    render();
    window.addEventListener('storage', (e)=>{ if (e.key===KEY) render(); });
}

// Smooth scroll helper with custom duration (easeInOut)
function smoothScrollToY(targetY, duration){
    try {
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { window.scrollTo({ top: targetY, behavior: 'auto' }); return; }
    } catch(e){}
    const startY = window.scrollY || window.pageYOffset || 0;
    const delta = targetY - startY;
    const startT = performance.now();
    const ease = (t)=> t<0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; // easeInOutQuad
    function step(now){
        const t = Math.min(1, (now - startT) / Math.max(1, duration));
        const y = startY + delta * ease(t);
        window.scrollTo(0, y);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function animateMoreListIn(list){
    const items = Array.from(list.querySelectorAll('.atlas-more-grid .atlas-item'));
    const step = 0.06; // seconds between items (gentler)
    const dur = 1.0;   // seconds per item animation (slower)
    const easing = 'cubic-bezier(.25,.46,.45,.94)'; // easeOutQuad-ish
    items.forEach((el, i)=>{
        el.style.animation = 'none';
        // force reflow to restart animation
        void el.offsetWidth;
        el.style.animation = `atlasFadeUp ${dur}s ${easing} forwards`;
        el.style.animationDelay = `${i*step}s`;
    });
}

function animateMoreListOut(list){
    const items = Array.from(list.querySelectorAll('.atlas-more-grid .atlas-item'));
    const step = 0.06; // seconds between items (gentler)
    const dur = 0.8;   // seconds per item animation (slower)
    const easing = 'cubic-bezier(.25,.46,.45,.94)';
    const n = items.length;
    items.forEach((el, i)=>{
        const delay = (n - 1 - i) * step; // bottom-to-top
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = `atlasFadeOut ${dur}s ${easing} forwards`;
        el.style.animationDelay = `${delay}s`;
    });
    return (dur + step * Math.max(0, n-1)); // total seconds
}

// Show active count on the advanced toggle button
function updateAdvancedFilterBadge(){
    const btn = document.querySelector('[data-toggle-advanced]');
    const panel = document.querySelector('.filters-advanced');
    if (!btn || !panel) return;
    // Build a short, human-friendly summary instead of a raw count
    const labels = [];
    const region = panel.querySelector('.chips.regions .chip.active');
    const regionKey = region ? region.getAttribute('data-filter-region') : 'all';
    if (region && regionKey !== 'all') labels.push(region.textContent.trim());
    const method = panel.querySelector('.chips.methods .chip.active');
    if (method) labels.push(method.textContent.trim());
    const season = panel.querySelector('.chips.seasons .chip.active');
    if (season) labels.push(season.textContent.trim());
    const author = panel.querySelector('.chips.authors .chip.active');
    if (author) labels.push(author.textContent.trim());
    if (labels.length === 0) {
        btn.textContent = '絞り込み';
    } else if (labels.length <= 2) {
        btn.textContent = labels.join('・');
    } else {
        btn.textContent = `${labels.slice(0,2).join('・')} ほか${labels.length-2}`;
    }
}

// パララックス“森”の初期化
function initForestParallax(reduceMotion){
    const forest = document.getElementById('forest');
    if (!forest) return;
    const canopy = forest.querySelector('.layer-canopy');
    const mid = forest.querySelector('.layer-mid');
    const ground = forest.querySelector('.layer-ground');
    let mouseX = 0, mouseY = 0, scrollY = window.scrollY;

    function onMouse(e){
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    }
    function onScroll(){ scrollY = window.scrollY; }

    if (!reduceMotion){
        window.addEventListener('mousemove', onMouse, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    function raf(){
        const s = Math.min(1, scrollY / 800);
        const amp = document.body.classList.contains('mode-play') ? 1.4 : 1;
        const mx = reduceMotion ? 0 : mouseX;
        const my = reduceMotion ? 0 : mouseY;
        if (canopy) canopy.style.transform = `translate3d(${mx * 12 * amp}px, ${my * 12 * amp}px, 0) translateY(${s * 8 * amp}px)`;
        if (mid)    mid.style.transform    = `translate3d(${mx * 24 * amp}px, ${my * 18 * amp}px, 0) translateY(${s * 16 * amp}px)`;
        if (ground) ground.style.transform = `translate3d(${mx * 36 * amp}px, ${my * 24 * amp}px, 0) translateY(${s * 28 * amp}px)`;
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}


// ===== Field Notes Overlay =====
function initFieldNotes(){
    const openBtn = document.getElementById('notes-open');
    const overlay = document.getElementById('notes-overlay');
    const closeBtn = document.getElementById('notes-close');
    const content = document.getElementById('notes-content');
    if (!openBtn || !overlay || !content) return;
    const notes = [
        '花は、咲くために何かを求めない。ただそこにある。',
        '土地の記憶を、布と手に宿らせる。',
        '技術よりも、生き方そのものを作品に。',
        '水と森の境界で、ひかりが呼吸する。',
        'あはひで出会う——人と自然の輪郭は、やわらぐ。'
    ];
    function render(){
        const pick = notes.sort(()=> Math.random()-0.5).slice(0,3)
            .map(t=> `<blockquote>${t}</blockquote>`).join('');
        content.innerHTML = pick;
    }
    function open(){ render(); overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false'); }
    function close(){ overlay.classList.remove('active'); overlay.setAttribute('aria-hidden','true'); }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e)=> { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') close(); });
}

// ===== Showreel (hero) =====
function initShowreel(reduceMotion){
    const reel = document.querySelector('.showreel .reel');
    if (!reel) return;
    const slides = Array.from(reel.querySelectorAll('.slide'));
    if (slides.length === 0) return;
    const videos = slides.map(s=> s.querySelector('video'));
    let i = 0; let timer;
    function activate(idx){
        slides.forEach((s, n)=>{
            const isActive = (n===idx);
            s.classList.toggle('active', isActive);
            const v = videos[n];
            if (v){
                if (isActive){ v.muted = true; v.play().catch(()=>{}); }
                else { v.pause(); }
            }
        });
    }
    function next(){ i = (i+1) % slides.length; activate(i); }
    activate(0);
    if (!reduceMotion){ timer = setInterval(next, 6000); }
    document.addEventListener('visibilitychange', ()=>{
        if (document.hidden){ videos.forEach(v=> v && v.pause()); }
        else { videos[i]?.play().catch(()=>{}); }
    });
    const spots = document.querySelector('.reel-spots');
    if (spots){
        spots.addEventListener('click', (e)=>{
            const btn = e.target.closest('.spot');
            if (!btn) return;
            const target = btn.getAttribute('data-target');
            if (!target) return;
            smoothGoto(target);
        });
    }
    const actions = document.querySelector('.reel-actions');
    if (actions){
        actions.addEventListener('click', (e)=>{
            const btn = e.target.closest('[data-goto]');
            if (!btn) return;
            const target = btn.getAttribute('data-goto');
            if (target) document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    // Add gentle ripple under cursor
    if (!reduceMotion){
        // ripple effect disabled for a cleaner hero (no white circles)
    }
}

// Header contrast when over hero
function initHeaderOnHero(){
    const hero = document.querySelector('.showreel');
    const header = document.getElementById('site-header');
    if (!hero || !header) return;
    function onScroll(){
        const bottom = hero.getBoundingClientRect().bottom;
        if (bottom > 60) header.classList.add('on-hero'); else header.classList.remove('on-hero');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ===== Works Stack activation and nav =====
function initWorksStack(){
    const items = document.querySelectorAll('.works-stack .stack-item');
    if (!items.length) return;
    const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            const el = entry.target;
            const v = el.querySelector('.stack-bg video');
            if (entry.isIntersecting){
                el.classList.add('is-active');
                if (v){ v.muted = true; v.play().catch(()=>{}); }
            } else {
                el.classList.remove('is-active');
                if (v){ v.pause(); }
            }
        });
    }, { threshold: 0.55 });
    items.forEach(el=> observer.observe(el));

    // buttons to jump to cases
    document.querySelector('.works-stack').addEventListener('click', (e)=>{
        const caseBtn = e.target.closest('[data-case]');
        if (caseBtn){
            const sel = caseBtn.getAttribute('data-case');
            openCaseModal(sel);
            return;
        }
    });
}

// Smooth goto helper
function smoothGoto(hash){
    if (!hash) return;
    const panel = document.querySelector(`.works-stack .stack-item[data-target="${hash}"]`);
    if (panel) { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const el = document.querySelector(hash);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const works = document.querySelector('#works');
    if (works){
        works.scrollIntoView({ behavior: 'smooth' });
        setTimeout(()=>{
            const p = document.querySelector(`.works-stack .stack-item[data-target="${hash}"]`);
            if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
    }
}

// OHANA background: petals + fireflies + soft light (有機/無機の混在)
function initOhanaBackground(reduceMotion){
    const canvas = document.getElementById('ohana-bg');
    const mountains = document.querySelector('#bg-visuals .mountains');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let W=0, H=0;
    const petals = [];
    const fireflies = [];
    const washes = [];
    let t0 = performance.now();
    let stopped = false;
    function isDark(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
    function resize(){
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        petals.length = 0; fireflies.length = 0; washes.length = 0;
        // layered color washes (重ね色)
        const kasaneLight = [
            'rgba(228,161,193,0.08)', /* 桜 */
            'rgba(125,157,133,0.07)', /* 常磐 */
            'rgba(247,231,206,0.07)', /* 練色 */
            'rgba(164, 188, 206, 0.06)' /* 薄藍 */
        ];
        const pal = kasaneLight; // 明るさ重視（常にライトパレット）
        const washCount = 4; // 少なめで軽量化
        for (let i=0;i<washCount;i++){
            washes.push({
                x: (0.2 + 0.6*Math.random())*W,
                y: (0.2 + 0.6*Math.random())*H,
                r: Math.max(W,H) * (0.38 + Math.random()*0.42),
                col: pal[i % pal.length],
                dx: (Math.random()*2-1) * 0.05,
                dy: (Math.random()*2-1) * 0.05
            });
        }
        // 背景を軽く・クリーンに：花びら/ホタルは生成しない
        const petalCount = 0;
        const flyCount = 0;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', ()=>{
        if (mountains){
            const y = Math.min(20, window.scrollY*0.04);
            mountains.style.transform = `translateY(${y}px)`;
        }
    }, { passive: true });
    document.addEventListener('visibilitychange', ()=>{ stopped = document.hidden; });

    function drawPetal(p){
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const col = isDark()? 'rgba(255,158,191,0.28)' : 'rgba(228,161,193,0.26)';
        ctx.fillStyle = col;
        ctx.beginPath();
        // rotated ellipse-like petal
        const w = p.r*1.2, h = p.r*0.7;
        for (let i=0;i<2;i++){
            ctx.ellipse(0,0,w,h, i?Math.PI/6:-Math.PI/6, 0, Math.PI*2);
        }
        ctx.fill();
        ctx.restore();
    }
    function drawFirefly(f){
        const flick = (Math.sin(f.flicker)+1)/2; // 0-1
        const alpha = 0.08 + flick*0.18;
        const r = 1.6 + flick*2.0;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r*4);
        grad.addColorStop(0, `rgba(255,240,210,${alpha})`);
        grad.addColorStop(1, 'rgba(255,240,210,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(f.x, f.y, r*3, 0, Math.PI*2); ctx.fill();
    }
    function frame(now){
        const dt = Math.min(32, now - t0); t0 = now;
        ctx.clearRect(0,0,W,H);
        // kasane color washes (lighter blend)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (const w of washes){
            w.x += w.dx; w.y += w.dy;
            if (w.x < -w.r) w.x = W+w.r; if (w.x > W+w.r) w.x = -w.r;
            if (w.y < -w.r) w.y = H+w.r; if (w.y > H+w.r) w.y = -w.r;
            const grad = ctx.createRadialGradient(w.x,w.y,0, w.x,w.y,w.r);
            grad.addColorStop(0, w.col);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(w.x,w.y,w.r,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();

        // petals/fireflies disabled
        if (!stopped) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

// ===== Atlas filters =====
document.addEventListener('click', (e)=>{
    // Atlas filter chips
    const regionChip = e.target.closest('.chips.regions .chip');
    const tagChip = e.target.closest('.chips.methods .chip');
    if (regionChip || tagChip){
        if (regionChip){
            regionChip.parentElement.querySelectorAll('.chip').forEach(c=> { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); });
            regionChip.classList.add('active');
            regionChip.setAttribute('aria-pressed','true');
        }
        applyAtlasFilter();
        return;
    }
    // Atlas items: allow normal navigation when href is present
    const atlas = e.target.closest('.atlas-item');
    if (atlas){
        const caseSel = atlas.getAttribute('data-case');
        if (caseSel){
            // legacy: modal opening (not used now)
            e.preventDefault();
            if (typeof openCaseModal === 'function') openCaseModal(caseSel);
        }
        // else: follow the href normally
    }
});

function applyAtlasFilter(){
    const activeRegionBtn = document.querySelector('.chips.regions .chip.active');
    const region = activeRegionBtn ? activeRegionBtn.getAttribute('data-filter-region') : 'all';
    const activeTag = document.querySelector('.chips.methods .chip.active');
    const tag = activeTag ? activeTag.getAttribute('data-filter-tag') : null;
    const activeAuthor = document.querySelector('.chips.authors .chip.active');
    const author = activeAuthor ? activeAuthor.getAttribute('data-filter-author') : null;
    const activeSeason = document.querySelector('.chips.seasons .chip.active');
    const season = activeSeason ? activeSeason.getAttribute('data-filter-season') : null;
    const showProcess = false; // Atlasは完成品のみ（工程は常時非表示）
    const wearSuppressed = !tag; // when no methods filter selected
    const items = document.querySelectorAll('.atlas-grid .atlas-item');
    let suppressedCount = 0;
    const suppressed = [];
    items.forEach(el=>{
        const regions = (el.getAttribute('data-region')||'').split(/\s+/).filter(Boolean);
        const tags = (el.getAttribute('data-tags')||'').split(/\s+/);
        const a = el.getAttribute('data-author') || null; // solo works only
        const kind = el.getAttribute('data-kind') || 'work';
        const s = el.getAttribute('data-season') || null;
        const regionOK = (region==='all' || regions.includes(region));
        const tagOK = (!tag || tags.includes(tag));
        const authorOK = (!author || a === author);
        const seasonOK = (!season || s === season);
        // 工程はAtlasでは常時非表示（技法ページで紹介）
        const processOK = (kind !== 'process');
        const baseOK = (regionOK && tagOK && authorOK && seasonOK && processOK);
        // Suppress wear by default unless featured or tag explicitly selected
        const suppressedWear = (wearSuppressed && baseOK && tags.includes('wear') && !el.classList.contains('featured-wear'));
        if (suppressedWear) { suppressedCount++; suppressed.push(el); }
        el.style.display = (baseOK && !suppressedWear) ? '' : 'none';
    });
    // Show/hide the subtle hint when wear items are suppressed by default
    const hint = document.getElementById('atlas-more-hint');
    const list = document.getElementById('atlas-more-list');
    if (hint){
        if (!tag && suppressedCount > 0) {
            // show hint only when list is closed
            if (list && list.hasAttribute('hidden')) hint.removeAttribute('hidden');
            else hint.setAttribute('hidden','');
        } else {
            hint.setAttribute('hidden','');
        }
    }
    // Rebuild the "more" list from suppressed items
    if (list){
        const wrap = list.querySelector('.atlas-more-grid');
        if (wrap){
            wrap.innerHTML = '';
            if (!tag && suppressed.length){
                suppressed.forEach(el=>{
                    const clone = el.cloneNode(true);
                    clone.style.removeProperty('display');
                    clone.removeAttribute('style');
                    wrap.appendChild(clone);
                });
                // Keep list collapsed until user opens it
                if (list.hasAttribute('hidden')) {
                    // keep hidden
                } else {
                    // already open: ensure visible
                    list.removeAttribute('hidden');
                }
            } else {
                list.setAttribute('hidden','');
            }
        }
    }
    // Update advanced filter button label with active count
    try { updateAdvancedFilterBadge(); } catch(e){}
}

// Toggle methods chip active state (single-select)
document.addEventListener('click', (e)=>{
    const m = e.target.closest('.chips.methods .chip');
    if (!m) return;
    const wrap = m.parentElement;
    if (m.classList.contains('active')) { m.classList.remove('active'); m.setAttribute('aria-pressed','false'); }
    else { wrap.querySelectorAll('.chip').forEach(c=> { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); }); m.classList.add('active'); m.setAttribute('aria-pressed','true'); }
    applyAtlasFilter();
    try { updateAdvancedFilterBadge(); } catch(e){}
});

// Author chips (single-select; selecting shows only solo works by that author)
document.addEventListener('click', (e)=>{
    const a = e.target.closest('.chips.authors .chip');
    if (!a) return;
    const wrap = a.parentElement;
    if (a.classList.contains('active')) { a.classList.remove('active'); a.setAttribute('aria-pressed','false'); }
    else { wrap.querySelectorAll('.chip').forEach(c=> { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); }); a.classList.add('active'); a.setAttribute('aria-pressed','true'); }
    applyAtlasFilter();
    try { updateAdvancedFilterBadge(); } catch(e){}
});

// Season chips (single-select)
document.addEventListener('click', (e)=>{
    const sc = e.target.closest('.chips.seasons .chip');
    if (!sc) return;
    const wrap = sc.parentElement;
    if (sc.classList.contains('active')) { sc.classList.remove('active'); sc.setAttribute('aria-pressed','false'); }
    else { wrap.querySelectorAll('.chip').forEach(c=> { c.classList.remove('active'); c.setAttribute('aria-pressed','false'); }); sc.classList.add('active'); sc.setAttribute('aria-pressed','true'); }
    applyAtlasFilter();
    try { updateAdvancedFilterBadge(); } catch(e){}
});

// （削除）工程トグルは廃止：Atlasは完成品のみ表示

// Advanced filters toggle (reduce chip clutter)
document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-toggle-advanced]');
    if (!btn) return;
    const panel = document.querySelector('.filters-advanced');
    if (!panel) return;
    const show = panel.hasAttribute('hidden');
    if (show) panel.removeAttribute('hidden'); else panel.setAttribute('hidden','');
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    try { updateAdvancedFilterBadge(); } catch(e){}
});

// Quick toggles removed; all filters live in advanced panel

// “もっと見る”ヒント: 抑制中の衣をリスト表示
document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-more-wear]');
    if (!btn) return;
    const list = document.getElementById('atlas-more-list');
    const hint = document.getElementById('atlas-more-hint');
    if (!list) return;
    const isHidden = list.hasAttribute('hidden');
    if (isHidden) {
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Snapshot start BEFORE hiding/mutating DOM
        const startRect = btn.getBoundingClientRect();
        // Enter anim state first to prevent double visibility
        document.body.classList.add('is-animating-more');
        // Hide top hint/button immediately
        if (hint) hint.setAttribute('hidden','');
        try { btn.style.visibility = 'hidden'; } catch(e){}
        // Prepare list (bottom close is hidden by anim state)
        list.removeAttribute('hidden');
        // Button morph animation
        if (!reduce) {
            // ensure no previous ghost remains
            document.querySelectorAll('.floating-more-btn').forEach(el=> el.remove());
            const ghost = document.createElement('button');
            ghost.type = 'button';
            ghost.className = 'floating-more-btn';
            ghost.setAttribute('aria-hidden','true');
            ghost.innerHTML = `<span class="arrow" aria-hidden="true">⌄</span><span class="label-text">もっと見る</span>`;
            ghost.style.left = startRect.left + 'px';
            ghost.style.top = startRect.top + 'px';
            ghost.style.transform = 'translate(0,0)';
            document.body.appendChild(ghost);
            // Open list with animation for items
            list.classList.add('is-open');
            try { animateMoreListIn(list); } catch(e){}
            // Smooth scroll down (halfway towards list) with custom duration
            try {
                const rect = list.getBoundingClientRect();
                const current = window.scrollY || window.pageYOffset;
                const target = current + rect.top;
                const halfway = current + (target - current) * 0.5;
                smoothScrollToY(halfway, 1100);
            } catch(e){}
            // After a short delay, compute target and move ghost
            setTimeout(()=>{
                const closeBtn = document.querySelector('[data-more-close]');
                if (closeBtn){
                    const endRect = closeBtn.getBoundingClientRect();
                    const dx = (endRect.left - startRect.left);
                    const dy = (endRect.top - startRect.top);
                    // change label to 閉じる as it moves
                    const label = ghost.querySelector('.label-text');
                    if (label) label.textContent = '閉じる';
                    const arrow = ghost.querySelector('.arrow');
                    if (arrow) arrow.textContent = '⌃';
                    ghost.style.transform = `translate(${dx}px, ${dy}px)`;
                }
            }, 450);
            // Cleanup after motion
            setTimeout(()=>{
                ghost.remove();
                document.body.classList.remove('is-animating-more');
            }, 1100);
        } else {
            // Reduced motion: just open and scroll
            list.classList.add('is-open');
            try {
                const rect = list.getBoundingClientRect();
                const current = window.scrollY || window.pageYOffset;
                const target = current + rect.top;
                const halfway = current + (target - current) * 0.5;
                smoothScrollToY(halfway, 1100);
            } catch(e){}
        }
    } else {
        // Close if already open
        list.setAttribute('hidden','');
        list.classList.remove('is-open');
    }
});

// 下部の閉じるボタン
document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-more-close]');
    if (!btn) return;
    const list = document.getElementById('atlas-more-list');
    const hint = document.getElementById('atlas-more-hint');
    if (!list) return;
    // Clean any previous ghosts and states
    document.querySelectorAll('.floating-more-btn').forEach(el=> el.remove());
    document.body.classList.remove('is-animating-more');
    // Prepare morph back to top (if hint exists)
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startRect = btn.getBoundingClientRect();
    let targetRect = null;
    if (hint){
        // Ensure hint participates in layout for measuring
        hint.removeAttribute('hidden');
        const topBtn = hint.querySelector('[data-more-wear]');
        if (topBtn){ targetRect = topBtn.getBoundingClientRect(); }
    }
    document.body.classList.add('is-animating-close');
    // Create ghost at close position
    const ghost = document.createElement('button');
    ghost.type = 'button';
    ghost.className = 'floating-more-btn';
    ghost.setAttribute('aria-hidden','true');
    ghost.innerHTML = `<span class=\"arrow\" aria-hidden=\"true\">⌃</span><span class=\"label-text\">閉じる</span>`;
    ghost.style.left = startRect.left + 'px';
    ghost.style.top = startRect.top + 'px';
    ghost.style.transform = 'translate(0,0)';
    document.body.appendChild(ghost);

    // Start item-out animation (bottom-to-top)
    let itemsTotalMs = 0;
    try { itemsTotalMs = animateMoreListOut(list) * 1000; } catch(e){}

    // Smooth scroll up towards hint (halfway)
    if (!reduce && targetRect){
        try {
            const current = window.scrollY || window.pageYOffset;
            const targetY = current + targetRect.top;
            const halfway = current + (targetY - current) * 0.5;
            smoothScrollToY(halfway, 1100);
        } catch(e){}
    }
    // Animate ghost towards top and change to もっと見る
    if (targetRect){
        setTimeout(()=>{
            const dx = (targetRect.left - startRect.left);
            const dy = (targetRect.top - startRect.top);
            const label = ghost.querySelector('.label-text');
            if (label) label.textContent = 'もっと見る';
            const arrow = ghost.querySelector('.arrow');
            if (arrow) arrow.textContent = '⌄';
            ghost.style.transform = `translate(${dx}px, ${dy}px)`;
        }, 120);
    }
    // After motion completes, finalize state (max of ghost/scroll and items animation)
    const settleMs = Math.max(1150, itemsTotalMs + 100);
    setTimeout(()=>{
        ghost.remove();
        document.body.classList.remove('is-animating-close');
        // Now actually close the list
        list.setAttribute('hidden','');
        list.classList.remove('is-open');
        if (hint){
            // Reveal hint and reset label
            hint.removeAttribute('hidden');
            const topLabel = hint.querySelector('.label-text');
            if (topLabel) topLabel.textContent = 'もっと見る';
            try { document.querySelector('[data-more-wear]').style.visibility = ''; } catch(e){}
        }
        try { applyAtlasFilter(); } catch(e){}
    }, 1150);
});

// Case modal code removed (individual pages now in use)

// Atlas videos: autoplay when visible, pause/reset when out of view; hover keeps working on desktop
document.addEventListener('DOMContentLoaded', ()=>{
  const atlasVids = Array.from(document.querySelectorAll('.atlas-item video'));
  if (!atlasVids.length) return;
  const mql = window.matchMedia('(hover: hover)');
  if (mql.matches){
    atlasVids.forEach(v=>{
      const wrap = v.closest('.atlas-item');
      if (!wrap) return;
      wrap.addEventListener('mouseenter', ()=>{ v.muted = true; v.play().catch(()=>{}); });
      wrap.addEventListener('mouseleave', ()=>{ v.pause(); v.currentTime = 0; });
    });
  }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(({isIntersecting, target})=>{
      const vid = target;
      if (isIntersecting){
        vid.muted = true;
        vid.play().catch(()=>{});
      } else {
        vid.pause();
        try { vid.currentTime = 0; } catch(e){}
      }
    });
  }, { threshold: 0.25 });
  atlasVids.forEach(v=> obs.observe(v));
});

// ===== Related works (technique pages) =====
function initRelatedWorks(){
  const relHolders = document.querySelectorAll('[data-related-tech]');
  if (!relHolders.length) return;
  // Resolve manifest path from site root (handle /works/* pages)
  let manifestPath = 'data/works-manifest.json';
  try {
    const p = location.pathname;
    const idx = p.indexOf('/works/');
    if (idx !== -1) manifestPath = p.slice(0, idx+1) + 'data/works-manifest.json';
  } catch(e){}
  // Derive a site-root base to resolve item href/src consistently
  const siteBase = manifestPath.replace(/data\/works-manifest\.json$/, '');
  fetch(manifestPath)
    .then(r=> r.json())
    .then(list=>{
      relHolders.forEach(holder=>{
        const techKey = holder.getAttribute('data-related-tech');
        const startsWith = holder.hasAttribute('data-tech-prefix');
        const works = list.filter(w=> (w.techs||[]).some(t=> startsWith ? t.startsWith(techKey) : t===techKey));
        if (!works.length){ holder.parentElement.style.display='none'; return; }
        const grid = document.createElement('div'); grid.className = 'journal-grid';
        works.forEach(w=>{
          const resolve = (path) => {
            if (!path) return '';
            // absolute URL or already root-relative
            if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
            return siteBase + path;
          };
          const a = document.createElement('a'); a.className = 'journal-card'; a.href = resolve(w.url);
          a.innerHTML = `<img src="${resolve(w.cover)}" alt="${w.title}" style="width:100%;height:auto;border-radius:8px;margin-bottom:12px;"/>`+
                        `<h3>${w.title}</h3>`;
          grid.appendChild(a);
        });
        holder.appendChild(grid);
      });
    }).catch(()=>{});
}
