// ---------- Data storage ----------
const STORAGE_KEY = 'familyChoreTracker';

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : { kids: [], chores: [], rewards: {} };
}
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

const state = loadState();

// ---------- Utility helpers ----------
function renderKidList() {
  const ul = document.getElementById('kidList');
  const dl = document.getElementById('kidsListOptions');
  if (!ul) return;
  ul.innerHTML = '';
  if (dl) dl.innerHTML = '';
  state.kids.forEach((kid, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerText = kid;
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-danger';
    delBtn.textContent = '✖';
    delBtn.dataset.id = i;
    li.appendChild(delBtn);
    ul.appendChild(li);

    if (dl) {
      const opt = document.createElement('option');
      opt.value = kid;
      dl.appendChild(opt);
    }
  });
}

function renderChoreTable() {
  const tb = document.querySelector('#choresTable tbody');
  if (!tb) return;
  tb.innerHTML = '';
  state.chores.forEach((c, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${state.kids[c.kidId]}</td>
      <td>${c.desc}</td>
      <td>${c.points}</td>
      <td>${c.done ? '✔️' : ''}</td>
      <td>
        <button class="btn btn-sm ${c.done?'btn-secondary':'btn-success'} markDoneBtn" data-id="${i}" ${c.done?'disabled':''}>
          ${c.done?'✔':'Done'}
        </button>
      </td>
    `;
    tb.appendChild(tr);
  });
}

function renderRewardList() {
  const ul = document.getElementById('rewardList');
  if (!ul) return;
  ul.innerHTML = '';
  Object.entries(state.rewards).forEach(([kid, pts]) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<span>${kid}</span><span class="badge bg-primary rounded-pill">${pts}</span>`;
    ul.appendChild(li);
  });
}

// ---------- Page detection ----------
const page = window.location.pathname.split('/').pop().replace('.html', '');
document.getElementById('pageName').textContent = page.charAt(0).toUpperCase() + page.slice(1);

// ---------- Page‑specific init ----------
if (page === 'kids') {
  renderKidList();
  const addBtn = document.getElementById('addKidBtn');
  const modal = new bootstrap.Modal(document.getElementById('kidModal'));
  const saveBtn = document.getElementById('saveKidBtn');

  addBtn.addEventListener('click', () => { modal.show(); });

  saveBtn.addEventListener('click', () => {
    const input = document.getElementById('kidNameInput').value.trim();
    if (input) {
      state.kids.push(input);
      saveState(state);
      renderKidList();
    }
    modal.hide();
  });

  document.getElementById('kidList').addEventListener('click', e => {
    if (!e.target.dataset.id) return;
    const id = parseInt(e.target.dataset.id, 10);
    if (confirm(`Delete kid "${state.kids[id]}"?`)) {
      state.kids.splice(id, 1);
      // Remove any chores that used this kid ID
      state.chores = state.chores.filter(c => c.kidId !== id);
      // Re‑index rewards (they are keyed by name)
      state.rewards = Object.fromEntries(Object.entries(state.rewards)
        .filter(([k]) => state.kids.includes(k)));
      saveState(state);
      renderKidList();
      renderChoreTable();
      renderRewardList();
    }
  });

} else if (page === 'chores') {
  renderKidList();    // populate dropdown via datalist
  renderChoreTable();
  const addBtn = document.getElementById('addChoreBtn');
  const modal = new bootstrap.Modal(document.getElementById('choreModal'));
  const saveBtn = document.getElementById('saveChoreBtn');

  addBtn.addEventListener('click', () => { modal.show(); });

  saveBtn.addEventListener('click', () => {
    const kidName = document.getElementById('choreKidSelect').value.trim();
    const desc = document.getElementById('choreDescInput').value.trim();
    const pts = parseInt(document.getElementById('chorePtsInput').value, 10);
    const kidId = state.kids.indexOf(kidName);
    if (kidId < 0 || !desc || isNaN(pts)) return;
    state.chores.push({ kidId, desc, points: pts, done: false });
    saveState(state);
    renderChoreTable();
    modal.hide();
  });

  document.querySelector('#choresTable tbody').addEventListener('click', e => {
    if (!e.target.classList.contains('markDoneBtn')) return;
    const idx = parseInt(e.target.dataset.id, 10);
    const chore = state.chores[idx];
    if (!chore || chore.done) return;
    chore.done = true;
    state.rewards[state.kids[chore.kidId]] =
      (state.rewards[state.kids[chore.kidId]] || 0) + chore.points;
    saveState(state);
    renderChoreTable();
    renderRewardList();
  });

} else if (page === 'rewards') {
  renderRewardList();
  document.getElementById('resetRewardsBtn').addEventListener('click', () => {
    if (!confirm('Reset all reward points?')) return;
    state.rewards = {};
    saveState(state);
    renderRewardList();
  });
}
