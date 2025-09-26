# Learning Resources Site

A resources site for learning

## Structure

```
_config.yml                # Site config + topic navigation
_layouts/                  # Layout templates
_data/resources.yml        # Combined resources data (each item has 'main' topic key)
topics/*.md                # Topic pages (one per topic)
assets/css/style.css       # Styles
assets/js/filter.js        # Filtering/sorting logic
construct.py               # YAML constructor
index.md                   # Landing page with topic cards
```

## Resource Entry Schema

| Field         | Description                                                      |
| ------------- | ---------------------------------------------------------------- |
| main          | Classfication / Topic key of the resource (required)             |
| title         | Name of the resource (required)                                  |
| url           | Link (required)                                                  |
| description   | Short summary                                                    |
| tags          | List of lowercase tags (for filtering)                           |
| types         | Array of types (e.g.`["book", "course", "jupyter-notebook"]`)  |
| type (legacy) | Single type string (still supported, auto-upgraded to `types`) |
| level         | beginner                                                         |
| added         | YYYY-MM-DD (sorting)                                             |
| rating        | 1-5 subjective quality score                                     |
| author        | Optional author/source                                           |
| language      | e.g. en, ja                                                      |

## Adding a Resource

1. Use `construct.py` to construct a new resource.
2. Edit `_data/resources.yml` and append the new item under `resources:`.
   - Tags should be short and consistent (e.g. `deep-learning` not `Deep Learning`).
   - If a resource belongs to multiple types, use the `types:` array.
   - If you provide only `type:`, it will be treated as `[type]` automatically.
3. Commit & push to `gh-pages`.

## Adding a Topic

1. Add entry to `nav_topics` in `_config.yml`.
2. Add entries with `main: <key>` into `_data/resources.yml`.
3. Create `topics/<key>.md` with front matter:
   ```yaml
   ---
   layout: topic
   title: Descriptive Title
   topic_key: <key>
   ---
   ```
4. Commit & push to `gh-pages`.

## Local Preview

Install Ruby + Bundler, then:

```
bundle init # if Gemfile not present
echo "gem 'github-pages', group: :jekyll_plugins" >> Gemfile
bundle install
bundle exec jekyll serve
```

## Roadmap / Ideas

- [X] Global search across all topics (build merged JSON)
- [ ] Import from CSV / Google Sheet
- [X] Sorter after constructor to ease manual insert
- [ ] A course section storing course material (pdf...)
- [ ] OpenAI bridge to utilize LLM to construct better description, tags, and types
