const IMG = window.BENTLEY_IMG || {};
const { SERVICES = [], PROJECTS = [], PROCESS = [] } = window.BENTLEY_DATA || {};
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61556319995759';
const brand = { name: 'Bentley Outdoors', tagline: 'Recreate, maintain, and elevate your outdoor space—where professional landscaping meets modern horticulture.', phone: '(404)-487-8165', email: 'ebentley@bentoutdoors.com', address: 'Acworth, GA • Mon–Sat 6:00 AM – 7:00 PM' };

document.querySelectorAll('[data-img]').forEach((element) => {
  const image = IMG[element.dataset.img];
  if (image) element.src = image;
});
function updateBrand() {
  document.querySelectorAll('[data-brand="name"]').forEach(el => el.textContent = brand.name);
  document.querySelectorAll('[data-brand="tagline"]').forEach(el => el.textContent = brand.tagline);
  document.querySelectorAll('[data-brand="address"]').forEach(el => el.textContent = brand.address);
  document.querySelectorAll('[data-brand="mailLink"]').forEach(el => { el.textContent = brand.email; el.href = 'mailto:' + brand.email; });
  document.querySelectorAll('[data-brand="phoneLink"]').forEach(el => { el.textContent = brand.phone; el.href = 'tel:' + brand.phone.replace(/[^\d+]/g, ''); });
  const floating = $('#floatingWhatsapp');
  if (floating) {
    const digits = brand.phone.replace(/\D/g, '');
    const whatsappDigits = digits.length === 10 ? '1' + digits : digits;
    floating.href = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hello Bentley Outdoors, I would like to discuss a landscaping project.')}`;
  }
}
updateBrand();

const servicesGrid = $('#servicesGrid');
if (servicesGrid) {
  servicesGrid.innerHTML = SERVICES.map((service, index) => `<article class="card"><div class="card-image"><img src="${IMG[service[4]]}" alt="${escapeHtml(service[1])}" loading="lazy"><div class="image-pill">${service[0]} • ${escapeHtml(service[2])}</div></div><div class="card-body"><h3>${escapeHtml(service[1])}</h3><p>${escapeHtml(service[3])}</p><ul class="ticks"><li>${escapeHtml(service[5])}</li><li>${escapeHtml(service[6])}</li></ul></div><div class="card-actions"><button class="secondary" type="button" onclick="showService(${index})">Scope Details</button><button type="button" onclick="inquire(${index},'service')">Inquire for Quote →</button></div></article>`).join('');
}

const filters = ['All Spaces', 'Residential Gardens', 'Rooftop & Terrace', 'Courtyards & Zen', 'Hardscape & Lighting'];
let selectedCategory = 'All Spaces';
function renderProjects() {
  const filterBox = $('#filters');
  const projectsGrid = $('#projectsGrid');
  if (!filterBox || !projectsGrid) return;
  filterBox.innerHTML = filters.map(category => `<button type="button" aria-pressed="${selectedCategory === category}" class="${selectedCategory === category ? 'on' : ''}" onclick="setCategory('${category}')">${category}</button>`).join('');
  projectsGrid.innerHTML = PROJECTS.map((project, index) => ({project, index})).filter(item => selectedCategory === 'All Spaces' || item.project[1] === selectedCategory).map(({project, index}) => `<article class="card"><div class="card-image"><img src="${IMG[project[4]]}" alt="${escapeHtml(project[0])}" loading="lazy"><div class="image-pill">${escapeHtml(project[1])}</div></div><div class="card-body"><div class="meta"><span>${escapeHtml(project[2])}</span><i>${escapeHtml(project[3])}</i></div><h3>${escapeHtml(project[0])}</h3><p>${escapeHtml(project[5])}</p></div><div class="card-actions"><button type="button" onclick="showProject(${index})">View Project Study →</button><button type="button" class="secondary" onclick="inquire(${index},'project')">Request Similar Design</button></div></article>`).join('');
}
window.setCategory = (category) => { selectedCategory = category; renderProjects(); };
renderProjects();

const processGrid = $('#processGrid');
if (processGrid) processGrid.innerHTML = PROCESS.map(step => `<div class="process-card"><div><span class="process-num">${step[0]}</span><h3>${escapeHtml(step[1])}</h3><p class="sub">${escapeHtml(step[2])}</p><p class="desc">${escapeHtml(step[3])}</p></div><div class="note">✓ &nbsp; ${escapeHtml(step[4])}</div></div>`).join('');

