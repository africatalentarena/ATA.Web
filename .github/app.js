const ADMIN_CREDENTIALS = {
  email: 'admin@ata.africa',
  password: 'TalentArena123'
};

const initialContestants = [
  {
    id: 'ATA-1001',
    name: 'Malaika Soul',
    category: 'Music & Vocal Performance',
    region: 'East Africa Hub',
    status: 'Pending Review',
    score: 245,
    votes: 18,
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    created: '2026-04-10'
  },
  {
    id: 'ATA-1074',
    name: 'Akua Dance Collective',
    category: 'Dance & Acrobatics',
    region: 'West Africa Hub',
    status: 'Active',
    score: 275,
    votes: 22,
    video: 'https://www.youtube.com/embed/2_g9S9-t-sA',
    created: '2026-04-24'
  },
  {
    id: 'ATA-1122',
    name: 'Sarabi Comedy',
    category: 'Standup Comedy',
    region: 'Central Africa Hub',
    status: 'Review Complete',
    score: 230,
    votes: 15,
    video: 'https://www.youtube.com/embed/V6_W8_oX45A',
    created: '2026-05-03'
  }
];

const appState = {
  isAdmin: false,
  selectedContestant: null,
  contestants: [],
  filters: {
    search: '',
    category: 'All categories',
    region: 'All regions',
    status: 'All statuses'
  }
};

const elements = {
  adminStatus: document.querySelector('.status-pill'),
  authButton: document.querySelector('#authButton'),
  adminModal: document.querySelector('#adminModal'),
  loginForm: document.querySelector('#loginForm'),
  adminEmail: document.querySelector('#adminEmail'),
  adminPassword: document.querySelector('#adminPassword'),
  guestOverlays: document.querySelectorAll('.guest-guard'),
  metricContestants: document.querySelector('#metric-contestants'),
  metricActive: document.querySelector('#metric-active'),
  metricAverage: document.querySelector('#metric-average'),
  metricVotes: document.querySelector('#metric-votes'),
  topPerformersList: document.querySelector('#topPerformers'),
  tableBody: document.querySelector('#contestantsTableBody'),
  filterSearch: document.querySelector('#filterSearch'),
  filterCategory: document.querySelector('#filterCategory'),
  filterRegion: document.querySelector('#filterRegion'),
  filterStatus: document.querySelector('#filterStatus'),
  judgeList: document.querySelector('#judgeContestantList'),
  videoFrame: document.querySelector('#judgeVideo'),
  currentContestantName: document.querySelector('#currentContestantName'),
  currentContestantMeta: document.querySelector('#currentContestantMeta'),
  totalScoreValue: document.querySelector('#totalScoreValue'),
  commitButton: document.querySelector('#commitScores'),
  creativityRange: document.querySelector('#creativityRange'),
  techniqueRange: document.querySelector('#techniqueRange'),
  impactRange: document.querySelector('#impactRange'),
  creativityValue: document.querySelector('#creativityValue'),
  techniqueValue: document.querySelector('#techniqueValue'),
  impactValue: document.querySelector('#impactValue'),
  addForm: document.querySelector('#addPerformerForm'),
  toast: document.querySelector('#toast'),
  toastMessage: document.querySelector('#toastMessage')
};

function showToast(message) {
  elements.toastMessage.textContent = message;
  elements.toast.classList.add('active');
  setTimeout(() => elements.toast.classList.remove('active'), 3200);
}

function saveContestants() {
  localStorage.setItem('ataContestants', JSON.stringify(appState.contestants));
}

function loadContestants() {
  const saved = localStorage.getItem('ataContestants');
  if (saved) {
    appState.contestants = JSON.parse(saved);
  } else {
    appState.contestants = initialContestants;
    saveContestants();
  }
}

function getFilteredContestants() {
  return appState.contestants.filter((contestant) => {
    const matchesSearch = contestant.name.toLowerCase().includes(appState.filters.search.toLowerCase()) || contestant.id.toLowerCase().includes(appState.filters.search.toLowerCase());
    const matchesCategory = appState.filters.category === 'All categories' || contestant.category === appState.filters.category;
    const matchesRegion = appState.filters.region === 'All regions' || contestant.region === appState.filters.region;
    const matchesStatus = appState.filters.status === 'All statuses' || contestant.status === appState.filters.status;
    return matchesSearch && matchesCategory && matchesRegion && matchesStatus;
  });
}

