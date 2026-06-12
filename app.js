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
      const msg = (translations[lang] && translations[lang].download_epk_alert) || translations['en'].download_epk_alert;
      alert(msg);
    });
  }
  
  if (riderBtn) {
    riderBtn.addEventListener('click', () => {
      const lang = localStorage.getItem('preferred-lang') || 'de';
      const msg = (translations[lang] && translations[lang].download_rider_alert) || translations['en'].download_rider_alert;
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
      footer_copyright: "&copy; 2026 Philipp Straub. Alle Rechte vorbehalten.",
      download_epk_alert: "B2B-DOWNLOAD-PAKET WIRD GESTARTET...\nphilipp_straub_epk_2026.zip [14.5 MB]",
      download_rider_alert: "BÜHNEN-SETUP & RIDER-DOWNLOAD WIRD GESTARTET...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]"
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
      footer_copyright: "&copy; 2026 Philipp Straub. All rights reserved.",
      download_epk_alert: "INITIATING B2B DOWNLOAD PACKAGE...\nphilipp_straub_epk_2026.zip [14.5 MB]",
      download_rider_alert: "INITIATING TECHNICAL RIDER DOWNLOAD...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]"
    },
    ar: {
      nav_profile: "الملف الشخصي",
      nav_music: "الموسيقى",
      nav_consulting: "الاستشارات",
      nav_gigs: "الحفلات",
      nav_contact: "الاتصال",
      profile_subtitle: "دي جي، منتج ومهندس الحياة الليلية",
      profile_desc: "لأكثر من 30 عامًا، ساهم فيليب شتراوب في تشكيل مشهد الموسيقى الإلكترونية. كفنان يجول العالم، يدمج بين مجموعات التقدمية والتكنو العاطفية ودوره كمستشار للشركات الترفيهية والضيافة.",
      profile_bio_btn: "قراءة السيرة الذاتية ➔",
      music_title: "الأصوات والمجموعات",
      consulting_title: "مهندس الحياة الليلية",
      consulting_intro: "فيليب يقدم الاستشارات للشركات العالمية في تقاطع ثقافة النوادي والضيافة الفاخرة.",
      consulting_role1: "المدير الموسيقي",
      consulting_desc1: "مسؤول عن التنسيق الموسيقي والهوية الصوتية في دبي وإيبيزا.",
      consulting_role2: "المستشار الإبداعي",
      consulting_desc2: "استشارات استراتيجية لتنسيق وتحديث فعاليات النوادي في إيبيزا.",
      gigs_title: "مواعيد الحفلات",
      gigs_th_date: "التاريخ",
      gigs_th_venue: "الموقع",
      gigs_th_location: "البلد/المدينة",
      gigs_th_status: "الحالة",
      gigs_status_tickets: "التذاكر",
      gigs_status_free: "مجاني",
      downloads_title: "الصحافة والملف التقني",
      downloads_intro: "وصول فوري للمواد الترويجية عالية الدقة والمواصفات التقنية للمسرح.",
      downloads_epk_title: "تحميل الملف الصحفي EPK",
      downloads_epk_meta: "السيرة الذاتية، صور صحفية // ZIP 14.5MB",
      downloads_rider_title: "الملف التقني RIDER",
      downloads_rider_meta: "إعداد المسرح، المتطلبات // PDF 1.2MB",
      contact_title: "الاتصال للأعمال B2B",
      contact_name: "الاسم / الشركة",
      contact_email: "البريد الإلكتروني",
      contact_message: "طلبك (حجز أو استشارة)...",
      contact_submit_btn: "إرسال الطلب ➔",
      contact_success_text: "تم إرسال الطلب بنجاح. ✓",
      socials_title: "تواصل",
      socials_intro: "تابع فيليب شتراوب على قنواته الرسمية.",
      modal_badge: "السيرة الذاتية الكاملة",
      modal_p1: "يعتبر فيليب شتراوب أحد أهم رواد مشهد الموسيقى الإلكترونية في وسط أوروبا. بدأت مسيرته الموسيقية في أوائل التسعينيات عندما وضع حجر الأساس لثقافة الحفلات المتنامية بمشاريع موسيقية رائدة.",
      modal_p2: "كدي جي عالمي، سافر منذ ذلك الحين إلى أكثر من 100 دولة وقدم عروضه في نوادي شهيرة ومهرجانات حول العالم. تتميز مجموعاته العميقة والجوية بمزيج واسع من التكنو الميلودي، التيك هاوس، والبروجريسيف هاوس.",
      modal_p3: "إلى جانب عمله الفني، فيليب شتراوب استراتيجي ومستشار مطلوب في قطاع الحياة الليلية والفنادق. معرفته العميقة بالصناعة تجعله حلقة الوصل بين المفهوم الموسيقي الإبداعي وتصميم الضيافة المتميز. كمدير موسيقي لسلاسل الفنادق الرائدة والنوادي ذات الشهرة العالمية، يقوم بصياغة تجارب الحياة الليلية للغد.",
      modal_connect: "تواصل مع فيليب",
      footer_copyright: "&copy; 2026 فيليب شتراوب. جميع الحقوق محفوظة.",
      download_epk_alert: "بدء تحميل حزمة B2B...\nphilipp_straub_epk_2026.zip [14.5 MB]",
      download_rider_alert: "بدء تحميل الملف التقني وإعداد المسرح...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]"
    },
    hi: {
      nav_profile: "प्रोफ़ाइल",
      nav_music: "संगीत",
      nav_consulting: "परामर्श",
      nav_gigs: "शो",
      nav_contact: "संपर्क",
      profile_subtitle: "डीजे, निर्माता और नाइटलाइफ़ आर्किटेक्ट",
      profile_desc: "लगभग 30 वर्षों से, फिलिप स्ट्रॉब ने इलेक्ट्रॉनिक संगीत परिदृश्य को आकार दिया है। एक अंतरराष्ट्रीय स्तर पर दौरा करने वाले कलाकार के रूप में, वह मनोरंजन और आतिथ्य ब्रांडों के सलाहकार के रूप में एक B2B भूमिका के साथ भावनात्मक प्रोग्रेसिव और टेक्नो सेट का संयोजन करते हैं।",
      profile_bio_btn: "जीवनी पढ़ें ➔",
      music_title: "साउंड्स और सेट्स",
      consulting_title: "नाइटलाइफ़ आर्किटेक्ट",
      consulting_intro: "फिलिप क्लब संस्कृति और लक्जरी आतिथ्य के संगम पर वैश्विक दिग्गजों को परामर्श देते हैं।",
      consulting_role1: "संगीत निर्देशक",
      consulting_desc1: "दुबई और इबीसा में संगीत लाइन-अप और साउंड-ब्रांडिंग के लिए जिम्मेदार।",
      consulting_role2: "रचनात्मक सलाहकार",
      consulting_desc2: "इबीसा में क्लब कार्यक्रमों के क्यूरेशन और आधुनिकीकरण पर रणनीतिक सलाह।",
      gigs_title: "टूर की तारीखें",
      gigs_th_date: "तारीख",
      gigs_th_venue: "स्थान",
      gigs_th_location: "स्थान/शहर",
      gigs_th_status: "स्थिति",
      gigs_status_tickets: "टिकट",
      gigs_status_free: "मुफ़्त",
      downloads_title: "प्रेस और तकनीकी",
      downloads_intro: "हाई-रिज़ॉल्यूशन प्रोमो सामग्री और स्टेज विशिष्टताओं तक त्वरित पहुंच।",
      downloads_epk_title: "EPK डाउनलोड करें",
      downloads_epk_meta: "बायो, प्रेस तस्वीरें // ZIP 14.5MB",
      downloads_rider_title: "तकनीकी राइडर",
      downloads_rider_meta: "स्टेज सेटअप, आवश्यकताएं // PDF 1.2MB",
      contact_title: "B2B संपर्क",
      contact_name: "नाम / कंपनी",
      contact_email: "ईमेल",
      contact_message: "आपकी पूछताछ (बुकिंग या परामर्श)...",
      contact_submit_btn: "पूछताछ भेजें ➔",
      contact_success_text: "पूछताछ सफलतापूर्वक भेजी गई। ✓",
      socials_title: "जुड़ें",
      socials_intro: "फिलिप स्ट्रॉब को उनके आधिकारिक चैनलों पर फॉलो करें।",
      modal_badge: "पूरी जीवनी",
      modal_p1: "फिलिप स्ट्रॉब को मध्य यूरोप में इलेक्ट्रॉनिक संगीत परिदृश्य के सबसे महत्वपूर्ण अग्रदूतों में से एक माना जाता है। उनका संगीत करियर 1990 के दशक की शुरुआत में शुरू हुआ था जब उन्होंने अभूतपूर्व संगीत परियोजनाओं के साथ बढ़ती रेव संस्कृति की नींव रखी थी।",
      modal_p2: "एक अंतरराष्ट्रीय डीजे के रूप में, उन्होंने तब से 100 से अधिक देशों की यात्रा की है और दुनिया भर के प्रसिद्ध क्लबों और त्योहारों में प्रदर्शन किया है। उनके गहरे, वायुमंडलीय सेटों में मेलोडिक टेक्नो, टेक हाउस और प्रोग्रेसिव हाउस का एक विस्तृत स्पेक्ट्रम शामिल है।",
      modal_p3: "अपने कलात्मक काम के अलावा, फिलिप स्ट्रॉब नाइटलाइफ़ और होटल उद्योग में एक मांग वाले रणनीतिकार और सलाहकार हैं। उनका गहरा उद्योग ज्ञान उन्हें रचनात्मक संगीत अवधारणाओं और परिष्कृत प्रीमियम आतिथ्य डिजाइन के बीच की कड़ी बनाता है। अग्रणी होटल श्रृंखलाओं और विश्व प्रसिद्ध क्लबों के संगीत निर्देशक के रूप में, वह कल के नाइटलाइफ़ अनुभवों को आकार देते हैं।",
      modal_connect: "फिलिप से जुड़ें",
      footer_copyright: "&copy; 2026 फिलिप स्ट्रॉब। सर्वाधिकार सुरक्षित।",
      download_epk_alert: "B2B डाउनलोड पैकेज शुरू किया जा रहा है...\nphilipp_straub_epk_2026.zip [14.5 MB]",
      download_rider_alert: "तकनीकी राइडर डाउनलोड शुरू किया जा रहा है...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]"
    },
    zh: {
      nav_profile: "个人简介",
      nav_music: "音乐作品",
      nav_consulting: "咨询服务",
      nav_gigs: "演出日程",
      nav_contact: "业务联系",
      profile_subtitle: "DJ、制作人及夜生活规划师",
      profile_desc: "近30年来，Philipp Straub一直在塑造电子音乐界。作为一名国际巡演艺术家，他将富有情感的渐进/前卫（Progressive）与泰克诺（Techno）音乐现场，与为娱乐和酒店品牌提供咨询的B2B顾问角色完美结合。",
      profile_bio_btn: "阅读个人传记 ➔",
      music_title: "音乐与现场",
      consulting_title: "夜生活规划师",
      consulting_intro: "Philipp 在俱乐部文化与奢华酒店业的交汇处为全球客户提供咨询。",
      consulting_role1: "音乐总监",
      consulting_desc1: "负责迪拜和 Ibiza 的音乐阵容编排与声音品牌定位。",
      consulting_role2: "创意顾问",
      consulting_desc2: "针对 Ibiza 俱乐部活动的策划与现代化提供战略咨询。",
      gigs_title: "巡演日程",
      gigs_th_date: "日期",
      gigs_th_venue: "场地",
      gigs_th_location: "城市/国家",
      gigs_th_status: "状态",
      gigs_status_tickets: "购票",
      gigs_status_free: "免票",
      downloads_title: "媒体与技术资料",
      downloads_intro: "即时获取高分辨率宣传资料与舞台技术规格要求。",
      downloads_epk_title: "下载电子宣传册 (EPK)",
      downloads_epk_meta: "个人简介、宣传照 // ZIP 14.5MB",
      downloads_rider_title: "技术规格要求 (RIDER)",
      downloads_rider_meta: "舞台设置、技术要求 // PDF 1.2MB",
      contact_title: "B2B 商务联系",
      contact_name: "姓名 / 公司",
      contact_email: "电子邮箱",
      contact_message: "您的咨询内容（演出预订或项目咨询）...",
      contact_submit_btn: "发送咨询 ➔",
      contact_success_text: "咨询内容已成功发送。✓",
      socials_title: "社交媒体",
      socials_intro: "在官方渠道关注 Philipp Straub。",
      modal_badge: "完整传记",
      modal_p1: "Philipp Straub 被认为是中欧电子音乐界最重要的先驱之一。他的音乐生涯始于1990年代初期，当时他通过开创性的音乐项目为日益壮大的 Rave 文化奠定了基础。",
      modal_p2: "作为一名国际 DJ，他此后旅行了100多个国家，并在全球著名的俱乐部和音乐节上演出。他深邃、充满氛围感的现场涵盖了旋律泰克诺（Melodic Techno）、泰克朋克（Tech House）和渐进浩室（Progressive House）。",
      modal_p3: "除了艺术创作，Philipp Straub 也是夜生活和酒店行业备受追捧的战略家和顾问。他深厚的行业知识使他成为创意音乐概念与高端奢华酒店设计之间的纽带。作为领先酒店集团和世界著名俱乐部的音乐总监，他正在塑造明天的夜生活体验。",
      modal_connect: "联系 Philipp",
      footer_copyright: "&copy; 2026 Philipp Straub. 保留所有权利。",
      download_epk_alert: "正在启动 B2B 宣传包下载...\nphilipp_straub_epk_2026.zip [14.5 MB]",
      download_rider_alert: "正在启动技术规格要求 (RIDER) 下载...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]"
    }
  };

  const langSelect = document.getElementById('lang-select');
  
  function updateLangSelectLabels() {
    const isMobile = window.innerWidth <= 768;
    const options = {
      de: isMobile ? 'DE' : 'DE (Deutsch)',
      en: isMobile ? 'EN' : 'EN (English)',
      ar: isMobile ? 'AR' : 'AR (العربية)',
      hi: isMobile ? 'HI' : 'HI (हिन्दी)',
      zh: isMobile ? 'ZH' : 'ZH (中文)'
    };
    
    if (langSelect) {
      Array.from(langSelect.options).forEach(opt => {
        const val = opt.value;
        if (options[val]) {
          opt.text = options[val];
        }
      });
    }
  }

  function setLanguage(lang) {
    // Save language preference in localStorage
    localStorage.setItem('preferred-lang', lang);
    
    // Update select element value
    if (langSelect) {
      langSelect.value = lang;
    }

    // Toggle document direction (RTL) for Arabic
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }

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

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Initial update for labels and listeners
  updateLangSelectLabels();
  window.addEventListener('resize', updateLangSelectLabels);

  // 10. DYNAMIC TOUR DATES FROM BANDSINTOWN
  const gigsList = document.getElementById('gigs-list');
  const artistName = "Philipp Straub";
  const bandsintownUrl = `https://rest.bandsintown.com/artists/${encodeURIComponent(artistName)}/events?app_id=philipp_straub`;

  const fallbackEvents = [
    {
      datetime: "2026-06-18T22:00:00",
      venue: { name: "Pacha Club", city: "Ibiza", country: "Spain" },
      offers: [{ type: "Tickets", url: "https://pacha.com", status: "available" }]
    },
    {
      datetime: "2026-07-04T18:00:00",
      venue: { name: "FIVE Beach", city: "Dubai", country: "United Arab Emirates" },
      offers: [{ type: "Tickets", url: "https://fivehotelsandresorts.com", status: "available" }]
    },
    {
      datetime: "2026-08-15T20:00:00",
      venue: { name: "Flex Terrace", city: "Vienna", country: "Austria" },
      offers: []
    }
  ];

  function getCountryCodeFallback(countryName) {
    const mapping = {
      "Spain": "ESP",
      "United Arab Emirates": "UAE",
      "Austria": "AUT",
      "Germany": "GER",
      "United Kingdom": "GBR",
      "United States": "USA",
      "Switzerland": "SUI"
    };
    return mapping[countryName] || countryName.substring(0, 3).toUpperCase();
  }

  function formatEventDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const standardMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = standardMonths[date.getMonth()];
    return `${day} / ${month}`;
  }

  function translateDynamicNodes(lang) {
    if (!gigsList) return;
    gigsList.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
  }

  function renderEvents(events) {
    if (!gigsList) return;
    gigsList.innerHTML = '';

    if (events.length === 0) {
      gigsList.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 24px; color: var(--color-text-muted);" data-i18n="gigs_no_events">
            No upcoming tour dates scheduled.
          </td>
        </tr>
      `;
      return;
    }

    events.forEach(evt => {
      const dateStr = formatEventDate(evt.datetime);
      const venueName = evt.venue.name;
      const city = evt.venue.city;
      const country = evt.venue.country;
      const countryCode = country.length === 2 ? country : getCountryCodeFallback(country);
      
      const hasTickets = evt.offers && evt.offers.length > 0 && evt.offers[0].url;
      const ticketUrl = hasTickets ? evt.offers[0].url : 'https://ra.co/dj/philippstraub';
      const statusTextKey = hasTickets ? "gigs_status_tickets" : "gigs_status_free";
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="gig-date">${dateStr}</td>
        <td class="gig-venue">${venueName}</td>
        <td class="gig-loc">${city}, ${countryCode}</td>
        <td>
          <a href="${ticketUrl}" target="_blank" class="status-pill active" style="text-decoration: none; display: inline-block;" data-i18n="${statusTextKey}">
            TICKETS
          </a>
        </td>
      `;
      gigsList.appendChild(tr);
    });

    const activeLang = localStorage.getItem('preferred-lang') || 'de';
    translateDynamicNodes(activeLang);
  }

  async function fetchTourDates() {
    try {
      const response = await fetch(bandsintownUrl);
      if (!response.ok) throw new Error("API error");
      const events = await response.json();
      
      if (events && Array.isArray(events) && events.length > 0) {
        renderEvents(events);
      } else {
        renderEvents(fallbackEvents);
      }
    } catch (err) {
      console.warn("Bandsintown fetch failed, using local fallback dates:", err);
      renderEvents(fallbackEvents);
    }
  }

  fetchTourDates();

  // Load preferred language or default to German ('de')
  const savedLang = localStorage.getItem('preferred-lang') || 'de';
  setLanguage(savedLang);
});
