# CONTENT INVENTORY — Facts Claude Code May Use

**Rule:** Claude Code may only publish facts from this file, from files Muja adds to `content-source/`, or from Crossref/ORCID/GitHub sync. Anything else is `TODO(muja)`.

Muja: edit this file freely. Fix anything wrong, fill the TODOs, and delete rows you do not want public. Columns marked **Show?** are suggestions — you decide.

---

## 1. Identity

| Field | Value | Show? |
|---|---|---|
| Full name | Md Mujahidul Islam | Yes |
| Short name | Muja | Yes (nickname in bio) |
| Current position | Undergraduate, Digital Business & Innovation (DBI) major, Tokyo International University (TIU), Japan — 7th semester (as of Nov 2026) | Yes |
| Expected graduation | August 2027 | Yes |
| Affiliation | Institute for International Strategy and Emerging Technologies | Yes |
| Advisor | — | **Do not show as advisor** (Muja, Nov 2026). Prof. Fatih Ozaydin is shown only as the supervisor of the TA and SA roles, linked to https://tiu-iis.org/fatih-ozaydin/ as evidence |
| Research interests | Machine learning & explainable AI; quantum computing and quantum networking; neural networks & neuromorphic computing; computational biology; neuro/cognitive science | Yes |
| Goal | Master's / PhD (targets not to be listed publicly unless Muja wants) | Bio wording: "seeking graduate research positions starting 2027" — TODO(muja): confirm |
| Google Scholar | https://scholar.google.com/citations?hl=en&user=lgPRHn0AAAAJ | Yes |
| ORCID | 0009-0007-8507-3370 | Yes |
| GitHub | https://github.com/mujahidmahfuz | Yes — TODO(muja): confirm |
| LinkedIn | TODO(muja) | |
| Email | TODO(muja): which address to show (obfuscated) | |
| Photo | TODO(muja): professional headshot + 1 sports photo | |
| Student ID | — | **Never publish** |
| GPA | — | Hidden unless Muja opts in |

## 2. Publications (status set by Crossref at build)

| Slug | DOI | Venue (stated) | Notes | Show? |
|---|---|---|---|---|
| `bwa-bootstrap-wasserstein-alignment` | 10.1016/j.knosys.2026.117182 | Knowledge-Based Systems (Q1) | Co-author Priya Dubey. Aggregates bootstrap-replicate SHAP attributions via an entropic Wasserstein barycenter; two variants BWA-v1 (hard binomial sign test + global normalisation) and BWA-v2 (magnitude-weighted Bayesian soft sign + per-feature median-absolute scaling). Featured | Yes, featured |
| `qip-2025` | 10.1007/s11128-025-05044-6 | Quantum Information Processing | Title, authors, abstract from Crossref. TODO(muja): one-paragraph plain summary + my role | Yes, featured |

## 3. Research (in progress / reports)

| Slug | Status (suggested) | Facts available | Show? |
|---|---|---|---|
| `sleep-continual-learning` | in-progress | Biologically inspired "sleep" (replay/consolidation) to mitigate catastrophic forgetting. Phases: fixed-interval sleep baseline → heuristic gate → learned policy (contextual bandit, REINFORCE). Binary-MNIST: heuristic gate used 239 sleeps vs 555 for fixed with accuracy maintained. Split CIFAR-10 with graduated micro/light/deep sleep; multi-head run: Adaptive avg 0.8733 vs Fixed Deep 0.8665 vs No Sleep 0.7926. Heuristic gate is the primary result; learned policy documented as analysis. TODO(muja): confirm which numbers are final after the 5-seed run | Yes, featured |
| `lossmap-photonic-loss` | in-progress | Simulation-first research on photonic loss-landscape inference; E001 percolation experiment passed at 0.70σ; 34-page technical report with 13 figures | Yes |
| `nv-center-odmr` | in-progress | Computational-only; low-field CW-ODMR treated as a non-identifiable inverse problem with degeneracy-aware calibrated posterior inference. TODO(muja): status, results | Ask |
| `bee-venom-target-prioritisation` | in-preparation | Computational therapeutic-target prioritisation for TNBC and GBM using bee-venom peptides (melittin P01501, apamin P01500, secapin I1VC85, PLA2 P00630, MCD P01499); 11-step computational workflow; targeting *Briefings in Bioinformatics* | Ask (pre-publication) |
| `retinal-reliability` | in-progress | Reliability of retinal foundation models for systemic-disease screening/risk prediction: transportability, calibration, uncertainty, explanation stability; flagship "Retinal Reliability Score" with reason codes. Wording: screening / risk estimation, never diagnosis | Ask |
| `dicke-measurement-timing` | accepted (ACDSA 2027, full paper; acceptance letter 23 Oct 2026) | “Mid-Circuit Probe Measurement Reduces Cost in Dicke State Expansion under Restricted Qubit Access”, with F. Ozaydin; earliest safe measurement gate 21/24; ~3% abstract / ~1% real two-qubit gate saving; standard protocol Pareto-optimal | Yes |
| `pauli-frame-repeater-overhead` | archived (portfolio) | Classical overhead of distributed Pauli-frame management in multi-hop repeater networks; eight formal phases + Monte-Carlo; re-derives established results (Dai & Towsley; Fischer & Towsley) | Optional — label "learning project" |
| `photonic-qec-ai` | concept | AI-assisted reliability for photonic quantum computing: understand → predict → act; simulation-first | Ask (concepts may go in a "Research directions" section) |
| `music-inspired-ml` | TODO(muja): status | Music-derived temporal/regulatory principles (rhythm, tension/resolution) as self-regulation mechanisms for ML | Ask |

