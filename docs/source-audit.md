# Source audit

Audit date: 2026-09-25

## Existing application

The original production entry was a 64-line Streamlit script. It loaded `tarot_cards.json`, sampled three cards with Python `random.sample`, independently chose upright/reversed orientation, displayed local JPEG files, and sent one free-form Chinese prompt to Chat Completions.

Key limitations:

- No stable reading ID or browser persistence; every run could create a new draw.
- No categories, confirmation, reveal flow, retry contract, duplicate-submit protection, timeout, or rate limit.
- One free-form prompt with no system instruction or output schema.
- No server-side revalidation boundary between client-supplied card data and AI input.
- Raw prose output made it impossible to enforce exactly three cards, fixed order, or orientation consistency.
- Notebook and Colab-specific paths were mixed with application logic.

## Knowledge data

Two JSON sources were present:

| Source | Count | Result |
| --- | ---: | --- |
| `tarot_cards.json` | 77 | 22 Major + 55 Minor |
| `tarot_minor_arcana_final_full_rewrite_56.json` | 55 | Same Minor records |

All 77 usable records share `name`, `image`, `meaning_up`, and `meaning_rev`. No duplicate names or image mappings were found. Every record has both upright and reversed text.

The historical source gap was **寶劍 10 / Ten of Swords**. Its image existed, but no upright or reversed meaning was present in either retained legacy JSON source or notebook.

Production completeness remediation (2026-09-26): the missing card was added directly to the canonical production dataset with complete upright, reversed, keywords, reflection, and legacy image mapping fields. Production now validates exactly 78 cards: 22 Major, 56 Minor, and 14 cards in each suit. The runtime draw pool is an unfiltered mapping of those same 78 canonical IDs.

## Image assets

- 78 JPEG images exist under the legacy asset folder.
- Dimensions range from approximately 812–860 px wide and 1412–1459 px high.
- Total size is approximately 21 MB.
- Naming and visual proportions are consistent; the source-data mapping is complete except that `RWS1909_-_Swords_10.jpeg` has no knowledge record.
- The repo does not include a source URL, license text, or commercial-use proof for the files.

Decision: retain every original file under `legacy/assets/cards/`, but do not copy or load them in the production web UI. The production card front and back are original CSS geometry using midnight navy, silver, and ice-blue motifs.

## Retained material

- Original Streamlit source and Python requirements under `legacy/`.
- Clean remote demo notebook under `research/`.
- Original JSON files under `legacy/data/`.
- All original JPEGs under `legacy/assets/cards/`.
- Previous YouTube demo link in the README legacy section.

## Excluded from production

- Streamlit, Pillow, Python OpenAI client, notebook execution, Colab paths, local image loading, and raw Markdown/prose rendering.
- The local-only notebook revision that contained an embedded credential.
- The large local demo MOV and miscellaneous editor/system artifacts that were already absent from the latest GitHub `main`.
