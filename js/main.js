/**
 * ALAN XAVIOUR — PORTFOLIO CLIENT ENGINE
 * Ultra-fast, Vanilla JS with zero external dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------------
  // 1. Theme Management (Dark / Light)
  // -------------------------------------------------------------
  const themeBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('alan_theme') || 'dark';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('alan_theme', theme);
  }

  setTheme(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme} theme`);
    });
  }

  // -------------------------------------------------------------
  // 2. Mobile Menu Toggle
  // -------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // -------------------------------------------------------------
  // 3. Typewriter Effect
  // -------------------------------------------------------------
  const typingEl = document.getElementById('typed-text');
  if (typingEl) {
    const words = [
      'MCA Candidate & Developer',
      'PHP & MySQL Specialist',
      'Web Application Builder',
      'Cybersecurity & Cloud Enthusiast',
      'Problem Solver & Team Leader'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        typingEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 1800; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // -------------------------------------------------------------
  // 4. Ambient Interactive Canvas
  // -------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 45; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  // -------------------------------------------------------------
  // 5. Animated Number Counters
  // -------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let counted = false;

  function runCounters() {
    statNumbers.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 1500;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target + suffix;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current) + suffix;
        }
      }, stepTime);
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        runCounters();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats-row');
  if (statsSection) {
    observer.observe(statsSection);
  }

  // -------------------------------------------------------------
  // 6. Active Nav Link on Scroll
  // -------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  });

  // -------------------------------------------------------------
  // 7. Toast Notification Utility
  // -------------------------------------------------------------
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // -------------------------------------------------------------
  // 8. Clipboard Copy Functionality
  // -------------------------------------------------------------
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied to clipboard: ${textToCopy}`);
      }).catch(() => {
        showToast(`Selected: ${textToCopy}`);
      });
    });
  });

  // -------------------------------------------------------------
  // 9. Resume Modal Handlers
  // -------------------------------------------------------------
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('[data-open-resume]');
  const closeResumeBtns = document.querySelectorAll('[data-close-resume]');

  if (resumeModal) {
    openResumeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        resumeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    closeResumeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // -------------------------------------------------------------
  // 10. Contact Form Submission (mailto helper)
  // -------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all fields.');
        return;
      }

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Hello Alan,\n\n${message}\n\nFrom: ${name} (${email})`);
      const mailtoUrl = `mailto:alanxaviour02@gmail.com?subject=${subject}&body=${body}`;

      showToast('Opening your email client to send message...');
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }
});
