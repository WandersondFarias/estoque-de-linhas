/* ==========================================================================
   Estoque de Linhas — lógica da aplicação
   Persistência local via localStorage (funciona 100% offline, sem servidor)
   ========================================================================== */

const STORAGE_KEY = 'estoque-linhas-v1';
const THEME_KEY = 'estoque-linhas-theme';
let items = [];
let editingId = null;
let currentFilter = 'todos';
let searchTerm = '';
let pendingPhoto = null; // dataURL da foto selecionada no formulário (ou null)

/* ---------------------------------------------------------------------- */
/* Dados                                                                   */
/* ---------------------------------------------------------------------- */

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      items = JSON.parse(raw);
      return;
    } catch (e) {
      console.warn('Não foi possível ler o estoque salvo, iniciando com exemplos.', e);
    }
  }
  // Itens de exemplo baseados no estoque real informado pelo usuário
  items = [
    { id: cryptoId(), name: 'Linha Preta', hex: '#1B1B1B', wax: true,  qty: 12, min: 5, photo: 'images/linha-preta-encerada.png' },
    { id: cryptoId(), name: 'Linha Branca', hex: '#F5F3EC', wax: true,  qty: 15, min: 5, photo: 'images/linha-branca-encerada.png' },
    { id: cryptoId(), name: 'Linha Crua', hex: '#E4D9B9', wax: false, qty: 6,  min: 5, photo: 'images/linha-crua-sem-cera.png' },
  ];
  saveItems();
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cryptoId() {
  return 'i' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------------------------------------------------------------------- */
/* Utilitários visuais                                                     */
/* ---------------------------------------------------------------------- */

function shade(hex, amt) {
  let c = hex.replace('#', '');
  let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Carretel desenhado em SVG — usado apenas quando o item não tem foto própria
function spoolSVG(hex, wax) {
  const dark = shade(hex, -45);
  const rimColor = '#8C6526';
  const lines = [];
  for (let y = 18; y <= 54; y += 4) {
    lines.push(`<line x1="14" y1="${y}" x2="50" y2="${y}" stroke="${dark}" stroke-width="1" opacity="0.35"/>`);
  }
  const shine = wax ? `<ellipse cx="32" cy="30" rx="16" ry="16" fill="url(#shine)" opacity="0.5"/>` : '';
  const gradId = 'body-' + hex.replace('#', '');
  return `
  <svg width="100%" height="100%" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${dark}"/>
        <stop offset="0.5" stop-color="${hex}"/>
        <stop offset="1" stop-color="${dark}"/>
      </linearGradient>
      <radialGradient id="shine">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="32" cy="14" rx="22" ry="7" fill="${rimColor}"/>
    <ellipse cx="32" cy="14" rx="22" ry="7" fill="none" stroke="#6E4C1D" stroke-width="1"/>
    <rect x="14" y="14" width="36" height="44" fill="url(#${gradId})"/>
    ${lines.join('')}
    ${shine}
    <ellipse cx="32" cy="58" rx="22" ry="7" fill="${rimColor}"/>
    <ellipse cx="32" cy="58" rx="22" ry="7" fill="none" stroke="#6E4C1D" stroke-width="1"/>
    <ellipse cx="32" cy="58" rx="14" ry="4.2" fill="${dark}" opacity="0.5"/>
  </svg>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ---------------------------------------------------------------------- */
/* Renderização                                                            */
/* ---------------------------------------------------------------------- */

function computeStats() {
  const totalTypes = items.length;
  const totalQty = items.reduce((s, i) => s + Number(i.qty), 0);
  const lowCount = items.filter(i => Number(i.qty) <= Number(i.min)).length;
  return { totalTypes, totalQty, lowCount };
}

function renderStats() {
  const { totalTypes, totalQty, lowCount } = computeStats();
  document.getElementById('statsRow').innerHTML = `
    <div class="chip"><b>${totalTypes}</b> cores cadastradas</div>
    <div class="chip"><b>${totalQty}</b> unid. em estoque</div>
    <div class="chip ${lowCount > 0 ? 'alert' : ''}"><b>${lowCount}</b> em alerta</div>
  `;
}

function renderAlertBanner() {
  const low = items.filter(i => Number(i.qty) <= Number(i.min));
  const el = document.getElementById('alertBanner');
  if (low.length === 0) { el.innerHTML = ''; return; }
  const names = low.map(i => escapeHtml(i.name)).join(' · ');
  el.innerHTML = `
    <div class="alert-banner">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.5 17a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/></svg>
      <div class="txt"><b>Estoque baixo</b><span class="names">${names}</span></div>
    </div>
  `;
}

function passesFilter(item) {
  if (currentFilter === 'cera' && !item.wax) return false;
  if (currentFilter === 'sem' && item.wax) return false;
  if (currentFilter === 'baixo' && !(Number(item.qty) <= Number(item.min))) return false;
  if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
  return true;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('emptyState');
  const visible = items.filter(passesFilter);

  if (items.length === 0) {
    grid.innerHTML = '';
    emptyState.innerHTML = `
      <div class="empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        <b>Nenhuma linha cadastrada</b>
        Toque em "Nova linha" para começar seu estoque.
      </div>`;
    return;
  }
  if (visible.length === 0) {
    grid.innerHTML = '';
    emptyState.innerHTML = `
      <div class="empty">
        <b>Nada por aqui</b>
        Nenhuma linha corresponde ao filtro ou busca.
      </div>`;
    return;
  }
  emptyState.innerHTML = '';

  grid.innerHTML = visible.map(item => {
    const low = Number(item.qty) <= Number(item.min);
    const pct = Math.min(100, Math.round((Number(item.qty) / Math.max(Number(item.min) * 2, 1)) * 100));
    const barColor = low ? 'var(--rust)' : 'var(--wax)';
    const visual = item.photo
      ? `<div class="photo-thumb"><img src="${item.photo}" alt="Foto da ${escapeHtml(item.name)}" loading="lazy" onerror="this.parentElement.innerHTML='${spoolSVG(item.hex, item.wax).replace(/'/g, "\\'")}'"></div>`
      : `<div class="spool-wrap" style="width:64px;height:72px;margin:0 auto;">${spoolSVG(item.hex, item.wax)}</div>`;

    return `
    <div class="card ${low ? 'low' : ''}" data-id="${item.id}">
      <div class="spool-wrap">${visual}</div>
      <div class="name-row">
        <div>
          <div class="cname">${escapeHtml(item.name)}</div>
          <div class="hex">${item.hex.toUpperCase()}</div>
        </div>
        <button class="icon-btn edit-btn" title="Editar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <span class="badge ${item.wax ? 'wax' : 'nowax'}">
        ${item.wax ? '&#10022; Com cera' : 'Sem cera'}
      </span>
      <div class="qty-row">
        <span class="num">${item.qty}</span>
        <span class="unit">un. · mín. ${item.min}</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background:${barColor};"></div></div>
      <div class="ctrl-row">
        <div class="stepper">
          <button class="dec" aria-label="Dar baixa">−</button>
          <span>baixa</span>
          <button class="inc" aria-label="Repor">+</button>
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    card.querySelector('.dec').addEventListener('click', () => changeQty(id, -1));
    card.querySelector('.inc').addEventListener('click', () => changeQty(id, 1));
    card.querySelector('.edit-btn').addEventListener('click', () => openEdit(id));
  });
}

function changeQty(id, delta) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  const wasLow = Number(item.qty) <= Number(item.min);
  item.qty = Math.max(0, Number(item.qty) + delta);
  saveItems();
  renderAll();
  const nowLow = Number(item.qty) <= Number(item.min);
  if (delta < 0 && nowLow && !wasLow) {
    showToast(`⚠ ${item.name} entrou em estoque baixo`);
  } else if (delta < 0) {
    showToast(`Baixa registrada: ${item.name}`);
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderAll() {
  renderStats();
  renderAlertBanner();
  renderGrid();
}

/* ---------------------------------------------------------------------- */
/* Modal — adicionar / editar                                              */
/* ---------------------------------------------------------------------- */

const overlay = document.getElementById('overlay');
const fName = document.getElementById('fName');
const fColor = document.getElementById('fColor');
const fColorHex = document.getElementById('fColorHex');
const fQty = document.getElementById('fQty');
const fMin = document.getElementById('fMin');
const fPhoto = document.getElementById('fPhoto');
const photoPreview = document.getElementById('photoPreview');
const waxToggle = document.getElementById('waxToggle');
let selectedWax = 1;

fColor.addEventListener('input', () => { fColorHex.textContent = fColor.value.toUpperCase(); });

waxToggle.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    waxToggle.querySelectorAll('button').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    selectedWax = Number(btn.dataset.wax);
  });
});

fPhoto.addEventListener('change', () => {
  const file = fPhoto.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingPhoto = reader.result; // dataURL base64
    renderPhotoPreview();
  };
  reader.readAsDataURL(file);
});

document.getElementById('btnRemovePhoto').addEventListener('click', () => {
  pendingPhoto = null;
  fPhoto.value = '';
  renderPhotoPreview();
});

function renderPhotoPreview() {
  photoPreview.innerHTML = pendingPhoto
    ? `<img src="${pendingPhoto}" alt="Pré-visualização">`
    : `<span>Sem foto</span>`;
}

function openAdd() {
  editingId = null;
  pendingPhoto = null;
  document.getElementById('sheetTitle').textContent = 'Nova linha';
  document.getElementById('btnDelete').style.display = 'none';
  fName.value = '';
  fColor.value = '#1B1B1B';
  fColorHex.textContent = '#1B1B1B';
  fQty.value = 10;
  fMin.value = 5;
  fPhoto.value = '';
  selectedWax = 1;
  waxToggle.querySelectorAll('button').forEach(b => b.classList.toggle('sel', Number(b.dataset.wax) === 1));
  renderPhotoPreview();
  overlay.classList.add('show');
  setTimeout(() => fName.focus(), 100);
}

function openEdit(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  pendingPhoto = item.photo || null;
  document.getElementById('sheetTitle').textContent = 'Editar linha';
  document.getElementById('btnDelete').style.display = 'inline-block';
  fName.value = item.name;
  fColor.value = item.hex;
  fColorHex.textContent = item.hex.toUpperCase();
  fQty.value = item.qty;
  fMin.value = item.min;
  fPhoto.value = '';
  selectedWax = item.wax ? 1 : 0;
  waxToggle.querySelectorAll('button').forEach(b => b.classList.toggle('sel', Number(b.dataset.wax) === selectedWax));
  renderPhotoPreview();
  overlay.classList.add('show');
}

function closeSheet() { overlay.classList.remove('show'); }

document.getElementById('btnOpenAdd').addEventListener('click', openAdd);
document.getElementById('btnCancel').addEventListener('click', closeSheet);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSheet(); });

document.getElementById('btnSave').addEventListener('click', () => {
  const name = fName.value.trim();
  if (!name) { fName.focus(); showToast('Dê um nome para a cor'); return; }
  const hex = fColor.value;
  const qty = Math.max(0, Number(fQty.value) || 0);
  const min = Math.max(0, Number(fMin.value) || 0);
  const wax = selectedWax === 1;
  const photo = pendingPhoto || null;

  if (editingId) {
    const item = items.find(i => i.id === editingId);
    Object.assign(item, { name, hex, qty, min, wax, photo });
    showToast('Linha atualizada');
  } else {
    items.push({ id: cryptoId(), name, hex, wax, qty, min, photo });
    showToast('Linha cadastrada');
  }
  saveItems();
  renderAll();
  closeSheet();
});

document.getElementById('btnDelete').addEventListener('click', () => {
  if (!editingId) return;
  const item = items.find(i => i.id === editingId);
  items = items.filter(i => i.id !== editingId);
  saveItems();
  renderAll();
  closeSheet();
  showToast(`${item.name} removida`);
});

/* ---------------------------------------------------------------------- */
/* Filtros e busca                                                         */
/* ---------------------------------------------------------------------- */

document.getElementById('filterRow').addEventListener('click', (e) => {
  const btn = e.target.closest('.fbtn');
  if (!btn) return;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.f;
  renderGrid();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderGrid();
});

/* ---------------------------------------------------------------------- */
/* Tema claro / escuro                                                     */
/* ---------------------------------------------------------------------- */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

document.getElementById('btnTheme').addEventListener('click', toggleTheme);

/* ---------------------------------------------------------------------- */
/* Exportação em PDF                                                       */
/* ---------------------------------------------------------------------- */

function formatDate(d) {
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function exportPDF() {
  if (typeof window.jspdf === 'undefined') {
    showToast('Erro ao gerar PDF. Recarregue a página e tente novamente.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  let y = 56;

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40, 34, 28);
  doc.text('Estoque de Linhas', marginX, y);

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 105, 90);
  doc.text('Relatório gerado em ' + formatDate(new Date()), marginX, y);

  const { totalTypes, totalQty, lowCount } = computeStats();
  y += 16;
  doc.text(`${totalTypes} cores cadastradas   ·   ${totalQty} unidades em estoque   ·   ${lowCount} em alerta`, marginX, y);

  y += 22;
  doc.setDrawColor(218, 203, 169);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 22;

  // Cabeçalho da tabela
  const colX = { cor: marginX, tipo: marginX + 190, qtd: marginX + 290, min: marginX + 360, status: marginX + 430 };
  function drawTableHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(40, 34, 28);
    doc.text('COR', colX.cor, y);
    doc.text('TIPO', colX.tipo, y);
    doc.text('QTD.', colX.qtd, y);
    doc.text('MÍN.', colX.min, y);
    doc.text('STATUS', colX.status, y);
    y += 8;
    doc.setDrawColor(218, 203, 169);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 16;
  }
  drawTableHeader();

  doc.setFont('helvetica', 'normal');
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  sorted.forEach(item => {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 56;
      drawTableHeader();
    }
    const low = Number(item.qty) <= Number(item.min);

    // marcador de cor
    const hex = item.hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
    doc.setFillColor(r, g, b);
    doc.roundedRect(colX.cor, y - 9, 10, 10, 2, 2, 'F');
    doc.setDrawColor(180, 170, 150);
    doc.roundedRect(colX.cor, y - 9, 10, 10, 2, 2, 'S');

    doc.setTextColor(40, 34, 28);
    doc.setFontSize(10.5);
    doc.text(item.name, colX.cor + 16, y);
    doc.text(item.wax ? 'Com cera' : 'Sem cera', colX.tipo, y);
    doc.text(String(item.qty), colX.qtd, y);
    doc.text(String(item.min), colX.min, y);

    if (low) {
      doc.setTextColor(175, 62, 44);
      doc.setFont('helvetica', 'bold');
      doc.text('BAIXO', colX.status, y);
      doc.setFont('helvetica', 'normal');
    } else {
      doc.setTextColor(79, 107, 82);
      doc.text('OK', colX.status, y);
    }
    y += 20;
  });

  if (items.length === 0) {
    doc.setTextColor(120, 105, 90);
    doc.text('Nenhuma linha cadastrada.', marginX, y);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`estoque-de-linhas-${dateStr}.pdf`);
  showToast('PDF gerado com sucesso');
}

document.getElementById('btnPdf').addEventListener('click', exportPDF);

/* ---------------------------------------------------------------------- */
/* Inicialização                                                           */
/* ---------------------------------------------------------------------- */

initTheme();
loadItems();
renderAll();
