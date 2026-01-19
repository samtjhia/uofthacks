# Chorus

**Your voice, amplified**

[View Project on Devpost](https://devpost.com/software/chorus-wx1l79?ref_content=user-portfolio&ref_feature=in_progress)

Chorus is an AI-powered Augmentative and Alternative Communication (AAC) tool designed to close the "Rate Gap" for non-verbal users. By shifting from reactive typing to active prediction, Chorus restores agency, speed, and vocal identity to those who need it most.

## The Problem: The 10x Rate Gap

- **Spoken Speech:** ~150 words per minute.
- **Traditional AAC:** ~15 words per minute.
- **Result:** A fundamental disconnect that forces users into a passive, reactive role in conversations.

## The Solution: A Seven-Signal "Brain"

Chorus is not just a keyboard; it is an active listener. It uses a **Multi-Agent Engine** to fuse 7 real-time context signals, allowing it to predict what the user wants to say before they even touch the screen.

### The 7 Signals
1.  **The Ears (Listening):** Uses `OpenAI Whisper` to actively listen to the conversation partner and understand context.
2.  **The Scheduler (Time):** Syncs with the user's daily itinerary to enable time-aware predictions (e.g., suggesting "Lunch" at noon).
3.  **The Memory (History):** Powered by **Backboard.io**, Chorus has "Object Permanence." It remembers names, past events, and friends.
4.  **The Frequency (Habits):** Uses `MongoDB Atlas` to track selection habits, ranking a user's favorite words higher to save keystrokes.
5.  **The Filter (Context):** Filters suggestions based on topic context (e.g., if talking about "Food" and the user types "P", it suggests "Pizza" but filters out "Paper").
6.  **The Grammar (Syntax):** Predicts the next part of speech (Noun vs Verb) to construct valid sentences.
7.  **The Tone (Identity):** Powered by **ElevenLabs**, Chorus injects emotional prosody (Joy, Sadness, Affectionate) into the synthetic voice.

## Tech Stack

- **Frontend:** Next.js, TypeScript, TailwindCSS
- **Orchestrator:** Google Gemini
- **Voice Synthesis:** ElevenLabs API
- **Transcription:** OpenAI Whisper
- **Memory Vector DB:** Backboard.io
- **Database:** MongoDB Atlas
- **Image Generation:** DALL-E 3 (for the "Infinite Icon" feature)

## Key Features

### 1. Three Adaptive Modes
- **Text Mode:** For literate users. Features "Smart Type" providing sentence completions.
- **Pictorial Mode:** Mainly for non-verbal autistic kids. Features **Infinite Icon** (DALL-E 3) to generate custom symbols on the fly.
- **Spark Mode:** The "Anti-Passenger" tool. Suggests conversation starters to help users *initiate* dialogue.

### 2. Vocal Identity Restoration
Users can select an emotional intent (e.g., "Excited"). Chorus doesn't just read the text; it modifies pitch, cadence, and stability to make the voice *sound* excited.

### 3. Intelligent Caching
To combat API latency, we implemented a semantic caching layer. If the conversation topic hasn't changed, Chorus serves instant, cached predictions instead of re-querying the LLM.

### 4. Long-Term Memory (Backboard.io)
We integrate **Backboard.io** to provide the AI with object permanence. Chorus stores semantic vector embeddings of conversation history, allowing it to recall specific details—like a pet's name or facts about them from past conversations—ensuring the AI remembers the user's life history without needing reminders.

## Running Locally

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/chorus.git
    cd chorus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file with the following keys:
    ```env
    ELEVENLABS_API_KEY=
    GEMINI_API_KEY=
    OPENAI_API_KEY=
    BACKBOARD_API_KEY=
    MONGO_DB=
    BACKBOARD_ASSISTANT_ID=
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## Accomplishments

- **90% Keystroke Reduction:** Validated that efficient prediction can turn a 15-tap sentence into a 2-tap confirmation.
- **Infinite Icon:** Successfully integrated DALL-E 3 to allow users to create new vocabulary items instantly.
- **Emotional Resonance:** Proved that AI voice synthesis can convey sadness, affection, and joy, effectively bridging the "Intellectual Gap."

## What's Next?
- **Offline Mode:** Distilling the reasoning engine into local models (Gemini Nano) for non-internet use.
- **Eye-Tracking Support:** Optimizing the UI layout for gaze-based interaction.