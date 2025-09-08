---
layout: default
title: Home
---

## Topics

<p>Browse curated resources by topic. Click a topic to explore, then refine with search, tags, and sorting. To add or edit resources, submit a pull request.</p>

<div class="topics-grid">
{% for t in site.nav_topics %}
  {% assign rcount = site.data.topics[t.key].resources | size %}
  <a class="topic-card" href="{{ '/topics/' | append: t.key | append: '/' | relative_url }}">
    <h3>{{ t.title }}</h3>
    <p>{{ rcount }} resource{% if rcount != 1 %}s{% endif %}</p>
  </a>
{% endfor %}
</div>

## Adding a New Topic

1. Create a data file in `_data/topics/<new-topic>.yml` following existing structure.
2. Add it to `nav_topics` in `_config.yml`.
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
type: article|video|book|course|tool|repo|paper|other
level: beginner|intermediate|advanced|all
added: YYYY-MM-DD (for sorting)
rating: 1-5 (optional subjective quality)
author: optional string
language: e.g. en, ja
```

## Global Search (Planned)

Future enhancement: cross-topic search page aggregating all data.