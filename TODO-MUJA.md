# TODO — things only Muja can provide

Everything here is a fact Claude Code must not invent. Fill it in `docs/CONTENT-INVENTORY.md`,
the named content file, or drop source material into `content-source/` (git-ignored).

## Formerly private entries — published on 2026-11-03 at Muja's request

These were inventory "Ask" rows. They are now public pages; their missing facts are hidden in production until filled.
- [ ] `src/content/research/` — nv-center-odmr, bee-venom-target-prioritisation (CV lists it as in preparation; may the target venue be named?), retinal-reliability (wording: screening / risk estimation, never diagnosis), dicke-measurement-timing, pauli-frame-repeater-overhead, photonic-qec-ai and music-inspired-ml (concepts → "Research directions")
- [ ] `src/content/projects/` — campusos, thought-to-reality, mujaverse ("Founder" role still unconfirmed), aura-accessibility

## Questions

- [ ] **Repo / URL.** DEPLOY.md names `mujahidmahfuz/mujahid-s-persona`, so the site is served at
      `https://mujahidmahfuz.github.io/mujahid-s-persona/` (base path set in `astro.config.mjs`). CLAUDE.md says the
      root user site `mujahidmahfuz.github.io`. To move to the root later: rename the repo and build with `SITE_BASE=/`.
- [ ] **Email.** The contact page uses the address on your CV (`mujahid168216@…`, assembled client-side). Confirm, or name another.
- [ ] **Sleep paper numbers.** Are the Binary-MNIST (239 vs 555) and Split CIFAR-10 (0.8733 / 0.8665 / 0.7926) numbers final after the 5-seed run? The CV says "sequential MNIST", the inventory "Binary-MNIST" — which is right?
- [ ] **"Homeostatic regulation of neural network training"** (CV, in preparation) — is this the sleep project, music-inspired ML, or a separate paper? It is not on the site yet.
- [ ] **Lossmap area.** Tagged `quantum-computing` because of the photonic-QEC context — correct?
- [ ] **ORCID** lists an SSRN preprint of BWA (doi:10.2139/ssrn.7292748). Link it from the BWA page?
- [ ] **Bio goal wording** — "seeking graduate research positions starting 2027"? (not published until confirmed)
- [ ] **Photos** — professional headshot + sports photos → `content-source/images/`.
- [ ] **Videos** — YouTube IDs (Unlisted is fine) with title, date, one-line description.
- [ ] **Student ID guard** — create `.env.local` with `STUDENT_ID_SHA256=<sha256 of your ID>` so the guard can check the build never contains it.
- [ ] **Analytics** — none added (SPEC §6 says ask first). GoatCounter is a free, cookie-free option if wanted.

- [ ] **BWA repo README** (github.com/mujahidmahfuz/bootstrap-wasserstein-alignment) says "ICML 2025", shows a placeholder Zenodo DOI (XXXXXXX) and numbers that differ from the published paper (e.g. Gini 0.684 vs 0.645). The site links the repo as code — please update the README to match the Knowledge-Based Systems version before reviewers click through.
- [ ] **Hybrid-Quantum-Classical-Image-Classifier** — not on the site: the notebook's loss stays ≈ 0.24, there is a target-shape broadcasting warning, and the test example is misclassified. Fix, re-run, then it can be added.
- [ ] **ALBERT sentiment repo** — not on the site: the README's example table lists words that are not in the example sentence, and image/Colab links are placeholders.
- [ ] **PL prediction README** lists Sheffield United among the promoted clubs; check the 2025/26 promoted sides before quoting the table elsewhere.
- [ ] **ai-orchestrator** has no README — the project page is written from the code; add a README and your "what I learned".
- [ ] **lossmap-percolation-2d** explainer is built but unverified (hidden in production) — review in `npm run dev`, then set `verified: true`.
- [ ] **photonic-qec-ai** (concept) and **Lossmap** describe the same project (Adaptive-Photonic-Quantum-Computer). Merge them?

## Explainers

Built — **unverified, so hidden in production** until you set `verified: true` in the paper's frontmatter.
Review each one with `npm run dev` (they show a pink "Draft" label) and tick its README checklist:
- [ ] `bwa-collapse` (BWA) — toy data; projection |e|/‖e‖₁ assumed; consensus drawn with a median stand-in for the barycenter
- [ ] `bwa-sparsity` (BWA) — real Gini numbers from the SSRN preprint abstract; check against the published tables
- [ ] `sleep-loop` (sleep) — structure only
- [ ] `sleep-results` (sleep) — real numbers; still marked "single run, 5-seed pending"
- [ ] `qgan-loop` (QIP) — general QGAN concept; check the configurations match your survey's taxonomy
- [ ] `doombreak-architecture` (DoomBreak) — structure from the inventory, not yet checked against the code

