const GOAL = 10000;
const BIN_ID = '6a430ac3f5f4af5e294497f7';
const API_KEY = '$2a$10$22MMJ.ZlFFidVgdrnUVd3uuUks2LlxEqqWIxl5/R78U86mahKgU9m';
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const PASSWORD = '6712367';

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

// ── Bouton réinitialiser ──

const resetBtn = document.createElement('button');
resetBtn.textContent = '🔄 Réinitialiser la cagnotte';
resetBtn.style.cssText = `
  display: block;
  margin: 1rem auto 0;
  background: none;
  border: 1.5px solid #e74c3c;
  color: #e74c3c;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
`;
document.querySelector('footer').before(resetBtn);

resetBtn.addEventListener('click', async () => {
  const pwd = prompt('Mot de passe :');
  if (pwd !== PASSWORD) { alert('Mot de passe incorrect.'); return; }
  if (!confirm('Réinitialiser toutes les contributions ?')) return;

  resetBtn.disabled = true;
  resetBtn.textContent = 'Réinitialisation...';
  contributions = [];
  total = 0;
  people = 0;
  await save();
  update();
  renderHistory();
  resetBtn.disabled = false;
  resetBtn.textContent = '🔄 Réinitialiser la cagnotte';
});

// ── Charger depuis JSONBin ──

async function load() {
  historyEl.innerHTML = '<p>Chargement...</p>';
  try {
    const res = await fetch(URL + '/latest', {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await res.json();
    contributions = data.record.contributions || [];
    total  = contributions.reduce((sum, c) => sum + c.amount, 0);
    people = contributions.length;
    update();
    renderHistory();
  } catch (e) {
    historyEl.innerHTML = '<p>Erreur de chargement.</p>';
  }
}

// ── Sauvegarder sur JSONBin ──

async function save() {
  await fetch(URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY
    },
    body: JSON.stringify({ contributions })
  });
}

// ── Supprimer une contribution ──

async function removeContribution(index) {
  const pwd = prompt('Mot de passe pour supprimer :');
  if (pwd !== PASSWORD) { alert('Mot de passe incorrect.'); return; }

  contributions.splice(index, 1);
  total  = contributions.reduce((sum, c) => sum + c.amount, 0);
  people = contributions.length;

  await save();
  update();
  renderHistory();
}

// ── Rendu de l'historique ──

function renderHistory() {
  historyEl.innerHTML = '';
  if (contributions.length === 0) {
    historyEl.innerHTML = '<p>Aucune contribution.</p>';
    return;
  }
  [...contributions].reverse().forEach((c, i) => {
    const realIndex = contributions.length - 1 - i;
    const card = document.createElement('div');
    card.className = 'contribution';
    card.innerHTML = `
      <span class="name">👤 ${c.name}</span>
      <span style="display:flex; align-items:center; gap:10px;">
        <span class="amount">+${c.amount.toLocaleString('fr-FR')} DH</span>
        <button onclick="removeContribution(${realIndex})" style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          color: #e74c3c;
          padding: 0;
          line-height: 1;
        ">🗑️</button>
      </span>
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

async function addContribution() {
  const name   = nameInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (!name)               { shake(nameInput);   return; }
  if (!amount || amount <= 0) { shake(amountInput); return; }

  addBtn.disabled = true;
  addBtn.textContent = 'Envoi...';

  contributions.push({ name, amount });
  total  += amount;
  people += 1;

  await save();
  renderHistory();
  update();

  nameInput.value   = '';
  amountInput.value = '';
  nameInput.focus();

  addBtn.disabled = false;
  addBtn.textContent = 'Contribuer';

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