function updateMetrics() {
  const total = appState.contestants.length;
  const active = appState.contestants.filter((contestant) => contestant.status === 'Active').length;
  const average = total ? Math.round(appState.contestants.reduce((sum, contestant) => sum + contestant.score, 0) / total) : 0;
  const votes = appState.contestants.reduce((sum, contestant) => sum + contestant.votes, 0);

  elements.metricContestants.textContent = total;
  elements.metricActive.textContent = active;
  elements.metricAverage.textContent = average;
  elements.metricVotes.textContent = votes;
}

function renderTopPerformers() {
  const topList = [...appState.contestants].sort((a, b) => b.score - a.score).slice(0, 4);
  elements.topPerformersList.innerHTML = topList.map((performer) => `
    <li class="performer-item">
      <div class="performer-meta">
        <strong>${performer.name}</strong>
        <span>${performer.category} • ${performer.region}</span>
      </div>
      <div class="performer-score">
        <strong>${performer.score}</strong>
        <p>${performer.votes} votes</p>
      </div>
    </li>
  `).join('');
}

function renderContestantTable() {
  const contestants = getFilteredContestants();
  elements.tableBody.innerHTML = contestants.map((contestant, index) => `
    <tr>
      <td>${contestant.id}</td>
      <td>${contestant.name}</td>
      <td>${contestant.category}</td>
      <td>${contestant.region}</td>
      <td><span class="badge ${contestant.status.toLowerCase().replace(/\s+/g, '-')}">${contestant.status}</span></td>
      <td>${contestant.score}</td>
      <td>${contestant.votes}</td>
      <td><button class="action-secondary" onclick="selectContestant(${index})">Review</button></td>
    </tr>`).join('');
}

function renderJudgeList() {
  const contestants = appState.contestants;
  elements.judgeList.innerHTML = contestants.map((contestant, index) => `
    <li class="contestant-card ${appState.selectedContestant === index ? 'active' : ''}">
      <div>
        <strong>${contestant.name}</strong>
        <small>${contestant.category}</small>
        <small>${contestant.region}</small>
      </div>
      <div>
        <span class="badge ${contestant.status.toLowerCase().replace(/\s+/g, '-')}">${contestant.status}</span>
      </div>
    </li>
  `).join('');

  elements.judgeList.querySelectorAll('.contestant-card').forEach((card, index) => {
    card.addEventListener('click', () => selectContestant(index));
  });
}

function updateJudgePanel() {
  const contestant = appState.contestants[appState.selectedContestant];
  if (!contestant) {
    elements.currentContestantName.textContent = 'No performer selected';
    elements.currentContestantMeta.textContent = 'Select a candidate to unlock the scoring console.';
    elements.videoFrame.src = 'about:blank';
    elements.totalScoreValue.textContent = '000';
    return;
  }

  elements.currentContestantName.textContent = contestant.name;
  elements.currentContestantMeta.textContent = `${contestant.category} • ${contestant.region}`;
  elements.videoFrame.src = contestant.video;
  elements.creativityRange.value = Math.round(contestant.score * 0.33);
  elements.techniqueRange.value = Math.round(contestant.score * 0.34);
  elements.impactRange.value = Math.round(contestant.score * 0.33);
  updateScorePreview();
}

function updateScorePreview() {
  const creativity = Number(elements.creativityRange.value);
  const technique = Number(elements.techniqueRange.value);
  const impact = Number(elements.impactRange.value);
  elements.creativityValue.textContent = creativity;
  elements.techniqueValue.textContent = technique;
  elements.impactValue.textContent = impact;
  elements.totalScoreValue.textContent = creativity + technique + impact;
}

function selectContestant(index) {
  appState.selectedContestant = index;
  renderJudgeList();
  updateJudgePanel();
}