const modalOverlay = $('#modalOverlay');
const showModal = (content) => {
  const modalBody = $('#modalBody');
  if (!modalOverlay || !modalBody) return;
  modalBody.innerHTML = `<button class="cross" aria-label="Close details" onclick="hideModal()">×</button>` + content;
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const close = $('#modalBody .cross'); if (close) close.focus();
};
window.hideModal = () => { if (modalOverlay) modalOverlay.classList.add('hidden'); document.body.style.overflow = ''; };
if (modalOverlay) modalOverlay.addEventListener('click', event => { if (event.target === modalOverlay) window.hideModal(); });
window.showService = (index) => {
  const service = SERVICES[index]; if (!service) return;
  showModal(`<span class="eyebrow">SERVICE / ${service[0]}</span><h2>${escapeHtml(service[1])}</h2><img class="modal-image" src="${IMG[service[4]]}" alt="${escapeHtml(service[1])}"><p>${escapeHtml(service[3])}</p><h3>Included scope</h3><ul class="ticks"><li>${escapeHtml(service[5])}</li><li>${escapeHtml(service[6])}</li></ul><div style="margin-top:18px"><button class="btn dark" onclick="inquire(${index},'service')">Request This Service →</button></div>`);
};
window.showProject = (index) => {
  const project = PROJECTS[index]; if (!project) return;
  showModal(`<span class="eyebrow">${escapeHtml(project[1])}</span><h2>${escapeHtml(project[0])}</h2><img class="modal-image" src="${IMG[project[4]]}" alt="${escapeHtml(project[0])}"><p>${escapeHtml(project[5])}</p><p>${escapeHtml(project[2])} • ${escapeHtml(project[3])}</p><div style="margin-top:18px"><button class="btn dark" onclick="inquire(${index},'project')">Request Similar Design →</button></div>`);
};
window.inquire = (index, type) => {
  let label = '', note = '';
  if (type === 'service') { const service = SERVICES[index]; if (!service) return; label = service[1]; note = `Interested in ${service[1]} (${service[2]}). `; }
  else { const project = PROJECTS[index]; if (!project) return; label = project[1]; note = `Inspired by "${project[0]}" (${project[1]}). I'd like to discuss a similar outdoor concept.`; }
  window.location.href = `contact.html?projectType=${encodeURIComponent(label)}&note=${encodeURIComponent(note)}`;
};

const menuButton = $('#menuBtn');
const mobileNav = $('#mobileNav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => { const open = mobileNav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.textContent = open ? '✕' : '☰'; });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = '☰'; }));
}
const aboutToggle = $('#aboutToggle');
if (aboutToggle) aboutToggle.addEventListener('click', () => { const details = $('#aboutMore'); if (!details) return; const hidden = details.classList.toggle('hidden'); aboutToggle.textContent = hidden ? 'Learn About Us →' : 'Hide Landscaping Principles ↑'; });

function setupReferenceUpload(inputId, statusId) {
  const input = document.getElementById(inputId);
  const status = document.getElementById(statusId);
  if (!input) return;
  const maxFiles = 3;
  const maxBytes = 8 * 1024 * 1024;
  const refresh = () => {
    const files = [...(input.files || [])];
    const total = files.reduce((sum, file) => sum + file.size, 0);
    let error = '';
    if (files.length > maxFiles) error = 'Please choose no more than 3 images.';
    else if (files.some(file => !file.type.startsWith('image/'))) error = 'Please select image files only.';
    else if (total > maxBytes) error = 'Please keep the total image size under 8 MB.';
    input.setCustomValidity(error);
    if (status) {
      if (error) status.textContent = error;
      else if (!files.length) status.textContent = 'Choose up to 3 images, total 8 MB or less.';
      else status.textContent = files.map(file => file.name).join(' • ') + ` (${(total / (1024 * 1024)).toFixed(2)} MB total)`;
    }
  };
  input.addEventListener('change', refresh);
  refresh();
}
setupReferenceUpload('homeReferenceImages', 'homeReferenceImagesStatus');
setupReferenceUpload('referenceImages', 'referenceImagesStatus');

