/* ==========================================================================
   MAIN JAVASCRIPT - SURCO JUAN PALMA PLATAFORMA WEB
   ========================================================================== */

// Si window.SURCO_API_BASE_URL está definido explícitamente (ej. GitHub Pages
// apuntando a un backend en otro dominio), se respeta ese valor.
// Si no, y la página se sirve desde uno de los puertos típicos de un
// servidor estático local (python -m http.server, Live Server, etc.), se
// asume que el backend corre aparte en localhost:8080.
// En cualquier otro caso (ej. Azure App Service sirviendo el mismo .jar
// que expone la API), se usa cadena vacía = mismo origen que la página.
const LOCAL_STATIC_DEV_PORTS = ['8000', '5500', '5173'];
const API_BASE_URL = window.SURCO_API_BASE_URL !== undefined
  ? window.SURCO_API_BASE_URL
  : (LOCAL_STATIC_DEV_PORTS.includes(window.location.port) ? 'http://localhost:8080' : '');

document.addEventListener('DOMContentLoaded', () => {

  // 0. FILTRADO DE CARACTERES EN VIVO (coincide con las validaciones del backend)
  const SOLO_LETRAS = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g;
  const SOLO_DIGITOS = /[^0-9]/g;
  const SOLO_UBICACION = /[^A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9°#./,\- ]/g;

  function limitarCaracteres(selector, regex) {
    document.querySelectorAll(selector).forEach(input => {
      input.addEventListener('input', () => {
        const cursor = input.selectionStart;
        const antes = input.value.length;
        input.value = input.value.replace(regex, '');
        const despues = input.value.length;
        if (cursor !== null) {
          input.setSelectionRange(cursor - (antes - despues), cursor - (antes - despues));
        }
      });
    });
  }

  limitarCaracteres('.only-letters', SOLO_LETRAS);
  limitarCaracteres('.only-digits', SOLO_DIGITOS);
  limitarCaracteres('.only-location', SOLO_UBICACION);

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
      issuesCountText.textContent = `Mostrando ${filtered.length} problema${filtered.length === 1 ? '' : 's'}`;
    }

    issuesListContainer.innerHTML = filtered.map(issue => `
      <div class="issue-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
          <div>
            <span style="font-size: 0.8rem; color: var(--primary-navy); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">
              ${issue.sectorName}
            </span>
            <h4 style="font-size: 1.25rem; font-weight: 800; color: var(--primary-dark); margin: 0.25rem 0;">
              ${issue.title}
            </h4>
          </div>

          <span class="badge-status ${issue.isOfficial ? 'badge-priorizado' : 'badge-diagnostico'}">
            ${issue.isOfficial ? 'Plan de Gobierno' : 'Reporte Vecinal'}
          </span>
        </div>

        <div class="issue-block issue-block-problema">
          <strong>🟥 Problema Detectado</strong>
          <p>${issue.description}</p>
        </div>

        ${issue.attachmentUrl ? `
          <div style="margin-bottom: 1rem;">
            ${issue.attachmentType === 'VIDEO'
              ? `<video src="${issue.attachmentUrl}" controls style="width:100%; max-height:320px; border-radius: var(--radius-sm); background:#000;"></video>`
              : `<img src="${issue.attachmentUrl}" alt="Evidencia del reporte" style="width:100%; max-height:320px; object-fit:cover; border-radius: var(--radius-sm);" />`
            }
          </div>
        ` : ''}

        <div class="issue-block issue-block-propuesta">
          <strong>🟨 ¿Qué Propone Juan Palma? — <span style="color: var(--accent-gold);">${issue.programName}</span></strong>
          <p>${issue.proposedSolution}</p>
        </div>

        ${issue.implementation && issue.implementation.length ? `
          <div class="issue-block issue-block-implementacion">
            <strong>🟩 ¿Cómo se Implementará?</strong>
            <ul class="issue-implementation-list">
              ${issue.implementation.map(step => `<li><i data-lucide="circle-check-big"></i><span>${step}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  }

  renderSectorsSidebar();
  renderIssuesList();

  // Trae los reportes vecinales reales desde el backend y los agrega a la
  // lista (los 9 problemas oficiales de surcoIssuesData.js se mantienen).
  async function cargarReportesBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/issues/approved`);

    if (!res.ok) {
      console.error('Error al obtener reportes aprobados:', res.status);
      return;
    }

    const data = await res.json();

    const reportes = Array.isArray(data)
      ? data
      : (data.issues || []);

    const sectorPorId = Object.fromEntries(
      surcoSectors.map(s => [s.id, s.name])
    );

    const nuevos = reportes.map(r => ({
      id: `VECINAL-${r.id}`,
      sectorId: r.sector,
      sectorName: sectorPorId[r.sector] || r.sector || "Otro",

      title: r.title,

      description:
        `${r.description}${r.location
          ? ' (Ubicación: ' + r.location + ')'
          : ''}`,

      programName: "En Evaluación Técnica",

      proposedSolution:
        "La brigada técnica de Juan Palma evaluará esta incidencia para su atención dentro de los primeros 100 días de gestión.",

      implementation: [],

      isOfficial: false,

      attachmentUrl: r.attachmentPath ? `${API_BASE_URL}/${r.attachmentPath}` : null,
      attachmentType: r.attachmentType || null
    }));

    // Mantener los 9 problemas oficiales
    // y agregar solamente los reportes APROBADOS.
    surcoIssues = surcoIssues
      .filter(i => i.isOfficial)
      .concat(nuevos);

    renderSectorsSidebar();
    renderIssuesList();

  } catch (err) {
    console.error('No se pudieron cargar los reportes aprobados:', err);

    // Si el backend no está disponible,
    // se mantienen los 9 problemas oficiales.
  }
}
  cargarReportesBackend();

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

        <div style="display: flex; align-items: center; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid #E2E8F0; font-size: 0.85rem; color: var(--text-muted);">
          <i data-lucide="megaphone"></i> <span>Anuncio de campaña</span>
        </div>
      </div>
    `).join('');
  }

  const videosGrid = document.getElementById('videos-grid');
  if (videosGrid) {
    videosGrid.innerHTML = campaignVideos.map(video => `
      <div class="glass-card" style="overflow: hidden;">
    <div style="position: relative; height: 180px; background: #000; border-radius: 12px; overflow: hidden;">
  <video
    controls
    preload="metadata"
    style="
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    "
  >
    <source src="${video.video}" type="video/mp4">
    Tu navegador no soporta video.
  </video>

  <span style="
      position:absolute;
      bottom:8px;
      right:8px;
      background:rgba(0,0,0,.75);
      color:#fff;
      padding:.2rem .5rem;
      border-radius:4px;
      font-size:.75rem;">
      ${video.duration}
  </span>
</div>
        <div style="padding: 1.25rem;">
          <span class="badge badge-navy" style="font-size: 0.75rem;">${video.tag}</span>
          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--primary-dark); margin: 0.4rem 0;">${video.title}</h4>
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
    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = volunteerForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const payload = {
        firstName: document.getElementById('vol-firstname').value,
        lastName: document.getElementById('vol-lastname').value,
        dni: document.getElementById('vol-dni').value,
        phone: document.getElementById('vol-phone').value,
        email: document.getElementById('vol-email').value,
        sector: document.getElementById('vol-sector').value,
        role: document.getElementById('vol-role').value
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/personeros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data.error || 'No se pudo registrar tu inscripción.');
        }

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
      } catch (err) {
        alert(err.message || 'Ocurrió un error al registrar tu inscripción. Intenta nuevamente.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
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

  const ALLOWED_ATTACHMENT_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  const MAX_ATTACHMENT_MB = 25;

  const reportAttachmentInput = document.getElementById('report-attachment');
  const reportAttachmentError = document.getElementById('report-attachment-error');

  if (reportAttachmentInput) {
    reportAttachmentInput.addEventListener('change', () => {
      reportAttachmentError.style.display = 'none';
      const file = reportAttachmentInput.files[0];
      if (!file) return;

      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
        reportAttachmentError.textContent = 'Solo se permiten imágenes (JPG, PNG, WEBP) o videos (MP4, MOV, WEBM).';
        reportAttachmentError.style.display = 'block';
        reportAttachmentInput.value = '';
        return;
      }
      if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
        reportAttachmentError.textContent = `El archivo supera el máximo de ${MAX_ATTACHMENT_MB}MB.`;
        reportAttachmentError.style.display = 'block';
        reportAttachmentInput.value = '';
      }
    });
  }

  if (reportIssueForm) {
    reportIssueForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = reportIssueForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData();
      formData.append('reporterFirstName', document.getElementById('report-firstname').value);
      formData.append('reporterLastName', document.getElementById('report-lastname').value);
      formData.append('reporterDni', document.getElementById('report-dni').value);
      formData.append('title', document.getElementById('report-title').value);
      formData.append('sector', document.getElementById('report-sector').value);
      formData.append('location', document.getElementById('report-location').value);
      formData.append('description', document.getElementById('report-description').value);

      const file = reportAttachmentInput ? reportAttachmentInput.files[0] : null;
      if (file) formData.append('attachment', file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/issues`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data.error || 'No se pudo registrar tu reporte.');
        }

        await cargarReportesBackend();

        reportIssueForm.classList.add('hidden');
        reportSuccessMsg.classList.remove('hidden');

        setTimeout(() => {
          reportIssueForm.reset();
          reportIssueForm.classList.remove('hidden');
          reportSuccessMsg.classList.add('hidden');
          closeReportModal();
        }, 2000);
      } catch (err) {
        alert(err.message || 'Ocurrió un error al registrar tu reporte. Intenta nuevamente.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // 8. PLAN DE GOBIERNO: el botón ahora es un enlace real a Google Drive (sin JS necesario)

  // Refresh Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});
