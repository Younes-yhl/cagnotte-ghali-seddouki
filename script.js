const GOAL = 10000;
let total = 0;
let people = 0;
let contributions = [];

const totalEl     = document.getElementById('total');
const peopleEl    = document.getElementById('people');
const percentEl   = document.getElementById('percent');
const barEl       = document.getElementById('bar');
const historyEl   = document.getElementById('history');
const nameInput   = document.getElementById('name');
const amountInput = document.getElementById('amount');
const addBtn      = document.getElementById('add');

// ── Sauvegarde & chargement (localStorage) ──

function save() {
  localStorage.setItem('cagnotte_contributions', JSON.stringify(contributions));
}

function load() {
  const data = localStorage.getItem('cagnotte_contributions');
  if (!data) return;
  contributions = JSON.parse(data);
  contributions.forEach(c => {
    total  += c.amount;
    people += 1;
  });
}

// ── Rendu de l'historique ──

function renderHistory() {
  historyEl.innerHTML = '';

  if (contributions.length === 0) {
    historyEl.innerHTML = '<p>Aucune contribution.</p>';
    return;
  }

  // Les plus récentes en premier
  [...contributions].reverse().forEach(c => {
    const card = document.createElement('div');
    card.className = 'contribution';
    card.innerHTML = `
      <span class="name">👤 ${c.name}</span>
      <span class="amount">+${c.amount.toLocaleString('fr-FR')} DH</span>
    `;
    historyEl.appendChild(card);
  });
}

// ── Mise à jour de l'affichage ──

function update() {
  const percent = Math.min(Math.round((total / GOAL) * 100), 100);
  totalEl.textContent   = total.toLocaleString('fr-FR') + ' DH';
  peopleEl.textContent  = people;
  percentEl.textContent = percent + '%';
  barEl.style.width     = percent + '%';
}

// ── Ajout d'une contribution ──

function addContribution() {
  const name   = nameInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!name)              { shake(nameInput);   return; }
  if (!amount || amount <= 0) { shake(amountInput); return; }

  contributions.push({ name, amount });
  total  += amount;
  people += 1;

  save();
  renderHistory();
  update();

  nameInput.value   = '';
  amountInput.value = '';
  nameInput.focus();

  if (total >= GOAL) celebrate();
}

// ── Effet de secousse ──

function shake(el) {
  let times = 0;
  const interval = setInterval(() => {
    el.style.transform = times % 2 === 0 ? 'translateX(6px)' : 'translateX(-6px)';
    times++;
    if (times > 5) {
      clearInterval(interval);
      el.style.transform = '';
      el.focus();
    }
  }, 80);
}

// ── Bannière de célébration ──

function celebrate() {
  const banner = document.createElement('div');
  banner.textContent = '🎉 Objectif atteint ! Félicitations à tous !';
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #6c63ff, #48c6ef);
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 8px 24px rgba(108, 99, 255, 0.35);
    z-index: 9999;
    animation: fadeInOut 4s forwards;
  `;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0%   { opacity: 0; top: 0px; }
      15%  { opacity: 1; top: 20px; }
      75%  { opacity: 1; top: 20px; }
      100% { opacity: 0; top: 0px; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);
}

// ── Événements ──

addBtn.addEventListener('click', addContribution);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') amountInput.focus();
});

amountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addContribution();
});

// ── Initialisation ──

load();
update();
renderHistory();