const inquiryForm = $('#inquiryForm');
if (inquiryForm) {
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get('projectType');
  const requestedNote = params.get('note');
  if (requestedType && $('#projectType')) {
    const option = [...$('#projectType').options].find(item => item.value === requestedType || item.textContent === requestedType);
    if (option) $('#projectType').value = option.value;
  }
  if (requestedNote && $('#projectDescription') && !$('#projectDescription').value) $('#projectDescription').value = requestedNote;
  const dateField = $('#preferredDate');
  if (dateField) dateField.min = new Date().toISOString().slice(0, 10);

  const read = selector => { const field = $(selector); return field ? field.value.trim() : ''; };
  const validContact = contact => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const normalizedPhone = contact.replace(/[^\d+]/g, '');
    return validEmail || /^\+?\d{7,15}$/.test(normalizedPhone);
  };
  const prepareSummary = () => {
    const name = read('#name'), contact = read('#contactMethod'), location = read('#location'), brief = read('#projectDescription');
    if (name.length < 2) { alert('Please enter your full name.'); $('#name').focus(); return false; }
    if (!validContact(contact)) { alert('Please provide a valid email address or phone number.'); $('#contactMethod').focus(); return false; }
    if (!location) { alert('Please specify the project location.'); $('#location').focus(); return false; }
    if (brief.length < 12) { alert('Please describe your project in at least 12 characters.'); $('#projectDescription').focus(); return false; }
    const files = [...(document.getElementById('referenceImages')?.files || [])];
    const fileNames = files.length ? files.map(file => `- ${file.name}`).join('\n') : 'No reference images attached';
    const message = `PROJECT INQUIRY — ${brand.name}\n----------------------------------------\nClient Name: ${name}\nContact (Phone / Email): ${contact}\nProject Type: ${read('#projectType')}\nProject Location: ${location}\nApproximate Area: ${read('#area') || 'To be discussed during consultation'}\nPreferred Consultation Date: ${read('#preferredDate') || 'Not specified'}\nPreferred Consultation Time: ${read('#preferredTime') || 'No preference'}\nReference Images:\n${fileNames}\n\nProject Brief & Outdoor Goals:\n${brief}\n----------------------------------------\nPrepared via ${brand.name} Website Inquiry Builder`;
    const resultText = $('#resultText'); if (resultText) resultText.textContent = message;
    const subject = encodeURIComponent('Landscaping project inquiry — ' + brand.name);
    const body = encodeURIComponent(message);
    const emailButton = $('#emailInquiryBtn'); if (emailButton) emailButton.href = `mailto:${brand.email}?subject=${subject}&body=${body}`;
    const whatsappButton = $('#whatsappInquiryBtn');
    if (whatsappButton) { const digits = brand.phone.replace(/\D/g, ''); const waDigits = digits.length === 10 ? '1' + digits : digits; whatsappButton.href = `https://wa.me/${waDigits}?text=${body}`; }
    const result = $('#result'); if (result) { result.classList.remove('hidden'); result.scrollIntoView({behavior:'smooth', block:'center'}); }
    return true;
  };

  const prepareButton = $('#prepareInquiryBtn');
  if (prepareButton) prepareButton.addEventListener('click', prepareSummary);
  inquiryForm.addEventListener('submit', event => {
    const name = read('#name'), contact = read('#contactMethod'), location = read('#location'), brief = read('#projectDescription');
    const fileInput = document.getElementById('referenceImages');
    if (name.length < 2) { event.preventDefault(); alert('Please enter your full name.'); $('#name').focus(); return; }
    if (!validContact(contact)) { event.preventDefault(); alert('Please provide a valid email address or phone number.'); $('#contactMethod').focus(); return; }
    if (!location) { event.preventDefault(); alert('Please specify the project location.'); $('#location').focus(); return; }
    if (brief.length < 12) { event.preventDefault(); alert('Please describe your project in at least 12 characters.'); $('#projectDescription').focus(); return; }
    if (fileInput && !fileInput.checkValidity()) { event.preventDefault(); fileInput.reportValidity(); return; }
    // Valid submissions continue natively to Netlify Forms, including any attached image files.
  });
}

const homeInquiryForm = $('#homeInquiryForm');
if (homeInquiryForm) {
  const homeDate = $('#homeDate');
  if (homeDate) homeDate.min = new Date().toISOString().slice(0, 10);
  homeInquiryForm.addEventListener('submit', event => {
    const contactField = $('#homeContact');
    const contact = contactField ? contactField.value.trim() : '';
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const normalizedPhone = contact.replace(/[^\d+]/g, '');
    const validPhone = /^\+?\d{7,15}$/.test(normalizedPhone);
    const description = $('#homeDescription');
    const files = document.getElementById('homeReferenceImages');
    if (!validEmail && !validPhone) {
      event.preventDefault();
      alert('Please provide a valid email address or phone number.');
      if (contactField) contactField.focus();
      return;
    }
    if (description && description.value.trim().length < 12) {
      event.preventDefault();
      alert('Please describe your project in at least 12 characters.');
      description.focus();
      return;
    }
    if (files && !files.checkValidity()) {
      event.preventDefault();
      files.reportValidity();
    }
    // Valid form submissions continue natively to Netlify Forms with selected image files.
  });
}

const copyButton = $('#copyBtn');
if (copyButton) copyButton.addEventListener('click', async () => {
  const resultText = $('#resultText'); if (!resultText) return;
  const text = resultText.textContent;
  try { await navigator.clipboard.writeText(text); copyButton.textContent = '✓ Copied to Clipboard'; }
  catch { const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select(); const copied = document.execCommand('copy'); area.remove(); copyButton.textContent = copied ? '✓ Copied to Clipboard' : 'Select and copy the text above'; }
});

document.querySelectorAll('.navlinks a[data-nav]').forEach(link => { if (link.dataset.nav === document.body.dataset.page) link.classList.add('active'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') window.hideModal(); });
