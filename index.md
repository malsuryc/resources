---
layout: default
title: Home
---


{% assign all_resources = site.data.resources.resources %}
<div class="topics-grid">
{% for t in site.nav_topics %}
  {% assign rcount = all_resources | where: 'main', t.key | size %}
  <a class="topic-card" href="{{ '/topics/' | append: t.key | append: '/' | relative_url }}">
    <h3>{{ t.title }}</h3>
    <p>{{ rcount }} resource{% if rcount != 1 %}s{% endif %}</p>
  </a>
{% endfor %}
</div>

<!-- 
This is a multi-line comment.
It will not be visible in the rendered Markdown.

## Recently Added Resources

<p>Latest resources added across all topics (most recent first).</p>

{% assign all_sorted = all_resources | sort: 'added' | reverse %}

{% if all_sorted.size > 0 %}
<ul class="resource-list">
{% for r in all_sorted limit:5 %}
  {% assign topic_name = '' %}
  {% for t in site.nav_topics %}
    {% if t.key == r.main %}
      {% assign topic_name = t.title %}
    {% endif %}
  {% endfor %}
  <li class="resource-item">
    <h4><a href="{{ r.url }}" target="_blank" rel="noopener">{{ r.title }}</a></h4>
    <div class="resource-meta">
      {% if r.types and r.types.size > 0 %}<span>{{ r.types | join:'/' }}</span>{% elsif r.type %}<span>{{ r.type }}</span>{% endif %}
      {% if topic_name != '' %}<span>{{ topic_name }}</span>{% endif %}
      {% if r.level %}<span>{{ r.level }}</span>{% endif %}
      {% if r.rating %}<span>⭐{{ r.rating }}</span>{% endif %}
      {% if r.added %}<span>{{ r.added }}</span>{% endif %}
    </div>
    {% if r.description %}<p class="resource-desc">{{ r.description }}</p>{% endif %}
    {% if r.tags and r.tags.size > 0 %}
      <div class="badge-group">
        {% for tg in r.tags %}<span class="tag-badge" title="Tag: {{ tg }}">{{ tg }}</span>{% endfor %}
      </div>
    {% endif %}
  </li>
{% endfor %}
</ul>
{% else %}
<p>No resources yet.</p>
{% endif %}
-->
<span></span>
<div class="filters global-filters">
  <div class="filter-row primary-row">
    <input type="text" id="search" placeholder="Search (title, description, tags, types)" aria-label="Search all resources" />
    <label class="sort-label">Sort:
      <select id="sortSelect">
        <option value="added">Date Added (Newest)</option>
        <option value="-added">Date Added (Oldest)</option>
        <option value="title">Title (A-Z)</option>
        <option value="-title">Title (Z-A)</option>
        <option value="rating">Rating (High)</option>
        <option value="-rating">Rating (Low)</option>
        <option value="main">Topic (A-Z)</option>
        <option value="-main">Topic (Z-A)</option>
      </select>
    </label>
    <span id="resultCount" class="result-count" aria-live="polite"></span>
  </div>
  <div class="filter-row secondary-row">
    <div class="filter-group">
      <span class="filter-label">Topics:</span>
      <div class="topic-filters" id="topicFilters" aria-label="Filter by topic"></div>
    </div>
    <div class="filter-group">
      <span class="filter-label">Types:</span>
      <div class="type-filters" id="typeFilters" aria-label="Filter by type"></div>
    </div>
    <div class="filter-group">
      <span class="filter-label">Tags:</span>
      <div class="tag-filters" id="tagFilters" aria-label="Filter by tag"></div>
    </div>
  </div>
</div>

<ul id="resourceList" class="resource-list" aria-live="polite"></ul>

<noscript>
  <p><strong>Note:</strong> Enable JavaScript to use global interactive filtering. Basic list:</p>
  <ul>
  {% for r in all_resources %}
    <li><a href="{{ r.url }}" target="_blank" rel="noopener">{{ r.title }}</a>{% if r.description %} – {{ r.description }}{% endif %}</li>
  {% endfor %}
  </ul>
</noscript>

<script id="topic-data" type="application/json">
{
  "resources": {{ all_resources | jsonify }},
  "topic_titles": {
    {% for t in site.nav_topics %}"{{ t.key }}": {{ t.title | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}
  }
}
</script>

## Adding a New Topic

1. Add it to `nav_topics` in `_config.yml`.
2. Add entries with `main: <new-topic>` to `_data/resources.yml`.
3. Create `topics/<new-topic>.md` with front matter: 
   ```yaml
   ---
   layout: topic
   title: Your Title
   topic_key: new-topic
   ---
   ```
4. Commit & push. GitHub Pages will rebuild.

## Data Schema

Each resource entry supports:

```
title: string (required)
url: string (required)
description: short text
tags: [list of lowercase tags]
types: [list of resource type strings]
type: legacy single type (auto-upgraded internally)
level: beginner|intermediate|advanced|all
added: YYYY-MM-DD (for sorting)
rating: 1-5 (optional subjective quality)
author: optional string
language: e.g. en, ja
```