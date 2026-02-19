/* ------------- Utility – localStorage wrapper ------------- */
function loadData() {
  const data = localStorage.getItem('choreTracker');
  return data ? JSON.parse(data) : {chores: [], rewards: {}};
}
function saveData(state) {
  localStorage.setItem('choreTracker', JSON.stringify(state));
}

/* ------------- Render helpers ------------- */
function renderChores() {
  const {chores} = loadState;
  const tbody = document.getElementById('choresBody');
  tbody.innerHTML = '';
  chores.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx}</td>
      <td>${c.child}</td>
      <td>${c.desc}</td>
      <td>${c.points}</td>
      <td>${c.done ? '✔️' : ''}</td>
      <td><button data-id="${idx}" ${c.done? 'disabled':''}>Done</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRewards() {
  const {rewards} = loadState;
  const ul = document.getElementById('rewardsList');
  ul.innerHTML = '';
  Object.entries(rewards).forEach(([child, pts]) => {
    const li = document.createElement('li');
    li.textContent = `${child}: ${pts} pts`;
    ul.appendChild(li);
  });
}

function updateUI() {
  renderChores();
  renderRewards();
}

/* ------------- Action handlers ------------- */
const loadState = loadData();

document.getElementById('addBtn').addEventListener('click', () => {
  const child = document.getElementById('childName').value.trim();
  const desc = document.getElementById('choreDesc').value.trim();
  const pts = parseInt(document.getElementById('rewardPts').value, 10);
  if (!child || !desc || !pts) return;

  loadState.chores.push({child, desc, points: pts, done: false});
  saveData(loadState);
  updateUI();
});

document.getElementById('choresBody').addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  const id = parseInt(e.target.dataset.id, 10);
  const chore = loadState.chores[id];
  if (!chore || chore.done) return;

  chore.done = true;
  // Add points
  loadState.rewards[chore.child] = (loadState.rewards[chore.child] || 0) + chore.points;
  saveData(loadState);
  updateUI();
});

/* ------------- Init ------------- */
updateUI();