Still needed for "visuals from the paper": drop figures or PDFs into `content-source/papers/` (your accepted
manuscripts are usually reusable on a personal site — check each publisher's author rights).
- [ ] BWA: barycenter code or exported attribution arrays (to replace the median stand-in with the real computation)
- [ ] QIP: your own one-paragraph summary + the survey's category list (publisher withholds the abstract)
- [ ] Sleep: `results/*.json` from `run_experiments.py` (5-seed) and the gate's trigger rule
- [ ] Lossmap: lattice type and parameters for E001 and what "loss" means in it — no explainer built until then

<!-- AUTO-GENERATED BELOW — scripts/todos.ts rewrites everything under this line -->

## Placeholders found in content (73)

_Generated 2026-11-02 by `scripts/todos.ts`. In production builds each of these elements is hidden._

### Public pages (73)

- **src/content/awards/fujitsu-quantum-challenge.mdx**
  - [ ] date (YYYY-MM) (line 4)
  - [ ] any official result (line 12)
- **src/content/awards/icpc-regional.mdx**
  - [ ] certificate or standings link (line 8)
  - [ ] regional site name, team name, team-mates (with their permission) (line 12)
- **src/content/education/tiu-bachelor.mdx**
  - [ ] relevant coursework and academic honours (line 12)
- **src/content/projects/ai-orchestrator.mdx**
  - [ ] what you learned, and a README for the repo (it has none yet) (line 27)
- **src/content/projects/aura-accessibility.mdx**
  - [ ] your role (line 7)
  - [ ] start month (line 9)
  - [ ] description (line 18)
- **src/content/projects/campusos.mdx**
  - [ ] your role (line 7)
  - [ ] start month (line 9)
  - [ ] project description (line 18)
- **src/content/projects/doombreak.mdx**
  - [ ] your role (e.g. sole developer) (line 7)
  - [ ] start month (YYYY-MM) (line 9)
  - [ ] Play Store link once public (line 11)
  - [ ] repository URL (if public) (line 12)
  - [ ] one paragraph: why you built DoomBreak and who it is for (line 36)
- **src/content/projects/mujaverse.mdx**
  - [ ] Founder? (only if public) (line 7)
  - [ ] start month (line 9)
  - [ ] description and status (line 18)
- **src/content/projects/pqc-arduino.mdx**
  - [ ] your role (line 7)
  - [ ] start month (YYYY-MM) (line 9)
  - [ ] measured Flash/SRAM sizes and signing/verification timings (line 35)
- **src/content/projects/pqc-openvpn.mdx**
  - [ ] what worked, what broke, and any handshake measurements (line 24)
- **src/content/projects/qlnrs-fujitsu-challenge.mdx**
  - [ ] start month (YYYY-MM) (line 9)
  - [ ] end month (YYYY-MM) (line 10)
  - [ ] link to the final report PDF (if public) (line 12)
- **src/content/projects/quantum-cookbook.mdx**
  - [ ] your role (e.g. author) (line 7)
  - [ ] start month (YYYY-MM) (line 9)
- **src/content/projects/thought-to-reality.mdx**
  - [ ] your role (line 7)
  - [ ] start month (line 9)
  - [ ] project description (line 18)
- **src/content/research/bee-venom-target-prioritisation.mdx**
  - [ ] target venue (inventory: Briefings in Bioinformatics) — confirm it may be named publicly (line 7)
  - [ ] your role (line 8)
  - [ ] date (line 11)
  - [ ] problem statement (line 18)
  - [ ] the 11 workflow steps (line 24)
- **src/content/research/dicke-measurement-timing.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 20)
  - [ ] method summary (line 26)
- **src/content/research/lossmap-photonic-loss.mdx**
  - [ ] your role (line 8)
- **src/content/research/music-inspired-ml.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 17)
  - [ ] method summary (line 23)
- **src/content/research/nv-center-odmr.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 17)
  - [ ] model equations and constants (line 23)
- **src/content/research/pauli-frame-repeater-overhead.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 19)
- **src/content/research/photonic-qec-ai.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 19)
- **src/content/research/qip-2025.mdx**
  - [ ] what you did (e.g. literature review, writing, figures) (line 13)
  - [ ] confirm or replace this summary with your own words (it is based on Semantic Scholar's machine-generated summary of the abstract), and add the survey's main categories and conclusions (line 44)
- **src/content/research/retinal-reliability.mdx**
  - [ ] your role (line 7)
  - [ ] date (line 10)
  - [ ] problem statement (line 17)
  - [ ] method summary (line 23)
- **src/content/research/sleep-continual-learning.mdx**
  - [ ] last-update date (YYYY-MM) (line 9)
  - [ ] the gate's trigger rule, what is replayed, and buffer size (from run_experiments.py / paper draft) (line 50)
- **src/content/sports/tiu-soccer.mdx**
  - [ ] position and shirt number (line 8)
  - [ ] notable matches or goals, photos, and YouTube video IDs (line 16)
- **src/lib/bio.ts**
  - [ ] 150–250 words in your own voice — why these fields, what question drives you. (line 8)
- **src/pages/experience/[slug].astro**
  - [ ] dates (line 40)
- **src/pages/projects/[slug].astro**
  - [ ] highlights, each with a source (line 130)
  - [ ] what you learned, and the project's limitations (line 143)
- **src/pages/research/[slug].astro**
  - [ ] key findings, each with its source (paper section/table) (line 170)
  - [ ] limitations and honest notes (required section) (line 184)
- **src/pages/styleguide/index.astro**
  - [ ] sample placeholder (line 235)

### Private entries — not built (0)

