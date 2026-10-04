import { ExamAnswerResult, StudyNote, Flashcard, PlannerTask, StudyHabit, ReflectionEntry } from "../types";

export const SAMPLE_EXAM_ANSWERS: ExamAnswerResult[] = [
  {
    id: "sample-16-mark-econ",
    title: "Evaluate the effectiveness of contractionary monetary policy in reducing demand-pull inflation (16 Marks)",
    subject: "Economics",
    topic: "Macroeconomics & Inflation",
    question: "Evaluate the view that contractionary monetary policy is the most effective policy to reduce demand-pull inflation in an open economy. (16 marks)",
    marks: 16,
    examBoard: "AQA / Edexcel A-Level",
    recommendedTimeMinutes: 24,
    timeGuidance: "Suggested allocation: 3 minutes planning & thesis, 16 minutes analytical body paragraphs, 5 minutes evaluation and justified judgment.",
    modelAnswer: `## Executive Introduction & Conceptual Foundations

Demand-pull inflation arises when **aggregate demand (AD) outpaces aggregate supply (AS)** near full employment capacity ($Y_{fe}$), pulling up the general price level ($P_1 \\rightarrow P_2$). Contractionary monetary policy, typically conducted by an independent central bank (e.g. the Bank of England's MPC), utilizes policy interest rates (Bank Rate) and Quantitative Tightening (QT) to dampen AD.

$$\\text{AD} = C + I + G + (X - M)$$

---

## 1. Transmission Mechanism: Impact on Consumption ($C$) and Investment ($I$)

An increase in the central bank base rate cascades into retail banking rates:

1. **Cost of Borrowing**: Commercial interest rates on mortgages, credit cards, and business loans increase. Higher borrowing costs decrease disposable income for indebted households ($C \\downarrow$) and raise the hurdle rate for capital investment projects ($I \\downarrow$).
2. **Incentive to Save**: Higher marginal returns on deposit accounts raise the opportunity cost of immediate expenditure, causing households to defer discretionary purchases.
3. **Wealth Effect**: Asset prices (equities and residential real estate) decline due to higher discounting rates, dampening consumer confidence and perceived net worth.

Consequently, both consumption and investment contract, causing a leftward shift of Aggregate Demand:

$$\\text{AD}_1 \\rightarrow \\text{AD}_2$$

This alleviates positive output gaps and eases inflationary pressure.

---

## 2. Exchange Rate Channel in an Open Economy

In an open macroeconomic environment, the policy rate hike triggers the **exchange rate transmission channel**:

* **Hot Money Inflows**: Global financial investors shift liquid capital into domestic high-yielding currency deposits to capitalize on the interest differential.
* **Currency Appreciation**: Demand for the domestic currency rises, leading to nominal appreciation ($S \\uparrow$).
* **Trade Balance Impact**: Stronger domestic currency renders exports relatively dearer abroad and imports cheaper domestically (WIDEC: Weak In, Dear Exports / SPICED: Strong Pound Imports Cheaper Exports Dearer). Assuming the **Marshall-Lerner condition** ($|PED_x + PED_m| > 1$) holds, net exports decline ($(X - M) \\downarrow$), further cooling AD and lowering import-cost inflation.

---

## 3. Critical Limitations and Counter-Evaluations

| Analytical Dimension | Strength / Efficacy | Critical Limitation / Vulnerability |
| :--- | :--- | :--- |
| **Transmission Time Lags** | Systematic & rules-based | Empirical lags of **18–24 months** before full effect manifests |
| **Distributional Impact** | Rewards savers & stabilizes purchasing power | Disproportionately penalizes leveraged mortgagees and SMEs |
| **Supply-Side Damage** | Halts overheating immediately | High interest rates throttle R&D capital expenditure ($I \\downarrow$), reducing Long-Run AS ($LRAS$) |
| **Nature of Inflation** | Highly effective for Demand-Pull | Ineffective against Cost-Push shocks (energy price spikes, supply chain bottlenecks) |

---

## 4. Evaluative Synthesis & Examiner Judgment

In conclusion, while contractionary monetary policy is the orthodox first-line response to demand-pull inflation, its ultimate efficacy hinges decisively on:

1. **The Origin of Inflationary Shocks**: If inflation is driven by supply-side commodity price surges, raising rates risks precipitating **stagflation** by depressing output without resolving imported cost inputs.
2. **Current Household Leverage Profiles**: If a majority of households hold fixed-rate mortgages, the domestic contractionary impulse is significantly delayed.
3. **Complementary Fiscal Policy**: Monetary policy must not fight against expansionary fiscal deficits. Optimal stabilization requires coordinated contractionary fiscal measures alongside monetary tightening to safeguard long-term investment.`,
    rubric: [
      {
        marks: "1–4 Marks (AO1: Knowledge)",
        objective: "Demonstrate accurate knowledge of contractionary monetary policy mechanisms and inflation definitions.",
        criteria: "Clear definition of demand-pull inflation, AD equation components, and base rate mechanics.",
        howToEarn: "Explicitly identify $C, I, (X-M)$ channels and state how central bank policy rate shifts commercial lending rates."
      },
      {
        marks: "5–8 Marks (AO2: Application)",
        objective: "Apply economic theory to open economy dynamics.",
        criteria: "Demonstrate exchange rate hot money transmission and import/export price elasticity dynamics.",
        howToEarn: "Reference the exchange rate channel (SPICED) and cite the Marshall-Lerner condition."
      },
      {
        marks: "9–12 Marks (AO3a: Analysis)",
        objective: "Rigorous step-by-step causal mechanisms without analytical gaps.",
        criteria: "Detailed link from interest rates to mortgage discretionary income, business hurdle rates, asset wealth effects, and AD shifts.",
        howToEarn: "Ensure every point follows: Trigger $\\rightarrow$ Intermediate Mechanism $\\rightarrow$ Final Macroeconomic Outcome."
      },
      {
        marks: "13–16 Marks (AO3b: Evaluation)",
        objective: "Substantiated critical judgment and contextual evaluation.",
        criteria: "Evaluates time lags (18-24 months), conflict with LRAS investment, supply-side vs demand-side inflation, and delivers a justified final verdict.",
        howToEarn: "Weigh 'It depends upon' conditions: proportion of fixed-rate mortgages, elasticity of exports, and complementary fiscal stance."
      }
    ],
    commonPitfalls: [
      "Failing to distinguish between demand-pull inflation and cost-push inflation.",
      "Assuming interest rate hikes work instantaneously without mentioning the empirical 18–24 month lag.",
      "Neglecting the open economy aspect (forgetting the exchange rate and hot money flows).",
      "Treating evaluation as a brief afterthought rather than a balanced, sustained critique."
    ],
    mnemonicHooks: [
      {
        acronym: "SPICED",
        expansion: "Strong Pound Imports Cheaper Exports Dearer",
        description: "Recall the currency appreciation transmission channel for open economies."
      },
      {
        acronym: "TIME",
        expansion: "Transmission Lags, Investment Harm, Mortgage Pain, External Supply Shocks",
        description: "The 4 core counter-evaluation arguments against interest rate hikes."
      }
    ],
    keyVocabulary: [
      { term: "Marshall-Lerner Condition", definition: "A currency devaluation/appreciation will improve/deteriorate the trade balance only if $|PED_x + PED_m| > 1$." },
      { term: "Transmission Lag", definition: "The time elapsed between a monetary policy decision and its measurable real-economy impact (typically 18 to 24 months)." },
      { term: "Hurdle Rate", definition: "The minimum rate of return a company requires before investing capital in a project." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-10-mark-bio",
    title: "Explain the mechanism of action potential generation and synaptic transmission (10 Marks)",
    subject: "Biology",
    topic: "Neurobiology & Cell Signalling",
    question: "Describe and explain how a nerve impulse is generated along an axon and transmitted across a chemical synapse. (10 marks)",
    marks: 10,
    examBoard: "Cambridge CIE / AQA Biology",
    recommendedTimeMinutes: 15,
    timeGuidance: "Suggested allocation: 2 minutes planning sequencing, 10 minutes chronological physiological writing, 3 minutes terminology review.",
    modelAnswer: `## Phase 1: Action Potential Generation along the Axon (5 Marks)

1. **Resting Potential (-70 mV)**: Maintained by the **$\\text{Na}^+/\\text{K}^+$ ATPase pump** (pumping $3\\text{Na}^+$ ions out for every $2\\text{K}^+$ ions in) and non-gated $\\text{K}^+$ leak channels, establishing a polarized membrane with an electrochemical gradient.
2. **Depolarization to Threshold (-55 mV)**: When a stimulus occurs, local voltage-gated $\\text{Na}^+$ channels open. If threshold is reached, positive feedback opens all voltage-gated $\\text{Na}^+$ channels, causing a rapid influx of $\\text{Na}^+$ down their electrochemical gradient until membrane potential reaches **+40 mV**.
3. **Repolarization**: At +40 mV, voltage-gated $\\text{Na}^+$ channels inactivate and voltage-gated $\\text{K}^+$ channels open, causing rapid $\\text{K}^+$ efflux.
4. **Hyperpolarization & Refractory Period**: Delayed closing of $\\text{K}^+$ channels causes the potential to dip below -70 mV. The absolute refractory period ensures unidirectional impulse propagation and sets an upper limit on impulse frequency.

---

## Phase 2: Transmission across the Chemical Synapse (5 Marks)

1. **Calcium Influx**: The arrival of the action potential at the presynaptic terminal depolarizes the synaptic knob, triggering the opening of **voltage-gated $\\text{Ca}^{2+}$ channels**. $\\text{Ca}^{2+}$ ions enter by facilitated diffusion down their concentration gradient.
2. **Vesicle Exocytosis**: Elevated intracellular $\\text{Ca}^{2+}$ stimulates synaptic vesicles containing acetylcholine (ACh) to translocate and fuse with the presynaptic membrane, releasing ACh into the **synaptic cleft** via exocytosis.
3. **Receptor Binding**: ACh diffuses across the $20\\text{–}30\\text{ nm}$ synaptic cleft and binds specifically to **ligand-gated $\\text{Na}^+$ receptor channels** on the postsynaptic membrane.
4. **Postsynaptic Depolarization**: Binding causes a conformational change in the receptor proteins, opening $\\text{Na}^+$ channels. $\\text{Na}^+$ rushes into the postsynaptic cell, producing an **Excitatory Postsynaptic Potential (EPSP)**. If threshold is exceeded, a new action potential is initiated.
5. **Hydrolysis & Recapture**: **Acetylcholinesterase** hydrolyzes ACh into acetate and choline, terminating the signal and preventing continuous desensitization. Choline is actively reabsorbed by the presynaptic bulb for re-synthesis with ATP.`,
    rubric: [
      {
        marks: "1–3 Marks",
        objective: "Ion movements in axon depolarization and repolarization.",
        criteria: "Correct identification of $\\text{Na}^+$ influx for depolarization and $\\text{K}^+$ efflux for repolarization with numerical mV milestones.",
        howToEarn: "State resting potential (-70 mV), threshold (-55 mV), and peak overshoot (+40 mV)."
      },
      {
        marks: "4–6 Marks",
        objective: "Presynaptic calcium mechanisms and exocytosis.",
        criteria: "Voltage-gated $\\text{Ca}^{2+}$ influx inducing vesicle fusion and exocytosis into the cleft.",
        howToEarn: "Emphasize $\\text{Ca}^{2+}$ enters down its electrochemical gradient to trigger vesicle mobilization."
      },
      {
        marks: "7–10 Marks",
        objective: "Postsynaptic receptor specificity, EPSP generation, and neurotransmitter breakdown.",
        criteria: "Ligand-gated channel opening, $\\text{Na}^+$ entry producing EPSP, and acetylcholinesterase breakdown.",
        howToEarn: "Contrast presynaptic voltage-gated channels with postsynaptic ligand-gated receptor channels."
      }
    ],
    commonPitfalls: [
      "Confusing voltage-gated channels (on axon and presynaptic knob) with ligand-gated channels (on postsynaptic membrane).",
      "Stating that the action potential itself jumps across the synaptic cleft (it is converted to a chemical signal).",
      "Omitting acetylcholinesterase, leaving the signal indefinitely active."
    ],
    mnemonicHooks: [
      {
        acronym: "D.R.H.R.",
        expansion: "Depolarize (Na+ in), Repolarize (K+ out), Hyperpolarize (K+ delay), Refractory",
        description: "Remember the 4 consecutive phases of the axon action potential."
      },
      {
        acronym: "C.E.D.B.",
        expansion: "Calcium influx, Exocytosis of ACh, Diffusion across cleft, Binding to receptors",
        description: "Sequence of synaptic transmission events."
      }
    ],
    keyVocabulary: [
      { term: "Excitatory Postsynaptic Potential (EPSP)", definition: "A temporary partial depolarization of postsynaptic membrane potential caused by neurotransmitter-gated ion channels." },
      { term: "Refractory Period", definition: "The period following an action potential during which an excitable cell cannot generate another action potential." }
    ],
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_STUDY_NOTES: StudyNote[] = [
  {
    id: "note-1",
    title: "Enzyme Kinetics & Michaelis-Menten Derivation",
    subject: "Biochemistry",
    tags: ["Enzymes", "Kinetics", "Lineweaver-Burk"],
    isStarred: true,
    marksAssociated: 8,
    wordCount: 420,
    readingTimeMinutes: 3,
    content: `## 1. The Quasi-Steady-State Assumption

In the classic reaction scheme:

$$E + S \\underset{k_{-1}}{\\overset{k_1}{\\rightleftharpoons}} ES \\xrightarrow{k_2} E + P$$

The Briggs-Haldane steady-state hypothesis posits that the concentration of the enzyme-substrate complex $[ES]$ remains constant over the initial velocity phase:

$$\\frac{d[ES]}{dt} = k_1[E][S] - (k_{-1} + k_2)[ES] = 0$$

## 2. Derivation of the Michaelis Constant ($K_m$)

We define the Michaelis constant $K_m$ as:

$$K_m = \\frac{k_{-1} + k_2}{k_1}$$

Substituting total enzyme conservation $[E]_0 = [E] + [ES]$:

$$v_0 = \\frac{V_{\\max}[S]}{K_m + [S]}$$

Where $V_{\\max} = k_2 [E]_0 = k_{\\text{cat}} [E]_0$.

## 3. High-Yield Kinetic Invariants

* When $[S] \\ll K_m$: $v_0 \\approx \\frac{V_{\\max}}{K_m}[S]$ (First-order kinetics).
* When $[S] = K_m$: $v_0 = \\frac{1}{2}V_{\\max}$.
* When $[S] \\gg K_m$: $v_0 \\approx V_{\\max}$ (Zero-order kinetics, enzyme saturation).`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "note-2",
    title: "Kepler's Laws & Newton's Law of Gravitation",
    subject: "Physics",
    tags: ["Astrophysics", "Gravitation", "Derivations"],
    isStarred: false,
    marksAssociated: 8,
    wordCount: 380,
    readingTimeMinutes: 2,
    content: `## 1. Kepler's Three Laws of Planetary Motion

1. **Law of Ellipses**: All planets move in elliptical orbits with the Sun at one focus.
2. **Law of Equal Areas**: A line connecting a planet to the Sun sweeps out equal areas in equal intervals of time (conservation of angular momentum: $L = mrv = \\text{constant}$).
3. **Law of Harmonies**: The square of the orbital period ($T^2$) is directly proportional to the cube of the semi-major axis ($r^3$).

## 2. Derivation of Kepler's Third Law for Circular Orbits

Equating centripetal force with Newton's gravitational force:

$$\\frac{G M m}{r^2} = \\frac{m v^2}{r} = m \\left(\\frac{2\\pi r}{T}\\right)^2 \\frac{1}{r}$$

Simplifying:

$$\\frac{G M}{r^2} = \\frac{4\\pi^2 r}{T^2} \\implies T^2 = \\left(\\frac{4\\pi^2}{G M}\\right) r^3$$

Thus:
$$T^2 \\propto r^3$$`,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    front: "What is the physical significance of the Michaelis constant (Km)?",
    back: "Km is the substrate concentration at which the reaction velocity is half of Vmax. A lower Km indicates higher substrate affinity.",
    mnemonic: "Low Km = Keen affinity",
    difficulty: "Intermediate",
    subtopic: "Enzymology",
    masteryStatus: "learning",
    reviewCount: 3
  },
  {
    id: "fc-2",
    front: "What condition must be satisfied for a currency depreciation to improve the current account balance?",
    back: "The Marshall-Lerner condition: The sum of price elasticities of demand for exports and imports must be greater than unity (|PEDx + PEDm| > 1).",
    mnemonic: "ML > 1 for trade win",
    difficulty: "Advanced",
    subtopic: "Open Economy Macro",
    masteryStatus: "mastered",
    reviewCount: 5
  },
  {
    id: "fc-3",
    front: "Which ion influx triggers neurotransmitter exocytosis at the presynaptic membrane?",
    back: "Calcium ions (Ca2+) entering through voltage-gated calcium channels down their electrochemical gradient.",
    mnemonic: "Ca2+ = Calcium triggers Cleft release",
    difficulty: "Foundation",
    subtopic: "Neurotransmission",
    masteryStatus: "new",
    reviewCount: 0
  },
  {
    id: "fc-4",
    front: "State the mathematical relationship between orbital period T and radius r in Kepler's Third Law.",
    back: "T^2 is directly proportional to r^3: T^2 = (4*pi^2 / GM) * r^3.",
    mnemonic: "T squared is r cubed (2 and 3)",
    difficulty: "Intermediate",
    subtopic: "Gravitational Fields",
    masteryStatus: "new",
    reviewCount: 1
  }
];

export const SAMPLE_PLANNER_TASKS: PlannerTask[] = [
  {
    id: "task-1",
    title: "Write 16-mark essay on Monetary Policy transmission lags",
    subject: "Economics",
    estimatedMinutes: 25,
    priority: "High",
    completed: false,
    dueDate: "Today"
  },
  {
    id: "task-2",
    title: "Active recall review: 20 neurobiology flashcards",
    subject: "Biology",
    estimatedMinutes: 15,
    priority: "Medium",
    completed: true,
    dueDate: "Today"
  },
  {
    id: "task-3",
    title: "Derive Kepler's 3rd law & solve 3 gravitation problems",
    subject: "Physics",
    estimatedMinutes: 30,
    priority: "High",
    completed: false,
    dueDate: "Tomorrow"
  }
];

export const SAMPLE_HABITS: StudyHabit[] = [
  {
    id: "habit-1",
    name: "Active Recall Session (Flashcards)",
    targetDays: 7,
    completedDays: 5,
    streak: 5,
    completedToday: true
  },
  {
    id: "habit-2",
    name: "Timed Mark-Based Question Drill",
    targetDays: 7,
    completedDays: 4,
    streak: 4,
    completedToday: false
  },
  {
    id: "habit-3",
    name: "4x Pomodoro Focus Blocks",
    targetDays: 7,
    completedDays: 6,
    streak: 6,
    completedToday: true
  },
  {
    id: "habit-4",
    name: "Nightly Academic Reflection Journal",
    targetDays: 7,
    completedDays: 3,
    streak: 3,
    completedToday: false
  }
];

export const SAMPLE_REFLECTIONS: ReflectionEntry[] = [
  {
    id: "ref-1",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    whatWentWell: "Secured full AO1 and AO2 marks on the 10-mark synaptic transmission question under the 15-minute timer.",
    hardestConcept: "Remembering to separate presynaptic voltage-gated Ca2+ channels from postsynaptic ligand-gated Na+ channels.",
    tomorrowGoal: "Complete two 16-mark evaluation essays in Economics and review Marshall-Lerner graph.",
    moodRating: 5
  }
];

// Storage keys
const STORAGE_EXAM_ANSWERS_KEY = "carks_exam_answers";
const STORAGE_NOTES_KEY = "carks_study_notes";
const STORAGE_FLASHCARDS_KEY = "carks_flashcards";
const STORAGE_TASKS_KEY = "carks_tasks";
const STORAGE_HABITS_KEY = "carks_habits";
const STORAGE_REFLECTIONS_KEY = "carks_reflections";

// LocalStorage helpers with strict user-only data (NO FAKE / SAMPLE ITEMS)
export function getSavedExamAnswers(): ExamAnswerResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_EXAM_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamAnswer(answer: ExamAnswerResult) {
  const current = getSavedExamAnswers();
  const updated = [answer, ...current.filter((a) => a.id !== answer.id)];
  localStorage.setItem(STORAGE_EXAM_ANSWERS_KEY, JSON.stringify(updated));
  return updated;
}

export function getSavedNotes(): StudyNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNote(note: StudyNote) {
  const current = getSavedNotes();
  const existingIdx = current.findIndex((n) => n.id === note.id);
  let updated: StudyNote[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = note;
  } else {
    updated = [note, ...current];
  }
  localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteNote(id: string) {
  const current = getSavedNotes();
  const updated = current.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(updated));
  return updated;
}

export function getSavedFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_FLASHCARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFlashcards(cards: Flashcard[]) {
  localStorage.setItem(STORAGE_FLASHCARDS_KEY, JSON.stringify(cards));
}
