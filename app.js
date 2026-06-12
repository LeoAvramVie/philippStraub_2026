/* ==========================================================================
   PHILIPP STRAUB - BENTO DASHBOARD ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. VERCEL-STYLE CARD HOVER GLOW EFFECT
  const bentoCards = document.querySelectorAll('.bento-card');
  
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // Mouse relative X coordinate in pixels
      const y = e.clientY - rect.top;  // Mouse relative Y coordinate in pixels
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Global mouse coordinates for modal wave interaction
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // 2. SYSTEM CLOCK
  const timeDisplay = document.getElementById('time-display');
  
  function updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    
    if (timeDisplay) {
      timeDisplay.textContent = `${hrs}:${mins}:${secs}`;
    }
  }
  
  updateClock();
  setInterval(updateClock, 1000);

  // 3. BIOGRAPHY MODAL (DRAWER OVERLAY WITH WAVE CANVAS)
  const bioModal = document.getElementById('bio-modal');
  const openBioBtn = document.getElementById('open-bio-btn');
  const closeBioBtn = document.getElementById('close-bio-btn');
  
  if (openBioBtn && bioModal) {
    openBioBtn.addEventListener('click', () => {
      bioModal.classList.add('open');
      document.body.style.overflow = 'hidden'; // Stop background scrolling
      
      // Start the modal canvas wave rendering
      initModalCanvas();
    });
  }
  
  if (closeBioBtn && bioModal) {
    closeBioBtn.addEventListener('click', () => {
      closeBioBtnAction();
    });
  }
  
  if (bioModal) {
    bioModal.addEventListener('click', (e) => {
      if (e.target === bioModal) {
        closeBioBtnAction();
      }
    });
  }

  function closeBioBtnAction() {
    bioModal.classList.remove('open');
    document.body.style.overflow = ''; // Re-enable background scrolling
  }

  // 4. MODAL BACKGROUND INTERACTIVE WAVES
  let modalCanvas = document.getElementById('modal-canvas');
  let mCtx = null;
  let animationFrameId = null;

  function initModalCanvas() {
    if (!modalCanvas) return;
    mCtx = modalCanvas.getContext('2d');
    
    // Start wave draw loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    drawModalWaves();
  }

  function drawModalWaves() {
    if (!bioModal.classList.contains('open')) {
      return; // Stop animation loop when drawer is closed
    }
    
    animationFrameId = requestAnimationFrame(drawModalWaves);
    if (!mCtx) return;

    // Responsive size allocation
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      modalCanvas.width = window.innerWidth;
      modalCanvas.height = window.innerHeight * 0.15; // Top 15% empty screen
    } else {
      modalCanvas.width = window.innerWidth - 500; // Subtracts drawer width (500px)
      modalCanvas.height = window.innerHeight;
    }

    const w = modalCanvas.width;
    const h = modalCanvas.height;

    // Clear canvas
    mCtx.clearRect(0, 0, w, h);

    const time = Date.now() * 0.001;

    mCtx.lineWidth = 1.2;
    mCtx.shadowBlur = 12;

    // Draw 3 layered glowing waves
    for (let i = 0; i < 3; i++) {
      mCtx.beginPath();
      
      const opacity = 0.06 + (i * 0.04);
      // Colors are themed in Royal Blue, Cyan and Sky Blue
      if (i === 0) {
        mCtx.strokeStyle = `rgba(0, 240, 255, ${opacity})`; // Cyan
        mCtx.shadowColor = '#00f0ff';
      } else if (i === 1) {
        mCtx.strokeStyle = `rgba(26, 102, 255, ${opacity})`; // Royal Blue
        mCtx.shadowColor = '#1a66ff';
      } else {
        mCtx.strokeStyle = `rgba(0, 170, 255, ${opacity})`; // Sky Blue
        mCtx.shadowColor = '#00aaff';
      }

      if (!isMobile) {
        // DESKTOP: Flow waves vertically (top to bottom) on the left empty side
        mCtx.moveTo(w / 2, 0);
        for (let y = 0; y < h; y += 5) {
          const angle = (y * 0.005) + time * 1.5 + (i * 0.5);
          
          // Distort wave amplitude if cursor is close vertically
          const distToCursor = Math.abs(mouseY - y);
          const influence = distToCursor < 150 ? (150 - distToCursor) / 150 : 0;
          
          const amplitude = 20 + (influence * 45);
          const x = w / 2 + Math.sin(angle) * amplitude + Math.cos((y * 0.002) - time) * 10;
          
          mCtx.lineTo(x, y);
        }
      } else {
        // MOBILE: Flow waves horizontally (left to right) in the top empty side
        mCtx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 5) {
          const angle = (x * 0.008) + time * 1.8 + (i * 0.4);
          
          const distToCursor = Math.abs(mouseX - x);
          const influence = distToCursor < 100 ? (100 - distToCursor) / 100 : 0;
          
          const amplitude = 8 + (influence * 18);
          const y = h / 2 + Math.sin(angle) * amplitude;
          
          mCtx.lineTo(x, y);
        }
      }
      mCtx.stroke();
    }
    mCtx.shadowBlur = 0;
  }

  // 5. SMOOTH SCROLL NAVIGATION LINKS
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menu-toggle');
  const headerNav = document.querySelector('.header-nav');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetCard = document.querySelector(targetId);
      
      if (targetCard) {
        // Center the card in viewport
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Brief border highlight glow
        targetCard.style.borderColor = 'var(--color-neon-cyan)';
        setTimeout(() => {
          targetCard.style.borderColor = '';
        }, 1500);
      }

      // Close mobile menu if open
      if (headerNav && headerNav.classList.contains('open')) {
        headerNav.classList.remove('open');
        if (menuToggle) menuToggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Mobile Hamburger Toggle
  if (menuToggle && headerNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = headerNav.classList.toggle('open');
      menuToggle.classList.toggle('open');
      
      // Prevent body scroll when menu is open
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // 6. DOWNLOAD TRIGGERS
  const epkBtn = document.getElementById('epk-btn');
  const riderBtn = document.getElementById('rider-btn');
  
  if (epkBtn) {
    epkBtn.addEventListener('click', () => {
      const lang = localStorage.getItem('preferred-lang') || 'de';
      const msg = lang === 'de' 
        ? "B2B-DOWNLOAD-PAKET WIRD GESTARTET...\nphilipp_straub_epk_2026.zip [14.5 MB]" 
        : "INITIATING B2B DOWNLOAD PACKAGE...\nphilipp_straub_epk_2026.zip [14.5 MB]";
      alert(msg);
    });
  }
  
  if (riderBtn) {
    riderBtn.addEventListener('click', () => {
      const lang = localStorage.getItem('preferred-lang') || 'de';
      const msg = lang === 'de' 
        ? "BÜHNEN-SETUP & RIDER-DOWNLOAD WIRD GESTARTET...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]" 
        : "INITIATING TECHNICAL RIDER DOWNLOAD...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]";
      alert(msg);
    });
  }

  // 7. CONTACT FORM SUBMISSION
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.reset();
      
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        setTimeout(() => {
          formSuccess.classList.add('hidden');
        }, 5000);
      }
    });
  }

  // 8. SCROLL SPY ACTIVE SECTIONS
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -50% 0px', // Trigger when section is in the top-middle range of the viewport
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  navLinks.forEach(link => {
    const targetId = link.getAttribute('href');
    const targetCard = document.querySelector(targetId);
    if (targetCard) {
      observer.observe(targetCard);
    }
  });

  // 9. CLIENT-SIDE TRANSLATION SYSTEM (i18n)
  const translations = {
    de: {
      nav_profile: "PROFIL",
      nav_music: "MUSIK",
      nav_consulting: "CONSULTING",
      nav_gigs: "GIGS",
      nav_contact: "KONTAKT",
      profile_subtitle: "DJ, Producer & Nightlife-Architekt",
      profile_desc: "Seit fast 30 Jahren prägt Philipp Straub die elektronische Musikszene. Als international tourender Künstler verbindet er emotionale Progressive- und Techno-Sets mit einer B2B-Rolle als Berater für Entertainment- und Hospitality-Marken.",
      profile_bio_btn: "BIOGRAFIE LESEN ➔",
      music_title: "SOUNDS & SETS",
      consulting_title: "NIGHTLIFE ARCHITECT",
      consulting_intro: "Philipp berät globale Player an der Schnittstelle von Clubkultur und Luxus-Gastronomie.",
      consulting_role1: "Music Director",
      consulting_desc1: "Verantwortlich für das musikalische Line-up und Sound-Branding in Dubai & Ibiza.",
      consulting_role2: "Creative Advisor",
      consulting_desc2: "Strategische Beratung zur Kuration und Modernisierung der Club-Events auf Ibiza.",
      gigs_title: "TOUR-TERMINE",
      gigs_th_date: "DATUM",
      gigs_th_venue: "CLUB / VENUE",
      gigs_th_location: "ORT",
      gigs_th_status: "STATUS",
      gigs_status_tickets: "TICKETS",
      gigs_status_free: "FREI",
      downloads_title: "PRESSE & TECHNIK",
      downloads_intro: "Sofortiger Zugriff auf hochauflösende Promo-Materialien und Bühnen-Spezifikationen.",
      downloads_epk_title: "DOWNLOAD EPK",
      downloads_epk_meta: "Bio, Pressefotos // ZIP 14.5MB",
      downloads_rider_title: "TECHNICAL RIDER",
      downloads_rider_meta: "Bühnen-Setup, Anforderungen // PDF 1.2MB",
      contact_title: "B2B KONTAKT",
      contact_name: "NAME / FIRMA",
      contact_email: "EMAIL",
      contact_message: "DEINE ANFRAGE (BOOKING ODER CONSULTING)...",
      contact_submit_btn: "ANFRAGE SENDEN ➔",
      contact_success_text: "ANFRAGE ERFOLGREICH ÜBERMITTELT. ✓",
      socials_title: "CONNECT",
      socials_intro: "Folge Philipp Straub auf seinen offiziellen Kanälen.",
      modal_badge: "VOLLSTÄNDIGE BIOGRAFIE",
      modal_p1: "Philipp Straub gilt als einer der wichtigsten Pioniere der elektronischen Musikszene in Zentraleuropa. Seine musikalische Laufbahn begann in den frühen 1990er Jahren, als er mit wegweisenden Musikprojekten den Grundstein für die wachsende Rave-Kultur legte.",
      modal_p2: "Als internationaler DJ bereiste er seither über 100 Länder und trat in namhaften Clubs und auf Festivals weltweit auf. Seine tiefen, atmosphärischen Sets zeichnen sich durch ein breites Spektrum aus melodischem Techno, Tech House und Progressive House aus.",
      modal_p3: "Neben seiner künstlerischen Arbeit ist Philipp Straub ein gefragter Stratege und Berater in der Nightlife- und Hotelbranche. Seine fundierte Branchenkenntnis macht ihn zum Bindeglied zwischen kreativem Musikkonzept und anspruchsvollem Premium-Hospitality-Design. Als Musikdirektor für führende Hotelketten und weltberühmte Clubs gestaltet er die Nightlife-Erlebnisse von morgen.",
      modal_connect: "MIT PHILIPP VERBINDEN",
      footer_copyright: "&copy; 2026 Philipp Straub. Alle Rechte vorbehalten."
    },
    en: {
      nav_profile: "PROFILE",
      nav_music: "MUSIC",
      nav_consulting: "CONSULTING",
      nav_gigs: "GIGS",
      nav_contact: "CONTACT",
      profile_subtitle: "DJ, Producer & Nightlife Architect",
      profile_desc: "For nearly 30 years, Philipp Straub has shaped the electronic music scene. As an internationally touring artist, he blends emotional progressive and techno sets with a B2B role as a consultant for entertainment and hospitality brands.",
      profile_bio_btn: "READ BIOGRAPHY ➔",
      music_title: "SOUNDS & SETS",
      consulting_title: "NIGHTLIFE ARCHITECT",
      consulting_intro: "Philipp consults global players at the intersection of club culture and luxury hospitality.",
      consulting_role1: "Music Director",
      consulting_desc1: "Responsible for the musical line-up and sound-branding in Dubai & Ibiza.",
      consulting_role2: "Creative Advisor",
      consulting_desc2: "Strategic advising on the curation and modernization of club events in Ibiza.",
      gigs_title: "TOUR DATES",
      gigs_th_date: "DATE",
      gigs_th_venue: "VENUE",
      gigs_th_location: "LOCATION",
      gigs_th_status: "STATUS",
      gigs_status_tickets: "TICKETS",
      gigs_status_free: "FREE",
      downloads_title: "PRESS & TECHNICAL",
      downloads_intro: "Instant access to high-resolution promo materials and stage specifications.",
      downloads_epk_title: "DOWNLOAD EPK",
      downloads_epk_meta: "Bio, Press Photos // ZIP 14.5MB",
      downloads_rider_title: "TECHNICAL RIDER",
      downloads_rider_meta: "Stage setup, requirements // PDF 1.2MB",
      contact_title: "B2B CONTACT",
      contact_name: "NAME / COMPANY",
      contact_email: "EMAIL",
      contact_message: "YOUR INQUIRY (BOOKING OR CONSULTING)...",
      contact_submit_btn: "SEND INQUIRY ➔",
      contact_success_text: "INQUIRY SUCCESSFULLY SENT. ✓",
      socials_title: "CONNECT",
      socials_intro: "Follow Philipp Straub on his official channels.",
      modal_badge: "FULL BIOGRAPHY",
      modal_p1: "Philipp Straub is considered one of the most important pioneers of the electronic music scene in Central Europe. His musical career began in the early 1990s when he laid the foundation for the growing rave culture with groundbreaking music projects.",
      modal_p2: "As an international DJ, he has since traveled to over 100 countries and performed in renowned clubs and at festivals worldwide. His deep, atmospheric sets are characterized by a wide spectrum of melodic techno, tech house, and progressive house.",
      modal_p3: "In addition to his artistic work, Philipp Straub is a sought-after strategist and consultant in the nightlife and hotel industry. His profound industry knowledge makes him the link between creative music concepts and sophisticated premium hospitality design. As music director for leading hotel chains and world-famous clubs, he shapes the nightlife experiences of tomorrow.",
      modal_connect: "CONNECT WITH PHILIPP",
      footer_copyright: "&copy; 2026 Philipp Straub. All rights reserved."
    }
  };

  const langButtons = document.querySelectorAll('.lang-btn');
  
  function setLanguage(lang) {
    // Save language preference in localStorage
    localStorage.setItem('preferred-lang', lang);
    
    // Update active button state
    langButtons.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Translate all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  // Load preferred language or default to German ('de')
  const savedLang = localStorage.getItem('preferred-lang') || 'de';
  setLanguage(savedLang);
});
