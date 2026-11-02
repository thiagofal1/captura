(() => {
  'use strict';

  const THEME_STORAGE_KEY = 'captura-theme';
  const themeBtn = document.getElementById('landingThemeToggle');
  const themeIcon = document.getElementById('landingThemeIcon');
  const themeText = document.getElementById('landingThemeText');

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-mode', isLight);
    if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙';
    if (themeText) themeText.textContent = isLight ? 'Claro' : 'Escuro';
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      applyTheme(next);
    });
  }

  // Interactive Hero Mockup — Studio Frame Background Switcher
  const mockCanvasFrame = document.getElementById('mockCanvasFrame');
  const bgButtons = document.querySelectorAll('[data-demo-bg]');

  bgButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const bg = btn.getAttribute('data-demo-bg');
      bgButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (mockCanvasFrame) {
        mockCanvasFrame.className = `mock-canvas-frame studio-bg-${bg}`;
      }
    });
  });

  // Interactive Hero Mockup — Webcam PiP Toggle & Drag
  const demoToggleCamBtn = document.getElementById('demoToggleCamBtn');
  const mockFacecam = document.getElementById('mockFacecam');

  if (demoToggleCamBtn && mockFacecam) {
    demoToggleCamBtn.addEventListener('click', () => {
      const isHidden = mockFacecam.hidden;
      mockFacecam.hidden = !isHidden;
      demoToggleCamBtn.classList.toggle('active', isHidden);
    });

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    mockFacecam.addEventListener('pointerdown', (e) => {
      dragging = true;
      const rect = mockFacecam.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      mockFacecam.setPointerCapture(e.pointerId);
    });

    mockFacecam.addEventListener('pointermove', (e) => {
      if (!dragging || !mockCanvasFrame) return;
      const parentRect = mockCanvasFrame.getBoundingClientRect();
      const camW = mockFacecam.offsetWidth;
      const camH = mockFacecam.offsetHeight;
      let left = e.clientX - parentRect.left - offsetX;
      let top = e.clientY - parentRect.top - offsetY;
      left = Math.max(10, Math.min(parentRect.width - camW - 10, left));
      top = Math.max(10, Math.min(parentRect.height - camH - 10, top));
      mockFacecam.style.left = `${left}px`;
      mockFacecam.style.top = `${top}px`;
      mockFacecam.style.right = 'auto';
      mockFacecam.style.bottom = 'auto';
    });

    mockFacecam.addEventListener('pointerup', () => {
      dragging = false;
    });
  }

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
})();

