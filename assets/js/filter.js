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
  const topicFiltersEl = document.getElementById('topicFilters');
  const resultCountEl = document.getElementById('resultCount');
  const data = window.TOPIC_RESOURCES.slice();
  const topicTitles = window.TOPIC_TITLES || (window.TOPIC_META && window.TOPIC_META.topic_titles) || {};
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
  const activeTopics = new Set(); // Only used in global mode (index)

  const isGlobal = !window.TOPIC_KEY && !!topicFiltersEl; // index page global search

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
    if (tagFiltersEl) {
      tagFiltersEl.innerHTML = '';
      tags.forEach(tag => buildChip(tag, tagFiltersEl, activeTags));
    }
    if (typeFiltersEl) {
      typeFiltersEl.innerHTML = '';
      types.forEach(tp => buildChip(tp, typeFiltersEl, activeTypes));
    }
    if (topicFiltersEl) {
      // Build topic list based on resources present (may be subset)
      topicFiltersEl.innerHTML = '';
      const topicSet = new Set();
      data.forEach(r => { if (r.main) topicSet.add(r.main); });
      Array.from(topicSet).sort().forEach(tk => {
        buildChip(topicTitles[tk] || tk, topicFiltersEl, activeTopics);
        // store mapping label->key for lookup (use dataset)
        const chip = topicFiltersEl.lastElementChild;
        chip.dataset.topicKey = tk;
      });
    }
  }

  function normalize(str) { return (str || '').toLowerCase(); }

  function apply() {
    const q = normalize(searchInput.value.trim());
    const tagFilter = activeTags.size ? Array.from(activeTags) : null;
    const typeFilter = activeTypes.size ? Array.from(activeTypes) : null;
    const topicFilter = activeTopics.size ? new Set(Array.from(activeTopics).map(lbl => {
      // reverse lookup label to key from chips dataset
      // Build a mapping once
      if (!apply._topicLabelMap) {
        apply._topicLabelMap = {};
        if (topicFiltersEl) {
          Array.from(topicFiltersEl.children).forEach(ch => {
            if (ch.dataset.topicKey) apply._topicLabelMap[ch.textContent] = ch.dataset.topicKey;
          });
        }
      }
      return apply._topicLabelMap[lbl] || lbl;
    })) : null;
    let filtered = data.filter(r => {
      // Tag AND logic
      if (tagFilter) {
        if (!r.tags || tagFilter.some(t => !r.tags.includes(t))) return false;
      }
      // Type AND logic
      if (typeFilter) {
        if (!r.types || typeFilter.some(t => !r.types.includes(t))) return false;
      }
      // Topic OR logic (global only)
      if (topicFilter) {
        if (!r.main || !topicFilter.has(r.main)) return false;
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
      if (key === 'main') return ((a.main||'').localeCompare(b.main||'')) * dir;
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
      if (isGlobal && r.main) metaBits.push(topicTitles[r.main] || r.main);
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
  if (searchInput) ['input','change'].forEach(ev => searchInput.addEventListener(ev, apply));
  if (sortSelect) sortSelect.addEventListener('change', apply);

  renderFilterChips();
  apply();
})();