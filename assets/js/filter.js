/* Global filtering/sorting logic for topic pages */
(() => {
  const listEl = document.getElementById('resourceList');
  // Attempt to hydrate globals from embedded JSON if not already set
  if (!window.TOPIC_RESOURCES) {
    const dataScript = document.getElementById('topic-data');
    if (dataScript) {
      try {
        const meta = JSON.parse(dataScript.textContent);
        window.TOPIC_KEY = meta.topic_key;
        window.TOPIC_RESOURCES = meta.resources;
      } catch (e) {
        console.warn('Failed parsing topic JSON', e);
      }
    }
  }
  if (!listEl || !window.TOPIC_RESOURCES) return; // Not on a topic page or data missing

  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sortSelect');
  const tagFiltersEl = document.getElementById('tagFilters');
  const typeFiltersEl = document.getElementById('typeFilters');
  const resultCountEl = document.getElementById('resultCount');
  const data = window.TOPIC_RESOURCES.slice();
  // Ensure we keep only resources matching current topic if backend sent superset (defensive)
  if (window.TOPIC_KEY) {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].main && data[i].main !== window.TOPIC_KEY) data.splice(i,1);
    }
  }

  // Normalize types: allow legacy single 'type' or new 'types' array
  data.forEach(r => {
    if (!r.types) {
      if (r.type && Array.isArray(r.type)) {
        r.types = r.type; // in case someone already provided an array under type
      } else if (r.type) {
        r.types = [r.type];
      } else {
        r.types = [];
      }
    }
  });

  // Extract unique tags & types
  const tagSet = new Set();
  const typeSet = new Set();
  data.forEach(r => {
    (r.tags || []).forEach(t => tagSet.add(t));
    (r.types || []).forEach(tp => typeSet.add(tp));
  });
  const tags = Array.from(tagSet).sort();
  const types = Array.from(typeSet).sort();

  const activeTags = new Set();
  const activeTypes = new Set();

  function buildChip(label, collection, activeSet) {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.textContent = label;
    chip.tabIndex = 0;
    const toggle = () => {
      if (activeSet.has(label)) activeSet.delete(label); else activeSet.add(label);
      chip.classList.toggle('active');
      apply();
    };
    chip.addEventListener('click', toggle);
    chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }});
    collection.appendChild(chip);
  }

  function renderFilterChips() {
    tagFiltersEl.innerHTML = '';
    typeFiltersEl.innerHTML = '';
    tags.forEach(tag => buildChip(tag, tagFiltersEl, activeTags));
    types.forEach(tp => buildChip(tp, typeFiltersEl, activeTypes));
  }

  function normalize(str) { return (str || '').toLowerCase(); }

  function apply() {
    const q = normalize(searchInput.value.trim());
    const tagFilter = activeTags.size ? Array.from(activeTags) : null;
    const typeFilter = activeTypes.size ? Array.from(activeTypes) : null;
    let filtered = data.filter(r => {
      // Tag AND logic
      if (tagFilter) {
        if (!r.tags || tagFilter.some(t => !r.tags.includes(t))) return false;
      }
      // Type AND logic
      if (typeFilter) {
        if (!r.types || typeFilter.some(t => !r.types.includes(t))) return false;
      }
      if (!q) return true;
      const blob = [r.title, r.description, (r.tags || []).join(' '), (r.types || []).join(' ')].map(normalize).join(' ');
      return blob.includes(q);
    });

    // Sorting
    const sortVal = sortSelect.value;
    const invert = sortVal.startsWith('-');
    const key = invert ? sortVal.slice(1) : sortVal;
    const dir = invert ? -1 : 1;
    filtered.sort((a,b) => {
      if (key === 'title') return a.title.localeCompare(b.title) * dir;
      if (key === 'added') return (new Date(b.added) - new Date(a.added)) * dir; // 'added' default newest => note direction
      if (key === 'rating') return ((b.rating||0) - (a.rating||0)) * dir; // High first
      return 0;
    });

    renderList(filtered);
  }

  function renderList(items) {
    listEl.innerHTML = '';
    items.forEach(r => {
      const li = document.createElement('li');
      li.className = 'resource-item';
      const tagsHtml = (r.tags||[]).map(t => `<span class="tag-badge" title="Tag: ${t}">${t}</span>`).join('');
      const metaBits = [];
  if (r.types && r.types.length) metaBits.push(r.types.join('/'));
      if (r.level) metaBits.push(r.level);
      if (r.language) metaBits.push(r.language);
      if (r.rating) metaBits.push(`⭐${r.rating}`);
      if (r.added) metaBits.push(r.added);
      li.innerHTML = `
        <h4><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></h4>
        <div class="resource-meta">${metaBits.map(m=>`<span>${m}</span>`).join('')}</div>
        ${r.description ? `<p class="resource-desc">${r.description}</p>` : ''}
        ${tagsHtml ? `<div class="badge-group">${tagsHtml}</div>` : ''}
      `;
      listEl.appendChild(li);
    });
    resultCountEl.textContent = `${items.length} shown`;
  }

  // Event listeners
  ['input','change'].forEach(ev => searchInput.addEventListener(ev, apply));
  sortSelect.addEventListener('change', apply);

  renderFilterChips();
  apply();
})();