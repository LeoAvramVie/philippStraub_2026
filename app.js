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
      alert("INITIATING B2B DOWNLOAD PACKAGE...\nphilipp_straub_epk_2026.zip [14.5 MB]");
    });
  }
  
  if (riderBtn) {
    riderBtn.addEventListener('click', () => {
      alert("INITIATING TECHNICAL RIDER DOWNLOAD...\nphilipp_straub_stage_rider_2026.pdf [1.2 MB]");
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
});
