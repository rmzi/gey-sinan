# Speech Model Roadmap

## Vision

Enable on-device pronunciation feedback for Harari learners — the user records themselves saying a word, and the app tells them how close their pronunciation is to a native speaker's.

## Phase 1: Visual Comparison (Near-term)

**No ML required. Ship first.**

### Approach
- User records themselves saying a word
- Display their waveform alongside the reference waveform
- Show simple spectrogram comparison (frequency over time)
- User visually compares the shapes

### Implementation
- Web Audio API `AnalyserNode` for real-time visualization
- Canvas-based waveform and spectrogram rendering
- Side-by-side or overlay display
- No scoring — purely visual feedback

### Value
- Immediate utility with zero ML infrastructure
- Teaches learners to hear differences in pronunciation
- Works completely offline

## Phase 2: Embedding-Based Scoring (Medium-term)

### Approach
1. Convert reference audio and user audio to **phoneme embeddings**
2. Compute **cosine similarity** between embeddings
3. Map similarity score to feedback: green (>0.85), yellow (0.65-0.85), red (<0.65)

### Technical Path
- Use a pre-trained speech encoder (wav2vec 2.0, HuBERT, or MMS)
- Extract frame-level embeddings from the final hidden layer
- Mean-pool embeddings over the utterance for a fixed-size vector
- Cosine similarity for scoring

### Model Options
| Model | Size | Languages | Harari Support |
|-------|------|-----------|----------------|
| wav2vec 2.0 | 300MB+ | Trained on English | Poor — would need fine-tuning |
| MMS (Meta) | ~1GB | 1,100+ languages | Amharic included, Harari unlikely |
| Whisper (OpenAI) | 75MB-1.5GB | 100 languages | No Harari, but Amharic |

### Data Requirements
- Minimum **500 recordings** across **20+ speakers** for reasonable embedding quality
- Memphis target: 200+ words x 5+ speakers = 1,000+ recordings (sufficient)
- More speakers = better generalization across pronunciation variants

### Deployment
- Export model to ONNX format
- Run via ONNX Runtime Web or TensorFlow.js
- Target model size: **<50MB** for on-device inference
- Precompute reference embeddings (ship with app as static data)

## Phase 3: Fine-Tuned Speech Recognition (Aspirational)

### Approach
Fine-tune a multilingual speech model on the Memphis corpus to create a Harari-specific speech recognizer.

### Candidates
- **MMS** (Massively Multilingual Speech by Meta): Best starting point due to broad language coverage. Fine-tune the CTC head on Harari transcribed audio.
- **Whisper**: Fine-tune on Harari audio-text pairs. Requires more data but produces better quality.

### Data Requirements
- **Minimum**: 10 hours of transcribed Harari audio
- **Ideal**: 50+ hours across diverse speakers
- Memphis alone won't provide enough — this requires ongoing community recording campaigns

### Deployment Target
- TensorFlow.js model **<5MB** running on-device
- Quantized INT8 for size reduction
- Web Worker for non-blocking inference
- Complete offline operation — no audio data leaves the device

## Privacy Principles

1. **On-device processing**: All pronunciation analysis happens in the browser
2. **No audio upload**: User recordings never leave the device
3. **Reference embeddings only**: Ship precomputed vectors, not raw audio
4. **Opt-in training**: Community recordings used for model training only with explicit consent
5. **Transparent scoring**: Users can see what the model compares, not just a score

## Milestones

| Milestone | Dependency | Status |
|-----------|-----------|--------|
| Waveform comparison UI | Reference audio recordings | Planned |
| Memphis recording corpus | Community gathering | Planned |
| Audio processing pipeline | Memphis recordings | Planned |
| Embedding extraction experiments | Processed corpus | Future |
| Pronunciation scoring prototype | Embedding model | Future |
| On-device model deployment | Optimized model | Future |
| Fine-tuned Harari recognizer | 10+ hours transcribed audio | Aspirational |
