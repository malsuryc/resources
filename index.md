---
layout: default
title: Home
---

## Topics

<p>Browse curated resources by topic. Click a topic to explore, then refine with search, tags, and sorting. To add or edit resources, submit a pull request.</p>

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

## Global Search (Planned)

Future enhancement: cross-topic search page aggregating all data.