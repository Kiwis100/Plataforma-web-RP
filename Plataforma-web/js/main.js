/* ==========================================================================
   MAIN JAVASCRIPT - SURCO JUAN PALMA PLATAFORMA WEB
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. MOBILE MENU TOGGLE (Hamburguesa)
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  function openMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.add('open');
    if (navOverlay) navOverlay.classList.add('open');
    document.body.classList.add('nav-open');
    if (mobileToggle) {
      mobileToggle.innerHTML = '<i data-lucide="x"></i>';
      mobileToggle.setAttribute('aria-label', 'Cerrar Menú');
      if (window.lucide) lucide.createIcons();
    }
  }

  function closeMobileMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (mobileToggle) {
      mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
      mobileToggle.setAttribute('aria-label', 'Abrir Menú');
      if (window.lucide) lucide.createIcons();
    }
  }

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMobileMenu);
  }

  // Cerrar el menú al hacer clic en cualquier link de navegación
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Cerrar el menú si la ventana vuelve a tamaño de escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992) closeMobileMenu();
  });

  // 2. RENDER PROPUESTAS POR EJES
  const proposalsNav = document.getElementById('proposals-nav');
  const proposalDetailBox = document.getElementById('proposal-detail-box');
  let currentProposalId = proposalsData[0].id;

  function renderProposalsNav() {
    if (!proposalsNav) return;
    proposalsNav.innerHTML = proposalsData.map(p => `
      <button class="proposal-tab-btn ${p.id === currentProposalId ? 'active' : ''}" data-id="${p.id}">
        <i data-lucide="${p.icon}"></i>
        <span>${p.title}</span>
      </button>
    `).join('');

    proposalsNav.querySelectorAll('.proposal-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentProposalId = btn.getAttribute('data-id');
        renderProposalsNav();
        renderProposalDetail();
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  function renderProposalDetail() {
    if (!proposalDetailBox) return;
    const proposal = proposalsData.find(p => p.id === currentProposalId);
    if (!proposal) return;

    proposalDetailBox.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap;">
        <div style="background: ${proposal.color}; padding: 0.9rem; border-radius: 14px; color: #FFF; display: flex; flex-shrink: 0;">
          <i data-lucide="${proposal.icon}" style="width: 32px; height: 32px;"></i>
        </div>
        <div style="flex: 1; min-width: 240px;">
          <h3 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-dark); margin: 0;">${proposal.title}</h3>
          <span style="color: ${proposal.accent}; font-weight: 600; font-size: 1rem;">${proposal.subtitle}</span>
          <p style="margin-top: 1.25rem; font-size: 1.1rem; color: var(--text-main); line-height: 1.7;">${proposal.summary}</p>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }

  renderProposalsNav();
  renderProposalDetail();

  // 3. MAPA DE PROBLEMAS DE SURCO
  const sectorsListContainer = document.getElementById('sectors-list');
  const issuesListContainer = document.getElementById('issues-list-container');
  const issuesCountText = document.getElementById('issues-count-text');
  let activeSectorFilter = 'all';

  function renderSectorsSidebar() {
    if (!sectorsListContainer) return;
    const allCount = surcoIssues.length;

    let html = `
      <button class="sector-btn ${activeSectorFilter === 'all' ? 'active' : ''}" data-sector="all">
        📋 Todos los Problemas (${allCount} casos)
      </button>
    `;

    html += surcoSectors.map(s => {
      const count = surcoIssues.filter(i => i.sectorId === s.id).length;
      return `
        <button class="sector-btn ${activeSectorFilter === s.id ? 'active' : ''}" data-sector="${s.id}">
          <i data-lucide="map-pin" style="display: inline; margin-right: 6px;"></i>
          ${s.name} (${count})
        </button>
      `;
    }).join('');

    sectorsListContainer.innerHTML = html;

    sectorsListContainer.querySelectorAll('.sector-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSectorFilter = btn.getAttribute('data-sector');
        renderSectorsSidebar();
        renderIssuesList();
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  function renderIssuesList() {
    if (!issuesListContainer) return;

    const filtered = activeSectorFilter === 'all' 
      ? surcoIssues 
      : surcoIssues.filter(i => i.sectorId === activeSectorFilter);

    if (issuesCountText) {
      issuesCountText.textContent = `Mostrando ${filtered.length} reportes vecinales`;
    }

    issuesListContainer.innerHTML = filtered.map(issue => `
      <div class="issue-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div>
            <span style="font-size: 0.8rem; color: var(--primary-navy); font-weight: 700;">
              ${issue.sectorName} • ${issue.category}
            </span>
            <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--primary-dark); margin: 0.25rem 0;">
              ${issue.title}
            </h4>
            <p style="font-size: 0.875rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;">
              <i data-lucide="map-pin" style="color: #EF4444; width: 14px;"></i>
              ${issue.location}
            </p>
          </div>

          <span class="badge-status badge-${issue.statusBadge}">
            ${issue.status}
          </span>
        </div>

        <p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 1rem; line-height: 1.5;">
          "${issue.description}"
        </p>

        <div style="background: #F0F9FF; padding: 1rem; border-radius: var(--radius-sm); border-left: 4px solid var(--primary-blue); margin-bottom: 1rem;">
          <strong style="color: var(--primary-navy); font-size: 0.875rem; display: block; margin-bottom: 0.3rem;">
            💡 Solución Propuesta por Juan Palma:
          </strong>
          <p style="font-size: 0.9rem; color: #1E3A8A; margin: 0;">${issue.proposedSolution}</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted);">
          <span>Reportado: ${issue.dateReported}</span>

          <button class="btn btn-outline upvote-btn" data-id="${issue.id}" style="padding: 0.4rem 0.9rem; font-size: 0.82rem;">
            <i data-lucide="thumbs-up"></i>
            <span>Apoyar Solución (${issue.upvotes})</span>
          </button>
        </div>
      </div>
    `).join('');

    issuesListContainer.querySelectorAll('.upvote-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = surcoIssues.find(i => i.id === id);
        if (item) {
          item.upvotes += 1;
          renderIssuesList();
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  renderSectorsSidebar();
  renderIssuesList();

  // 4. RENDER AGENDA, NOTICIAS, VIDEOS
  const agendaGrid = document.getElementById('agenda-grid');
  if (agendaGrid) {
    agendaGrid.innerHTML = agendaEvents.map(event => `
      <div class="glass-card" style="padding: 1.75rem; border-left: 5px solid var(--accent-gold);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="badge badge-gold" style="font-size: 0.75rem;">${event.type}</span>
          <span style="font-size: 0.8rem; color: var(--primary-navy); font-weight: 700;">${event.sector}</span>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.75rem;">${event.title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">${event.description}</p>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="calendar"></i> <span><strong>Fecha:</strong> ${event.date}</span></div>
          <div style="display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="clock"></i> <span><strong>Hora:</strong> ${event.time}</span></div>
          <div style="display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="map-pin"></i> <span>${event.location}</span></div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #E2E8F0;">
          <span style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem;"><i data-lucide="users"></i> ${event.attendees} asistirán</span>
          <button class="btn btn-outline rsvp-btn" style="padding: 0.45rem 1rem; font-size: 0.85rem;">Asistiré</button>
        </div>
      </div>
    `).join('');

    agendaGrid.querySelectorAll('.rsvp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('btn-navy');
        btn.classList.toggle('btn-outline');
        btn.innerHTML = btn.classList.contains('btn-navy') ? '<i data-lucide="circle-check-big"></i> ¡Confirmado!' : 'Asistiré';
        if (window.lucide) lucide.createIcons();
      });
    });
  }

  const newsGrid = document.getElementById('news-grid');
  if (newsGrid) {
    newsGrid.innerHTML = campaignNews.map(news => `
      <article class="glass-card" style="overflow: hidden;">
        <img src="${news.image}" alt="${news.title}" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="badge badge-gold" style="font-size: 0.75rem;">${news.category}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${news.readTime}</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.75rem;">${news.title}</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem;">${news.summary}</p>
          <span style="font-size: 0.8rem; color: var(--primary-navy); font-weight: 600;">${news.date}</span>
        </div>
      </article>
    `).join('');
  }

  const videosGrid = document.getElementById('videos-grid');
  if (videosGrid) {
    videosGrid.innerHTML = campaignVideos.map(video => `
      <div class="glass-card" style="overflow: hidden;">
        <div style="position: relative; height: 200px;">
          <img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: rgba(10,25,47,0.4); display: flex; align-items: center; justify-content: center;">
            <div style="background: var(--accent-gold); width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FFF;">
              <i data-lucide="play" style="margin-left: 4px;"></i>
            </div>
          </div>
          <span style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #FFF; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${video.duration}</span>
        </div>
        <div style="padding: 1.25rem;">
          <span class="badge badge-navy" style="font-size: 0.75rem;">${video.tag}</span>
          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary-dark); margin: 0.4rem 0;">${video.title}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${video.views}</span>
        </div>
      </div>
    `).join('');
  }

  // 5. CHATBOT IA ("SurcoIA")
  const aiChatToggleBtn = document.getElementById('ai-chat-toggle-btn');
  const btnOpenSurcoIA = document.getElementById('btn-open-surcoia');
  const heroBtnChat = document.getElementById('hero-btn-chat');
  const aiChatmodal = document.getElementById('ai-chatbot-modal');
  const btnCloseAiChat = document.getElementById('btn-close-ai-chat');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiChatBody = document.getElementById('ai-chat-body');

  function openAIChat() {
    if (aiChatmodal) aiChatmodal.classList.remove('hidden');
  }

  function closeAIChat() {
    if (aiChatmodal) aiChatmodal.classList.add('hidden');
  }

  if (aiChatToggleBtn) aiChatToggleBtn.addEventListener('click', openAIChat);
  if (btnOpenSurcoIA) btnOpenSurcoIA.addEventListener('click', openAIChat);
  if (heroBtnChat) heroBtnChat.addEventListener('click', openAIChat);
  if (btnCloseAiChat) btnCloseAiChat.addEventListener('click', closeAIChat);

  function sendChatMessage(text) {
    if (!text || !aiChatBody) return;

    // Append user message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = text;
    aiChatBody.appendChild(userBubble);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const aiBubble = document.createElement('div');
      aiBubble.className = 'chat-bubble chat-bubble-ai';
      aiBubble.innerHTML = aiResponse;
      aiChatBody.appendChild(aiBubble);
      aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }, 500);
  }

  if (aiChatForm) {
    aiChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = aiChatInput.value.trim();
      if (val) {
        sendChatMessage(val);
        aiChatInput.value = '';
      }
    });
  }

  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      sendChatMessage(q);
    });
  });

  // 6. VOLUNTEER MODAL & CONFETTI
  const volunteerModal = document.getElementById('volunteer-modal');
  const btnOpenVoluntariado = document.getElementById('btn-open-voluntariado');
  const footerBtnVolunteer = document.getElementById('footer-btn-volunteer');
  const btnCloseVolunteer = document.getElementById('btn-close-volunteer');
  const volunteerForm = document.getElementById('volunteer-form');
  const volunteerSuccessMsg = document.getElementById('volunteer-success-msg');

  function openVolunteerModal() {
    if (volunteerModal) volunteerModal.classList.remove('hidden');
  }
  function closeVolunteerModal() {
    if (volunteerModal) volunteerModal.classList.add('hidden');
  }

  if (btnOpenVoluntariado) btnOpenVoluntariado.addEventListener('click', openVolunteerModal);
  if (footerBtnVolunteer) footerBtnVolunteer.addEventListener('click', openVolunteerModal);
  if (btnCloseVolunteer) btnCloseVolunteer.addEventListener('click', closeVolunteerModal);

  if (volunteerForm) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      volunteerForm.classList.add('hidden');
      volunteerSuccessMsg.classList.remove('hidden');

      if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      setTimeout(() => {
        volunteerForm.reset();
        volunteerForm.classList.remove('hidden');
        volunteerSuccessMsg.classList.add('hidden');
        closeVolunteerModal();
      }, 3000);
    });
  }

  // 7. REPORT ISSUE MODAL
  const reportModal = document.getElementById('report-modal');
  const btnOpenReportModal = document.getElementById('btn-open-report-modal');
  const btnCloseReport = document.getElementById('btn-close-report');
  const btnCancelReport = document.getElementById('btn-cancel-report');
  const reportIssueForm = document.getElementById('report-issue-form');
  const reportSuccessMsg = document.getElementById('report-success-msg');

  function openReportModal() { if (reportModal) reportModal.classList.remove('hidden'); }
  function closeReportModal() { if (reportModal) reportModal.classList.add('hidden'); }

  if (btnOpenReportModal) btnOpenReportModal.addEventListener('click', openReportModal);
  if (btnCloseReport) btnCloseReport.addEventListener('click', closeReportModal);
  if (btnCancelReport) btnCancelReport.addEventListener('click', closeReportModal);

  if (reportIssueForm) {
    reportIssueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('report-title').value;
      const sectorId = document.getElementById('report-sector').value;
      const category = document.getElementById('report-category').value;
      const location = document.getElementById('report-location').value;
      const desc = document.getElementById('report-description').value;

      const sectorObj = surcoSectors.find(s => s.id === sectorId);

      const newIssue = {
        id: `ISSUE-${surcoIssues.length + 1}`,
        sectorId: sectorId,
        sectorName: sectorObj.name,
        location: location,
        category: category,
        title: title,
        description: desc,
        status: "Registrado para Diagnóstico",
        statusBadge: "diagnostico",
        proposedSolution: "La brigada técnica de Juan Palma evaluará la zona para su atención en los primeros 100 días.",
        upvotes: 1,
        dateReported: "Hoy"
      };

      surcoIssues.unshift(newIssue);
      renderSectorsSidebar();
      renderIssuesList();

      reportIssueForm.classList.add('hidden');
      reportSuccessMsg.classList.remove('hidden');

      setTimeout(() => {
        reportIssueForm.reset();
        reportIssueForm.classList.remove('hidden');
        reportSuccessMsg.classList.add('hidden');
        closeReportModal();
      }, 2000);
    });
  }

  // 8. PLAN DE GOBIERNO: el botón ahora es un enlace real a Google Drive (sin JS necesario)

  // 9. DONATION SIMULATOR
  const donationAmtBtns = document.querySelectorAll('.donation-amt-btn');
  const customDonationAmt = document.getElementById('custom-donation-amt');
  const displayDonationAmt = document.getElementById('display-donation-amt');
  const donationForm = document.getElementById('donation-form');
  const donationSuccessBox = document.getElementById('donation-success-box');
  const donationSuccessText = document.getElementById('donation-success-text');
  const btnResetDonation = document.getElementById('btn-reset-donation');
  let selectedDonationValue = 20;

  donationAmtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      donationAmtBtns.forEach(b => b.classList.remove('btn-navy'));
      btn.classList.add('btn-navy');
      selectedDonationValue = parseFloat(btn.getAttribute('data-amt'));
      if (customDonationAmt) customDonationAmt.value = '';
      if (displayDonationAmt) displayDonationAmt.textContent = selectedDonationValue;
    });
  });

  if (customDonationAmt) {
    customDonationAmt.addEventListener('input', (e) => {
      if (e.target.value) {
        donationAmtBtns.forEach(b => b.classList.remove('btn-navy'));
        selectedDonationValue = parseFloat(e.target.value);
        if (displayDonationAmt) displayDonationAmt.textContent = selectedDonationValue;
      }
    });
  }

  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const donorName = document.getElementById('donor-name').value;
      const donorDni = document.getElementById('donor-dni').value;

      donationForm.classList.add('hidden');
      donationSuccessBox.classList.remove('hidden');
      if (donationSuccessText) {
        donationSuccessText.innerHTML = `Gracias <strong>${donorName}</strong> (DNI: ${donorDni}) por tu aporte cívico de <strong>S/ ${selectedDonationValue}</strong>. Cuentas claras para un Surco mejor.`;
      }
      if (window.confetti) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    });
  }

  if (btnResetDonation) {
    btnResetDonation.addEventListener('click', () => {
      donationForm.reset();
      donationForm.classList.remove('hidden');
      donationSuccessBox.classList.add('hidden');
    });
  }

  // 10. CONTACT FORM
  const contactForm = document.getElementById('contact-form');
  const contactSuccessMsg = document.getElementById('contact-success-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.classList.add('hidden');
      contactSuccessMsg.classList.remove('hidden');

      setTimeout(() => {
        contactForm.reset();
        contactForm.classList.remove('hidden');
        contactSuccessMsg.classList.add('hidden');
      }, 4000);
    });
  }

  // Refresh Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});