## 4. Projects

| Slug | Status (suggested) | Facts available | Show? |
|---|---|---|---|
| `qlnrs-fujitsu-challenge` | archived (competition) | Hybrid quantum-classical VRP solver (Quantum Large Neighbourhood Risk Search) for the Fujitsu Quantum Simulator Challenge 2025-26 (report submitted 27 May 2026); CP-QAOA on a local subspace simulator; one penalty-QUBO job on Fujitsu mpiQulacs (7911328, 0.2% feasible) — the CV's "Slurm jobs on FX700" is not supported by the report; transposition mixer, risk-weighted destroy, k²-dimensional encoding; report honestly documents no demonstrated quantum advantage in route cost | Yes |
| `doombreak` | prototype (Play Console closed testing) | Flutter/Kotlin Android app for doom-scrolling management: session timer state machine, full-screen lock overlay, escalating reminders, Mission Mode, "Save Me", AI coaching via FastAPI + Groq (Llama 3.3 70B), native usage tracking, Net Momentum score, streaks, CSV export; 41 model tests | Yes, featured |
| `quantum-cookbook` | in-progress | Interactive static-HTML quantum-computing textbook; verify-first numerical checks before widgets. **External link** to https://mujahidmahfuz.github.io/quantum-cookbook/ | Yes |
| `pqc-arduino` | in-progress (from 2026-06) | NIST PQC fully on Arduino UNO (2 KB RAM / 32 KB Flash / 1 KB EEPROM): CCA-secure ML-KEM-512 (934 ms enc / 133 ms dec), ML-KEM-768/1024, SLH-DSA-128s verify 25.5 s; ML-KEM-512 security audit; PQC-Restore checkpointing; ML-DSA not yet tested (source: Portable_PQC_Container/…/ROADMAP.md, 17 Sep 2026); plus PQC-migration defect taxonomy mined from 8 GitHub repos | Yes |
| `campusos` | in-progress | AI-native campus platform for TIU: social feed, clubs, academics, AI assistant; three-tier identity (official / pseudonymous / anonymous) | Ask |
| `thought-to-reality` | concept | BCI/AI: thought-driven digital tasks and device control for bedridden elderly, people with disabilities, and children | Ask |
| `mujaverse` | TODO(muja) | AI-first research & technology company | Ask — show as "Founder" only if public |
| `aura-accessibility` | concept / archived | AI companion for blind users (Android Accessibility Service) | Probably hide |

## 5. Experience

| Slug | Role | Org | Facts | Dates |
|---|---|---|---|---|
| `ta-intro-python` | Teaching Assistant | TIU — Introduction to Python | | TODO(muja) |
| `ta-intro-informatics` | Teaching Assistant | TIU — Introduction to Informatics | | TODO(muja) |
| `sa-blockchain` | Student Assistant | TIU — Blockchain | | TODO(muja) |
| `undergraduate-researcher` | Undergraduate researcher | Institute for International Strategy and Emerging Technologies, TIU | | TODO(muja) |

## 6. Achievements

| Slug | Title | Facts | TODO |
|---|---|---|---|
| `icpc-regional` | ICPC — 28th place, regional level | | TODO(muja): year, regional name, team name, team-mates (with permission), certificate link |
| `bwa-kbs-publication` | Q1 journal publication (Knowledge-Based Systems) | | — |
| `fujitsu-quantum-challenge` | Participant, Fujitsu Quantum Simulator Challenge 2025-26 | | TODO(muja): any official result |

## 7. Sports

| Slug | Facts | TODO |
|---|---|---|
| `tiu-soccer` | Tokyo International University soccer team, Nov 2023 – Jul 2025; competed in the Kanto League and Saitama League | TODO(muja): position, number, notable matches/goals, photos, video links (YouTube IDs) |

## 8. Videos

| Slug | Category | YouTube ID | TODO |
|---|---|---|---|
| — | sports | — | TODO(muja): upload clips to YouTube (Unlisted is fine), paste IDs here with title + date + 1-line description |

## 9. Bio drafts (Claude Code may refine wording, not facts)

- **Short (≈ 40 words, first person):** I am Md Mujahidul Islam, known as Muja — an undergraduate researcher at Tokyo International University working on explainable AI, continual learning and quantum information. My work appears in *Knowledge-Based Systems* and *Quantum Information Processing*.
- **Long:** TODO(muja): 150–250 words in your own voice — why these fields, what question drives you.

## 10. Where Muja drops raw material

```
content-source/
  papers/        # PDFs, LaTeX, figures
  results/       # JSON/CSV exported from experiments
  reports/       # technical reports
  images/        # photos, screenshots (original resolution)
  notes.md       # anything else
```

Claude Code reads from here, never from guesses.

## 11. Sources added in Nov 2026

- **GitHub READMEs/code** (github.com/mujahidmahfuz): LLM-Council, ai-orchestrator, PL_2025_ML_Prediction,
  Post-Quantum-Cryptography-in-OpenVPN, Adaptive-Photonic-Quantum-Computer (= Lossmap; E001 p_c =
  0.499520 ± 0.000682 vs 0.5), bootstrap-wasserstein-alignment (linked as code only — its README's numbers
  and "ICML 2025" badge conflict with the published paper), PQC-Arduino.
- **BWA preprint abstract** (SSRN, doi:10.2139/ssrn.7292748) — method and results on the BWA page.
- **Epigraphs** are not facts about Muja; they live in `src/data/epigraphs.ts` with their own verification
  rules (DESIGN §5). Original reflections there were drafted for the site — Muja may replace any of them.
