document.addEventListener('DOMContentLoaded', () => {
  // 0. Botão CTA do Header: só aparece quando o formulário/barra do Hero sai do ecrã do utilizador
  const siteHeader = document.querySelector('.site-header');
  const heroBookingForm = document.getElementById('quickBookingForm');
  if (siteHeader) {
    const updateHeaderCta = () => {
      if (heroBookingForm) {
        const rect = heroBookingForm.getBoundingClientRect();
        siteHeader.classList.toggle('header-cta-visible', rect.bottom <= 72);
      } else {
        siteHeader.classList.toggle('header-cta-visible', window.scrollY > 280);
      }
    };
    window.addEventListener('scroll', updateHeaderCta, { passive: true });
    window.addEventListener('resize', updateHeaderCta, { passive: true });
    updateHeaderCta();
  }

  // 1. Carrossel da Moradia com Setas e Indicadores
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    if (slides.length === 0) return;
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  if (slides.length > 0) {
    slideInterval = setInterval(nextSlide, 4000);

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearInterval(slideInterval);
        nextSlide();
        slideInterval = setInterval(nextSlide, 4000);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearInterval(slideInterval);
        prevSlide();
        slideInterval = setInterval(nextSlide, 4000);
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(idx);
        slideInterval = setInterval(nextSlide, 4000);
      });
    });

    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
      carousel.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 4000);
      });
    }
  }

  // 2. Widget Interativo de Comparação "Antes vs Depois"
  const compareWidget = document.getElementById('compareWidget');
  const compareSlider = document.getElementById('compareSlider');
  const compareOverlay = document.getElementById('compareOverlay');
  const compareHandle = document.getElementById('compareHandle');

  if (compareWidget && compareSlider && compareOverlay && compareHandle) {
    const updateWidgetWidth = () => {
      const w = compareWidget.offsetWidth;
      compareWidget.style.setProperty('--widget-width', `${w}px`);
    };

    const updateCompare = (val) => {
      compareOverlay.style.width = `${val}%`;
      compareHandle.style.left = `${val}%`;
      compareSlider.setAttribute('aria-valuenow', val);
    };

    updateWidgetWidth();
    window.addEventListener('resize', updateWidgetWidth);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => updateWidgetWidth());
      ro.observe(compareWidget);
    }

    compareSlider.addEventListener('input', (e) => {
      updateCompare(e.target.value);
    });

    // Iniciar a 50%
    updateCompare(50);
  }

  // 3. Acordeão de FAQ com Acessibilidade WAI-ARIA
  const faqButtons = document.querySelectorAll('.faq-button');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const content = item.querySelector('.faq-content');
      const isActive = item.classList.contains('active');

      // Fechar outros
      document.querySelectorAll('.faq-item').forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-button');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          const otherContent = other.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      // Alternar atual
      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Recalcular altura de FAQ ativa em caso de redimensionamento de janela ou rotação
  window.addEventListener('resize', () => {
    const activeContent = document.querySelector('.faq-item.active .faq-content');
    if (activeContent) {
      activeContent.style.maxHeight = activeContent.scrollHeight + 'px';
    }
  });

  // 4. Barra de Reserva Rápida (Inicialização com datas válidas e encaminhamento)
  const quickBookingForm = document.getElementById('quickBookingForm');
  const quickCheckin = document.getElementById('quickCheckin');
  const quickCheckout = document.getElementById('quickCheckout');
  const quickGuests = document.getElementById('quickGuests');

  if (quickCheckin && quickCheckout) {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextWeekPlus2 = new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().split('T')[0];

    quickCheckin.value = formatDate(nextWeek);
    quickCheckin.min = formatDate(today);
    quickCheckout.value = formatDate(nextWeekPlus2);
    quickCheckout.min = formatDate(nextWeek);

    quickCheckin.addEventListener('change', () => {
      const minCo = new Date(new Date(quickCheckin.value).getTime() + 24 * 60 * 60 * 1000);
      quickCheckout.min = formatDate(minCo);
      if (new Date(quickCheckout.value) <= new Date(quickCheckin.value)) {
        quickCheckout.value = formatDate(minCo);
      }
    });
  }

  if (quickBookingForm) {
    quickBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkin = quickCheckin?.value || '';
      const checkout = quickCheckout?.value || '';
      const guests = quickGuests?.value || '2';
      const params = new URLSearchParams({ checkin, checkout, guests });
      window.location.href = `reservas.html?${params.toString()}`;
    });
  }

  // 5. Formulário de Dúvidas ao lado das FAQ
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = document.getElementById('contactFeedback');
      if (feedback) {
        feedback.style.display = 'block';
        contactForm.reset();
        setTimeout(() => {
          feedback.style.display = 'none';
        }, 5000);
      }
    });
  }

  // 6. Filtros Interativos das Atividades / Experiências (com navegação por teclado)
  const activityTabs = document.querySelectorAll('.activity-tab-btn');
  const activityCards = document.querySelectorAll('.activity-card');

  function selectTab(btn) {
    activityTabs.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const cat = btn.getAttribute('data-category');
    activityCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (cat === 'todos' || cardCat === cat) {
        card.style.display = 'flex';
        card.style.animation = 'fadeInCard 0.35s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  }

  activityTabs.forEach((btn, idx) => {
    btn.addEventListener('click', () => selectTab(btn));

    btn.addEventListener('keydown', (e) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (idx + 1) % activityTabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (idx - 1 + activityTabs.length) % activityTabs.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = activityTabs.length - 1;
      }

      if (targetIndex >= 0) {
        e.preventDefault();
        activityTabs[targetIndex].focus();
        selectTab(activityTabs[targetIndex]);
      }
    });
  });

  // 7. Opiniões dos Hóspedes: Rotação Contínua com Drag-to-Scroll Natural, Suporte de Teclado e Gestão Eficiente de Recursos
  const reviewsWrapper = document.getElementById('reviewsTickerWrapper');
  const reviewsTrack = document.getElementById('reviewsTickerTrack');

  if (reviewsWrapper && reviewsTrack) {
    // Clonar nós para criar o loop contínuo infinito perfeito
    const cards = Array.from(reviewsTrack.children);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button, input').forEach(el => el.setAttribute('tabindex', '-1'));
      reviewsTrack.appendChild(clone);
    });

    let offset = 0;
    const speed = 0.55; // pixels por frame (~33px por segundo)
    let isHovered = false;
    let isDragging = false;
    let isVisible = true;
    let startX = 0;
    let dragStartOffset = 0;
    let rafId = null;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cachedHalfWidth = reviewsTrack.scrollWidth / 2;
    function getHalfWidth() {
      if (!cachedHalfWidth || cachedHalfWidth <= 0) {
        cachedHalfWidth = reviewsTrack.scrollWidth / 2;
      }
      return cachedHalfWidth;
    }

    const refreshWidth = () => {
      cachedHalfWidth = reviewsTrack.scrollWidth / 2;
    };
    window.addEventListener('resize', refreshWidth);
    window.addEventListener('load', refreshWidth);

    // Otimização de performance: suspender RAF quando fora da viewport
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      observer.observe(reviewsWrapper);
    }

    function animate() {
      if (!isHovered && !isDragging && isVisible && !prefersReducedMotion) {
        offset += speed;
        const halfWidth = getHalfWidth();
        if (halfWidth > 0 && offset >= halfWidth) {
          offset -= halfWidth;
        }
        reviewsTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Pausar rotação ao passar o rato ou focar via teclado (WCAG 2.2.2 Pause)
    reviewsWrapper.addEventListener('mouseenter', () => { isHovered = true; });
    reviewsWrapper.addEventListener('mouseleave', () => {
      if (!isDragging) isHovered = false;
    });
    reviewsWrapper.addEventListener('focusin', () => { isHovered = true; });
    reviewsWrapper.addEventListener('focusout', () => {
      if (!isDragging) isHovered = false;
    });

    // Navegação por teclado dentro da secção de avaliações
    reviewsWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        offset += 60;
        const halfWidth = getHalfWidth();
        if (halfWidth > 0 && offset >= halfWidth) offset -= halfWidth;
        reviewsTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        offset -= 60;
        const halfWidth = getHalfWidth();
        if (halfWidth > 0 && offset < 0) offset += halfWidth;
        reviewsTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;
      }
    });

    // Suporte a Dragging (Mouse e Touch com recuperação e window listeners)
    const onDragStart = (clientX) => {
      isDragging = true;
      startX = clientX;
      dragStartOffset = offset;
      reviewsWrapper.classList.add('is-dragging');
    };

    const onDragMove = (clientX) => {
      if (!isDragging) return;
      const diff = startX - clientX;
      offset = dragStartOffset + diff;
      const halfWidth = getHalfWidth();
      if (halfWidth > 0) {
        while (offset < 0) offset += halfWidth;
        while (offset >= halfWidth) offset -= halfWidth;
      }
      reviewsTrack.style.transform = `translate3d(-${offset}px, 0, 0)`;
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      reviewsWrapper.classList.remove('is-dragging');
      setTimeout(() => { isHovered = false; }, 800);
    };

    reviewsWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Apenas clique primário (evita arrasto no botão direito)
      onDragStart(e.clientX);
    });
    reviewsWrapper.addEventListener('dragstart', (e) => e.preventDefault());
    window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
    window.addEventListener('mouseup', onDragEnd);

    reviewsWrapper.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length > 0) onDragMove(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('touchcancel', onDragEnd);
  }

});
