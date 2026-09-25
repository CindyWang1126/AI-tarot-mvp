# Source audit

Audit date: 2026-09-26

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
- Naming and visual proportions are consistent; before remediation, `RWS1909_-_Swords_10.jpeg` was the only image without a knowledge record.
- The repo does not include an embedded source URL or standalone license file for these JPEG copies.

Decision (updated 2026-09-26): use the retained full-scene Rider–Waite–Smith 1909 JPEG set as the production deck. Independent public-domain corroboration is available from Wikimedia Commons for the [complete Major Arcana](https://commons.wikimedia.org/wiki/File:Rider-Waite_Major_Arcana_full.png), [Ten of Swords](https://commons.wikimedia.org/wiki/File:Swords10.jpg), [The Star](https://commons.wikimedia.org/wiki/File:The_Star,_Waite-Smith_Tarot_Deck,_Yale_University.jpg), and Yale University Library scan of the [Queen of Cups](https://commons.wikimedia.org/wiki/File:Queen_of_Cups,_Waite-Smith_Tarot_Deck,_Yale_University.jpg). The repository copies visually match that 1909 deck, although their original download URLs were not recorded in the repo.

Production now has exactly 78 fixed JPEGs under `public/cards/`, with a stable one-to-one `/cards/<card-id>.jpeg` mapping. `scripts/generate-tarot-card-assets.ts` copies the retained source files and normalizes reader-facing Chinese names; it does not synthesize art. The prior abstract SVG deck is preserved under `legacy/assets/generated-symbol-deck/` and is not referenced by production. The UI retains a CSS fallback card visual, so an image loading failure does not remove a card from the draw pool.

The provided card-back photograph and visual board informed atmosphere and palette only. They were not copied into the production card faces. The cinematic hero background is an original generated scene without embedded text, logos, or card artwork.

## Retained material

- Original Streamlit source and Python requirements under `legacy/`.
- Clean remote demo notebook under `research/`.
- Original JSON files under `legacy/data/`.
- All original JPEGs under `legacy/assets/cards/`.
- Previous abstract SVG deck under `legacy/assets/generated-symbol-deck/`.
- Previous YouTube demo link in the README legacy section.

## Excluded from production

- Streamlit, Pillow, Python OpenAI client, notebook execution, Colab paths, local image loading, and raw Markdown/prose rendering.
- The local-only notebook revision that contained an embedded credential.
- The large local demo MOV and miscellaneous editor/system artifacts that were already absent from the latest GitHub `main`.
