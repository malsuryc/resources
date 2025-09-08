# Learning Resources Site

Static, data-driven resource library built with GitHub Pages (Jekyll, no custom plugins) enabling topic pages with client-side filtering, tagging, and sorting.

## Structure

```
_config.yml                # Site config + topic navigation
_layouts/                  # Layout templates
_data/topics/              # YAML data per topic (resources)
topics/*.md                # Topic pages (one per topic)
assets/css/style.css       # Styles
assets/js/filter.js        # Filtering/sorting logic
index.md                   # Landing page with topic cards
```

## Resource Entry Schema

| Field | Description |
|-------|-------------|
| title | Name of the resource (required) |
| url | Link (required) |
| description | Short summary |
| tags | List of lowercase tags (for filtering) |
| type | article|video|book|course|tool|repo|paper|documentation|other |
| level | beginner|intermediate|advanced|all |
| added | YYYY-MM-DD (sorting) |
| rating | 1-5 subjective quality score |
| author | Optional author/source |
| language | e.g. en, ja |

## Adding a Resource

Edit the relevant YAML file under `_data/topics/`. Append a new item under `resources:` following the schema. Keep date format consistent (YYYY-MM-DD). Tags should be short and consistent (e.g. `deep-learning` not `Deep Learning`).

## Adding a Topic

1. Create `_data/topics/<key>.yml` with `resources:` array.
2. Add entry to `nav_topics` in `_config.yml`.
3. Create `topics/<key>.md` with front matter:
   ```yaml
   ---
   layout: topic
   title: Descriptive Title
   topic_key: <key>
   ---
   ```
4. Commit & push to `gh-pages` (or default branch per Pages settings).

## Local Preview

Install Ruby + Bundler, then:

```
bundle init # if Gemfile not present
echo "gem 'github-pages', group: :jekyll_plugins" >> Gemfile
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.

## Roadmap / Ideas

- Global search across all topics (build merged JSON)
- Offline cache via Service Worker
- Per-resource detail pages + notes
- Import from CSV / Google Sheet
- Tag usage analytics

## License

Specify a license (e.g., MIT) if you want external contributions.

---
Maintained by Cyrus Lam. Contributions welcome.