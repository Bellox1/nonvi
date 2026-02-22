<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nonvi Voyage Plus | Excellence & Confort</title>
    <link rel="icon" href="{{ asset('storage/site/splash-icon.png') }}">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <!-- FontAwesome for Social Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --primary: #ff6f00;   /* Orange brûlé */
            --secondary: #6B4226; /* Marron */
            --tertiary: #1a2a3a;  /* Bleu nuit profond */
            --bg: #FAF8F5;
            --white: #ffffff;
            --text: #1a2a3a;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; }

        /* --- HEADER & MOBILE MENU --- */
        header {
            position: fixed;
            top: 0; width: 100%;
            background: var(--tertiary);
            padding: 0 5%;
            height: 90px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo img { height: 65px; }
        
        /* Desktop Nav */
        nav ul { display: flex; list-style: none; gap: 2rem; }
        nav a { text-decoration: none; color: #ffffff; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; transition: 0.3s; }
        nav a:hover, nav a.active { color: var(--primary); }
        nav a.active::after { content: ''; display: block; width: 100%; height: 2px; background: var(--primary); margin-top: 4px; }
        
        .header-right { display: flex; align-items: center; gap: 2rem; }
        .header-socials { display: flex; gap: 1rem; }
        .header-socials a { color: #ffffff; font-size: 1.1rem; transition: 0.3s; }
        .header-socials a:hover { color: var(--primary); transform: translateY(-2px); }

        .btn-header {
            padding: 10px 24px;
            background: var(--tertiary);
            color: white;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.8rem;
            text-transform: uppercase;
            border-radius: 4px;
        }

        /* Hamburger Menu */
        .hamburger {
            display: none;
            flex-direction: column;
            gap: 6px;
            cursor: pointer;
            z-index: 1100;
        }
        .hamburger span { width: 30px; height: 3px; background: #ffffff; transition: 0.3s; }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

        /* Mobile Nav Drawer */
        .mobile-nav {
            position: fixed;
            top: 0; right: -100%;
            width: 85%; height: 100vh;
            background: #fff;
            z-index: 1050;
            display: flex;
            flex-direction: column;
            padding: 80px 10% 40px;
            gap: 1.5rem;
            transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: -10px 0 30px rgba(0,0,0,0.1);
            overflow-y: auto;
        }
        .mobile-nav.active { right: 0; }
        
        .close-btn {
            position: absolute;
            top: 25px;
            right: 25px;
            font-size: 2.5rem;
            color: var(--tertiary);
            cursor: pointer;
            line-height: 1;
        }

        .mobile-nav a { font-size: 1.2rem; font-weight: 800; text-transform: uppercase; text-decoration: none; color: var(--tertiary); }
        .mobile-nav a.active { color: var(--primary); border-left: 4px solid var(--primary); padding-left: 10px; }
        .mobile-nav a.active { color: var(--primary); border-left: 4px solid var(--primary); padding-left: 10px; }
        .mobile-socials { display: flex; gap: 1.5rem; margin-top: auto; padding-top: 2rem; border-top: 1px solid #eee; }
        .mobile-socials a { color: var(--tertiary); font-size: 1.5rem; }
        .mobile-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 1040;
            display: none;
        }
        .mobile-overlay.active { display: block; }

        /* --- HERO BANNER --- */
        .hero-banner {
            position: relative;
            width: 100%; height: 60vh;
            min-height: 400px;
            background: url("{{ asset('storage/site/nonvivoyageplus_cover.webp') }}") no-repeat center center/cover;
            display: flex; align-items: center; justify-content: center;
            text-align: center; margin-top: 80px;
        }
        .hero-banner::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); }
        .hero-text { position: relative; z-index: 2; color: #fff; padding: 0 5%; }
        .hero-text h1 { font-size: clamp(2rem, 6vw, 4rem); font-weight: 900; line-height: 1.1; }
        .hero-text span { color: var(--primary); }

        /* --- GALLERY STRIP --- */
        .strip-section { padding: 40px 0; background: #fff; }
        .strip-scroll {
            display: flex; gap: 20px; overflow-x: auto;
            padding: 20px 5%; scrollbar-width: none;
        }
        .strip-scroll::-webkit-scrollbar { display: none; }
        .strip-card { flex: 0 0 300px; height: 400px; border-radius: 12px; overflow: hidden; background: #eee; }
        .strip-card img { width: 100%; height: 100%; object-fit: cover; }

        /* --- ABOUT (TERTIARY) --- */
        .about-section { background: var(--tertiary); color: #fff; padding: 50px 5%; }
        .about-wrap { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .about-text h2 { color: var(--primary); font-size: 2.5rem; margin-bottom: 20px; font-weight: 800; }
        .about-text p { font-size: 1.1rem; margin-bottom: 20px; text-align: left; opacity: 0.9; }
        .about-img img { width: 100%; border-radius: 16px; display: block; }

        /* --- RECRUITMENT --- */
        .simple-section { padding: 60px 5%; text-align: center; background: #fff; }
        .recruit-card {
            max-width: 900px;
            margin: 0 auto;
            background: var(--bg);
            padding: 4rem 2rem;
            border-radius: 20px;
            border: 2px solid var(--tertiary);
            box-shadow: 10px 10px 0 var(--tertiary);
        }
        .simple-section h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 20px; color: var(--tertiary); }
        .simple-section p { font-size: 1.2rem; color: var(--secondary); max-width: 700px; margin: 0 auto 40px; font-weight: 500; }

        /* --- FOOTER --- */
        footer { padding: 50px 5% 30px; background: #ffffff; text-align: center; border-top: 1px solid #eee; }
        .footer-logo { height: 50px; margin-bottom: 40px; }
        .footer-links { display: flex; justify-content: center; gap: 2rem; margin-bottom: 40px; list-style: none; }
        .footer-links a { text-decoration: none; color: #666; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .footer-bottom { border-top: 1px solid #eee; padding-top: 30px; display: flex; flex-direction: column; align-items: center; }
        .footer-bottom p { font-size: 0.8rem; color: #aaa; margin-bottom: 10px; }
        .social-links { display: flex; gap: 1.5rem; justify-content: center; margin-bottom: 30px; }
        .social-links a { color: var(--tertiary); font-size: 1.5rem; transition: 0.3s; }
        .social-links a:hover { color: var(--primary); transform: translateY(-3px); }
        .powered-logo { height: 28px; opacity: 0.5; }

        /* --- RESPONSIVE IMPROVEMENTS --- */
        @media (max-width: 968px) {
            .desktop-nav, .btn-header { display: none; }
            .hamburger { display: flex; }
            .hero-banner { height: 50vh; margin-top: 70px; }
            header { height: 90px; }
            .logo img { height: 55px; }
            .section, .strip-section, .about-section, .simple-section, footer { padding: 25px 5%; }
            .recruit-card { padding: 2.5rem 1.5rem; box-shadow: 6px 6px 0 var(--tertiary); }
            .strip-card { flex: 0 0 240px; height: 300px; }
            .about-wrap { grid-template-columns: 1fr; text-align: center; gap: 2.5rem; }
            .about-text h2 { font-size: 2rem; }
            .about-text p { text-align: center; }
            .simple-section h2 { font-size: 1.8rem; }
            .simple-section p { margin-bottom: 25px; }
        }
    </style>
</head>
<body>

    <header>
        <div class="logo">
            <img src="{{ asset('storage/site/splash-icon.png') }}" alt="Logo">
        </div>
        
        <div class="header-right">
            <nav class="desktop-nav">
                <ul>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#about">Notre Histoire</a></li>
                    <li><a href="#recrutement">Recrutement</a></li>
                </ul>
            </nav>
            
            <div class="header-socials desktop-nav">
                <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
                <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://wa.me/numéro" target="_blank"><i class="fab fa-whatsapp"></i></a>
            </div>

            <a href="#reserver" class="btn-header">Réserver</a>
        </div>

        <div class="hamburger" id="menuToggle">
            <span></span><span></span><span></span>
        </div>
    </header>

    <div class="mobile-overlay" id="overlay"></div>
    <nav class="mobile-nav" id="mobileMenu">
        <div class="close-btn" id="closeBtn">&times;</div>
        <a href="#services">Services</a>
        <a href="#about">Notre Histoire</a>
        <a href="#recrutement">Recrutement</a>
        <a href="#reserver">Réserver un trajet</a>
        
        <div class="mobile-socials">
            <a href="https://facebook.com" target="_blank"><i class="fab fa-facebook"></i></a>
            <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="https://wa.me/numéro" target="_blank"><i class="fab fa-whatsapp"></i></a>
        </div>
    </nav>

    <main>
        <section class="hero-banner">
            <div class="hero-text">
                <h1><span>Nonvi Voyage Plus</span> vous souhaite<br>un agréable voyage</h1>
            </div>
        </section>

        <section id="services" class="strip-section">
            <div style="text-align: center; margin-bottom:30px;">
                <h2 style="font-weight: 800; text-transform: uppercase;">Nos Services</h2>
            </div>
            <div class="strip-scroll">
                <div class="strip-card"><img src="{{ asset('storage/site/reservation.webp') }}" alt="1"></div>
                <div class="strip-card"><img src="{{ asset('storage/site/horaire.webp') }}" alt="2"></div>
                <div class="strip-card"><img src="{{ asset('storage/site/tarif.jpg') }}" alt="3"></div>
                <div class="strip-card"><img src="{{ asset('storage/site/vue1.webp') }}" alt="4"></div>
                <div class="strip-card"><img src="{{ asset('storage/site/vue2.jpg') }}" alt="5"></div>
            </div>
        </section>

        <section id="about" class="about-section">
            <div class="about-wrap">
                <div class="about-text">
                    <h2>À Propos de l'Entreprise</h2>
                    <p>Nonvi Voyage Plus est fier de servir les voyageurs béninois depuis plus de 5 ans. Notre engagement est de garantir un transport fiable, sécurisé et accessible.</p>
                    <p>Nous redéfinissons chaque jour les standards du transport interurbain au Bénin grâce à l'innovation et l'excellence du service.</p>
                </div>
                <div class="about-img">
                    <img src="{{ asset('storage/site/5ans.jpg') }}" alt="5 ans">
                </div>
            </div>
        </section>

        <section id="reserver" class="simple-section" style="background: #fff; border-bottom: 1px solid #eee;">
            <div class="recruit-card" style="box-shadow: 10px 10px 0 var(--primary); border-color: var(--primary);">
                <h2>Votre trajet commence ici</h2>
                <p>Réservez vos places en quelques clics, suivez votre bus en temps réel et gérez vos voyages via notre application mobile.</p>
                <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 10px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style="height: 55px; cursor: pointer;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" style="height: 55px; cursor: pointer;">
                </div>
            </div>
        </section>

        <section id="recrutement" class="simple-section">
            <div class="recruit-card">
                <h2>Rejoignez l'Aventure</h2>
                <p>Vous êtes passionné par le service client ou un professionnel de la route ? Postulez chez Nonvi Voyage Plus et faites partie d'une équipe dynamique.</p>
                <a href="mailto:contact@nonviplus.com" class="btn-header" style="background: var(--primary); padding: 18px 40px; font-size: 1rem;">Postuler maintenant</a>
            </div>
        </section>

    </main>

    <footer>
        <div class="footer-bottom">
            <p>&copy; 2026 Nonvi Voyage Plus. Tous droits réservés.</p>
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 2px; color: #ccc; margin-bottom: 10px;">Propulsé par</span>
                <img src="{{ asset('storage/site/by.png') }}" alt="By" class="powered-logo">
            </div>
        </div>
    </footer>

    <script>
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('overlay');
        const closeBtn = document.getElementById('closeBtn');

        function closeMenuFunc() {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            overlay.classList.remove('active');
        }

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        closeBtn.addEventListener('click', closeMenuFunc);
        overlay.addEventListener('click', closeMenuFunc);

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a, .mobile-nav a');

        function scrollActive() {
            const scrollY = window.pageYOffset;

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 100;
                const sectionId = current.getAttribute('id');

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    document.querySelector('.desktop-nav a[href*=' + sectionId + ']')?.classList.add('active');
                    document.querySelector('.mobile-nav a[href*=' + sectionId + ']')?.classList.add('active');
                } else {
                    document.querySelector('.desktop-nav a[href*=' + sectionId + ']')?.classList.remove('active');
                    document.querySelector('.mobile-nav a[href*=' + sectionId + ']')?.classList.remove('active');
                }
            });
        }
        window.addEventListener('scroll', scrollActive);
    </script>
</body>
</html>
