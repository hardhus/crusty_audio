# Crusty Audio Live Studio

An interactive, high-performance web playground for writing and compiling declarative music scripts in real-time. Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Rust (WebAssembly)**.

🚀 **[Live Demo: Try Crusty Audio in Your Browser](https://hardhus.github.io/crusty_audio/)**

---

## 🧬 Architecture Overview

This web app operates entirely in the browser (**zero server backend overhead**). It serves as the frontend layer bridging two modular underlying audio libraries compiled into highly optimized WebAssembly (WASM):

```text
  [ Web Editor UI (React) ] 
             │  
             ▼ (Text Script)
  [ Crusty Audio Language ]  ──► Compiles text strings into AST
             │  
             ▼ (Generates Node Closures)
  [ Crusty Audio Engine ]    ──► Lock-free DSP processing
             │  
             ▼ (Pipes raw f32 buffer)
  [ Web Audio API ]          ──► Speaker Audio Output

```

### Core Ecosystem Components:

* **[crusty_audio_engine](https://github.com/hardhus/crusty-audio-engine)**: The core multi-threaded digital signal processing (DSP) framework. It architecture orchestrates low-level modular wave generation (Sine, Saw, Square), dynamic audio effects (ADSR envelopes, Biquad Low-Pass Filters, Delay lines), and stereo constant-power panning buses.
* **[crusty_audio_lang](https://github.com/hardhus/crusty-audio-lang)**: A custom Domain-Specific Language (DSL) and compiler. It processes recursive-descent parsing on textual synthesizer configuration chains and transforms matrix rhythmic blocks into low-latency runtime components.

---

## 🎵 Features

* **Real-Time Compiling:** Text changes instantly re-trigger the internal Rust pipeline compiler via WASM, mutating synthesizer architectures smoothly during active playback.
* **Multi-Track Presets:** Built-in modular templates showcasing various engineering capabilities:
* `Techno`: Heavy sub-bass structures layered over rolling biquad-filtered resonant sawtooth oscillators.
* `Ambient`: Atmospheric space chords leveraging square wave oscillators combined with long-decay feedback delay configurations.
* `Retro`: Rhythmic arpeggiators layered seamlessly with algorithmic white-noise generator drum triggers.


* **WASM Bridge Concurrency:** Directly pipes generated frames into a standard Web Audio API native thread allocation chunk layout (`Float32Array`) through a fast `wasm_bindgen` interface wrapper.

---

## 🛠️ Local Development & Pipeline

### Prerequisites

Ensure you have the Rust toolchain, `wasm-pack`, and `bun` runtime environments installed on your machine.

### 1. Build the WebAssembly Assets

Compile the wrapper bridge library layout targeting browser native EcmaScript modules (ESM):

```bash
wasm-pack build --target web

```

### 2. Launch the Vite Development Server

Install frontend node dependencies and execute the hot-reloading development process:

```bash
bun install
bun run dev

```

Open `http://localhost:3000` to interact with the sandbox state.

### 🚀 Deployment to GitHub Pages

To compile production assets using optimized `esnext` compiler flags and push updates to the web server space automatically, call:

```bash
bun run deploy

```