function toggleAdminState() {
  appState.isAdmin = !appState.isAdmin;
  elements.adminStatus.textContent = appState.isAdmin ? 'Admin signed in' : 'Guest mode';
  elements.adminStatus.classList.toggle('active', appState.isAdmin);
  elements.authButton.textContent = appState.isAdmin ? 'Log out' : 'Admin sign in';
  elements.guestOverlays.forEach((overlay) => {
    overlay.style.display = appState.isAdmin ? 'none' : 'grid';
  });
  if (appState.isAdmin && appState.contestants.length > 0) {
    appState.selectedContestant = 0;
    updateJudgePanel();
  }
}

function openModal() {
  elements.adminModal.classList.add('active');
  elements.adminEmail.focus();
}

function closeModal() {
  elements.adminModal.classList.remove('active');
  elements.loginForm.reset();
}

function handleLogin(event) {
  event.preventDefault();
  const email = elements.adminEmail.value.trim();
  const password = elements.adminPassword.value;
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    toggleAdminState();
    closeModal();
    showToast('Admin access granted. All management features are now available.');
    renderContestantTable();
    renderJudgeList();
  } else {
    showToast('Invalid credentials. Please check your email and password.');
  }
}

function handleAuthButton() {
  if (appState.isAdmin) {
    toggleAdminState();
    showToast('Admin session ended. Public view restored.');
  } else {
    openModal();
  }
}

function handleFilters() {
  appState.filters.search = elements.filterSearch.value;
  appState.filters.category = elements.filterCategory.value;
  appState.filters.region = elements.filterRegion.value;
  appState.filters.status = elements.filterStatus.value;
  renderContestantTable();
}

function handleAddPerformer(event) {
  event.preventDefault();
  if (!appState.isAdmin) {
    showToast('You must be signed in as admin to add a new performer.');
    return;
  }

  const form = event.target;
  const name = form.performerName.value.trim();
  const id = form.performerId.value.trim() || `ATA-${Date.now()}`;
  const category = form.performerCategory.value;
  const region = form.performerRegion.value;
  const video = form.performerVideo.value.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ';

  if (!name) {
    showToast('Please enter a performer name before submitting.');
    return;
  }

  appState.contestants.push({
    id,
    name,
    category,
    region,
    status: 'Pending Review',
    score: 0,
    votes: 0,
    video,
    created: new Date().toISOString().split('T')[0]
  });

  saveContestants();
  updateMetrics();
  renderContestantTable();
  renderJudgeList();
  form.reset();
  showToast(`Performer ${name} added successfully. Await judge review.`);
}

function commitScores() {
  if (!appState.isAdmin) {
    showToast('Please sign in as admin before committing scores.');
    return;
  }
  const contestant = appState.contestants[appState.selectedContestant];
  if (!contestant) {
    showToast('Select a performer before committing scores.');
    return;
  }

  const creativity = Number(elements.creativityRange.value);
  const technique = Number(elements.techniqueRange.value);
  const impact = Number(elements.impactRange.value);
  const total = creativity + technique + impact;

  contestant.score = total;
  contestant.votes += 1;
  contestant.status = 'Active';
  saveContestants();
  updateMetrics();
  renderContestantTable();
  renderJudgeList();
  showToast(`Evaluation committed for ${contestant.name}. Total score: ${total}.`);
}

function initViewRouting() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      document.querySelectorAll('.page-section').forEach((section) => section.classList.remove('active'));
      document.getElementById(view).classList.add('active');
      document.querySelectorAll('.nav-button').forEach((nav) => nav.classList.toggle('active', nav.dataset.view === view));
    });
  });
}

function initializeApp() {
  loadContestants();
  updateMetrics();
  renderTopPerformers();
  renderContestantTable();
  renderJudgeList();
  initViewRouting();
  elements.filterSearch.addEventListener('input', handleFilters);
  elements.filterCategory.addEventListener('change', handleFilters);
  elements.filterRegion.addEventListener('change', handleFilters);
  elements.filterStatus.addEventListener('change', handleFilters);
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.authButton.addEventListener('click', handleAuthButton);
  elements.addForm.addEventListener('submit', handleAddPerformer);
  elements.commitButton.addEventListener('click', commitScores);
  elements.creativityRange.addEventListener('input', updateScorePreview);
  elements.techniqueRange.addEventListener('input', updateScorePreview);
  elements.impactRange.addEventListener('input', updateScorePreview);
  document.querySelector('#closeModal').addEventListener('click', closeModal);
  toggleAdminState();
}

initializeApp();
