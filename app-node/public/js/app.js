
const API_BASE = '';


async function apiFetch(path) {
    const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('fr-FR');
}


function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const sections = ['hero', 'services', 'stats', 'endpoints', 'contact'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}


async function checkHealth() {
  const el = document.getElementById('apiStatus');
  const txt = document.getElementById('statusText');
  try {
    const data = await apiFetch('/api/health');
    el.classList.add('ok');
    txt.textContent = data.status === 'OK' ? 'API en ligne' : data.status;


    const up = Math.round(data.uptime);
    const metricUp = document.getElementById('metricUptime');
    if (metricUp) metricUp.textContent = up.toLocaleString('fr-FR');


    const statUp = document.getElementById('statUptime');
    if (statUp) statUp.textContent = up.toLocaleString('fr-FR');
  } catch {
    el.classList.add('err');
    txt.textContent = 'API hors ligne';
  }
}

async function loadStats() {
  try {
    const data = await apiFetch('/api/stats');

    const ids = {
      metricContacts: data.totalContacts,
      metricServices: data.totalServices,
      statContacts:   data.totalContacts,
      statServices2:  data.totalServices,
    };
    Object.entries(ids).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });

    const lu = document.getElementById('statLastUpdate');
    if (lu) lu.textContent = formatTime(data.lastUpdate);


    const badge = document.getElementById('statBadge');
    if (badge) {
      badge.textContent = '✓ Opérationnel';
      badge.classList.add('ok');
    }
  } catch {
    const badge = document.getElementById('statBadge');
    if (badge) { badge.textContent = '✗ Erreur'; badge.classList.add('err'); }
  }
}

async function loadServices() {
  const grid = document.getElementById('servicesGrid');
  try {
    const services = await apiFetch('/api/services');
    grid.innerHTML = '';

    if (!services.length) {
      grid.innerHTML = '<p style="color:#888">Aucun service disponible.</p>';
      return;
    }

    services.forEach(s => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="service-card-id">Service #${s.id}</div>
        <h3>${escHtml(s.name)}</h3>
        <p>${escHtml(s.description)}</p>
        <div class="service-footer">
          <span class="service-price">${s.price ? formatPrice(s.price) : 'Sur devis'}</span>
          <span class="service-tag">Disponible</span>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch {
    grid.innerHTML = `
      <div style="grid-column:1/-1;background:white;border-radius:8px;padding:2rem;text-align:center;color:#e53e3e;box-shadow:0 2px 10px rgba(0,0,0,.08)">
        Impossible de charger les services. Vérifiez que l'API est démarrée.
      </div>`;
  }
}


async function submitContact() {
  const alert  = document.getElementById('formAlert');
  const btn    = document.getElementById('submitBtn');

  const fields = { name: 'name', email: 'email', phone: 'phone', subject: 'subject', message: 'message' };
  const body   = {};
  Object.entries(fields).forEach(([key, id]) => { body[key] = document.getElementById(id)?.value.trim() || ''; });


  if (!body.name || !body.email || !body.subject || !body.message) {
    showAlert(alert, 'error', '⚠ Veuillez remplir tous les champs obligatoires (*).');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    showAlert(alert, 'error', '⚠ Adresse email invalide.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  try {
    const res = await fetch(API_BASE + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      showAlert(alert, 'success', `✓ Message envoyé avec succès ! (réf. #${data.id})`);
      ['name','email','phone','subject','message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      loadStats();
    } else {
      showAlert(alert, 'error', `✗ Erreur : ${data.error || 'Réponse inattendue du serveur.'}`);
    }
  } catch {
    showAlert(alert, 'error', '✗ Impossible de joindre l\'API. Vérifiez votre connexion.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Envoyer le message';
  }
}

function showAlert(el, type, msg) {
  el.className = `form-alert ${type}`;
  el.textContent = msg;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (type === 'success') setTimeout(() => el.classList.add('hidden'), 6000);
}


function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}


document.addEventListener('DOMContentLoaded', () => {
  initNav();
  checkHealth();
  loadStats();
  loadServices();
});