# SignaLink Indian Sign Language (ISL) Dataset Specification

## 1. Ethical Governance & Sourcing
The development of SignaLink adheres to the following principles:
- **Informed Consent:** All visual recordings or landmark captures are gathered strictly with voluntary informed consent from participants.
- **Privacy Protection:** No facial imagery or identifiable raw video footage is shared, distributed, or permanently stored. Only anonymized landmark coordinate vectors are preserved for training.
- **Cultural & Linguistic Respect:** Indian Sign Language is a rich visual-spatial language with its own grammar. This project explicitly targets a defined vocabulary of static signs as an assistive communication prototype, rather than claiming complete grammatical translation.

## 2. Supported Vocabulary (Initial Prototype)

| Sign ID | Label | Description & Handshape |
|---|---|---|
| `HELLO` | Hello | Open palm upright facing forward, fingers extended. |
| `THANK_YOU` | Thank You | Open flat hand moved outward from chin/chest. |
| `YES` | Yes | Compact fist in nodding affirmation motion. |
| `NO` | No | Extended index finger shaking or closing to thumb. |
| `PLEASE` | Please | Flat hand placed horizontally over chest. |
| `GOOD` | Good | Fist with upright thumb (thumbs up). |
| `BAD` | Bad | Fist with downward-facing thumb (thumbs down). |
| `PEACE` | Peace / Victory | Index and middle fingers extended in a 'V' shape. |
| `HELP` | Help / Assist | Flat base hand supporting upright fist/thumb. |
| `I_LOVE_YOU`| I Love You (ILY) | Extended thumb, index, and pinky fingers. |
| `UNKNOWN` | Non-Sign Noise | Relaxed, transitional, and random hand poses. |

## 3. Landmark Topology & Normalization

Each sample consists of 21 hand landmarks provided by MediaPipe:
- **0:** Wrist
- **1-4:** Thumb (CMC, MCP, IP, Tip)
- **5-8:** Index Finger (MCP, PIP, DIP, Tip)
- **9-12:** Middle Finger (MCP, PIP, DIP, Tip)
- **13-16:** Ring Finger (MCP, PIP, DIP, Tip)
- **17-20:** Pinky Finger (MCP, PIP, DIP, Tip)

### Normalization Pipeline
1. **Translation Invariance:** Subtract wrist coordinate $\mathbf{p}_0$ from all landmarks $\mathbf{p}_i$:
   $$\Delta \mathbf{p}_i = \mathbf{p}_i - \mathbf{p}_0 \quad \text{for } i \in [0, 20]$$
2. **Scale Invariance:** Compute max Euclidean distance $d_{\max} = \max_i \|\Delta \mathbf{p}_i\|_2$ and divide:
   $$\mathbf{f}_i = \frac{\Delta \mathbf{p}_i}{d_{\max}}$$
3. **Feature Vector:** Flatten to 63-dimensional continuous vector $\mathbf{F} \in \mathbb{R}^{63}$.

## 4. Participant-Independent Split
To ensure the machine learning classifier generalizes to new, unseen users:
- **Training Set:** Participants `P01`, `P02`, `P03` (1,320 samples)
- **Validation Set:** Participant `P04` (440 samples)
- **Test Set:** Participant `P05` (440 samples)

No video frames or near-identical consecutive samples from the same person are shared across splits.
