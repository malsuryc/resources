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
  const resultCountEl = document.getElementById('resultCount');
  const data = window.TOPIC_RESOURCES.slice();

  // Extract unique tags
  const tagSet = new Set();
  data.forEach(r => (r.tags || []).forEach(t => tagSet.add(t)));
  const tags = Array.from(tagSet).sort();

  const activeTags = new Set();

  function renderTagChips() {
    tagFiltersEl.innerHTML = '';
    if (!tags.length) return;
    tags.forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.textContent = tag;
      chip.tabIndex = 0;
      const toggle = () => {
        if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
        chip.classList.toggle('active');
        apply();
      };
      chip.addEventListener('click', toggle);
      chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }});
      tagFiltersEl.appendChild(chip);
    });
  }

  function normalize(str) { return (str || '').toLowerCase(); }

  function apply() {
    const q = normalize(searchInput.value.trim());
    const tagFilter = activeTags.size ? Array.from(activeTags) : null;
    let filtered = data.filter(r => {
      // Tag AND logic
      if (tagFilter) {
        if (!r.tags || tagFilter.some(t => !r.tags.includes(t))) return false;
      }
      if (!q) return true;
      const blob = [r.title, r.description, (r.tags || []).join(' ')].map(normalize).join(' ');
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
      if (r.type) metaBits.push(r.type);
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

  renderTagChips();
  apply();
})();