# MidSet Coach

An AI-powered coaching assistant for Super Smash Bros. Melee players. MidSet Coach analyzes your Slippi replay files, tracks your game statistics, and provides personalized coaching advice using Retrieval Augmented Generation (RAG) technology.

## 🎯 Goal

MidSet Coach helps Melee players improve their gameplay by:
- **Analyzing Slippi replays**: Automatically parse and extract statistics from your `.slp` replay files
- **Tracking performance**: Monitor key metrics like openings per kill, stocks taken, matchup performance, and more
- **AI-powered coaching**: Get personalized advice from an AI coach that understands your game history and notes
- **Review notes**: Add notes to specific games and have the AI reference them in coaching sessions
- **Semantic search**: The AI can search through your game data and notes to provide contextually relevant advice

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **OpenAI API Key** (for AI coaching features)
- **Slippi replay files** (`.slp` format)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd midset-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   > **Note**: You can get an OpenAI API key from [platform.openai.com](https://platform.openai.com)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Importing Games

1. Click the **"Select Slippi Folder"** button on the Review page
2. Choose a folder containing your `.slp` replay files
3. The app will recursively search for all `.slp` files and import them
4. Games are automatically parsed and statistics are extracted

> **Note**: The folder selection feature requires a Chromium-based browser (Chrome, Edge, Brave, etc.)

### Reviewing Games

- **View all games**: Browse your imported games on the Review page
- **Game details**: Click any game card to see detailed statistics including:
  - Matchup information (character vs opponent)
  - Stage played
  - Performance metrics (openings per kill, stocks taken, duration)
  - Review notes (add/view notes for each game)

### AI Coaching

1. Navigate to the **Coach** page
2. Ask questions about your gameplay, such as:
   - "What are my weaknesses in the Fox matchup?"
   - "How can I improve my openings per kill?"
   - "Review my recent games and give me tips"
3. The AI will search through your game data and notes to provide personalized advice

### Adding Notes

- Click on any game card to open the game details modal
- Scroll to the "Review Notes" section
- Type your notes and click "Save Notes"
- Notes are automatically included in AI coaching sessions

### Clearing the Database

- Click the **"Clear Database"** button in the header
- Confirm the action to delete all games, notes, and documents
- Use this to start fresh or reset your data

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **AI/ML**: 
  - OpenAI GPT-4o-mini (chat completions)
  - OpenAI text-embedding-3-small (embeddings)
  - RAG (Retrieval Augmented Generation)
- **Slippi Parsing**: @slippi/slippi-js
- **Styling**: CSS with inline styles (soft purple/green theme)

## 📁 Project Structure

```
midset-coach/
├── app/
│   ├── (tabs)/
│   │   ├── coach/          # AI coaching chat page
│   │   └── review/         # Game review and listing page
│   ├── api/
│   │   ├── clear/          # Clear database endpoint
│   │   ├── discover/       # Discover .slp files locally
│   │   ├── embed/          # Generate embeddings
│   │   ├── games/          # List all games
│   │   ├── notes/          # Manage notes and AI chat
│   │   ├── realtime/       # Realtime voice features
│   │   ├── search/         # Semantic search
│   │   └── upload/         # Upload and parse .slp files
│   ├── Header.tsx          # Navigation header
│   └── layout.tsx          # Root layout
├── components/
│   ├── ChatUI.tsx          # AI chat interface
│   ├── FileDropzone.tsx    # Folder selection for imports
│   ├── GameCard.tsx        # Game summary card
│   ├── GameDetailsModal.tsx # Detailed game view
│   └── NotesEditor.tsx     # Notes editing component
├── lib/
│   ├── db.ts               # Database connection
│   ├── embedding.ts        # OpenAI embedding utilities
│   ├── rag.ts              # RAG search implementation
│   ├── schema.ts           # Database schema
│   ├── slippi.ts           # Slippi file parsing
│   └── slippi-utils.ts     # Character/stage name utilities
└── data/
    └── midset.db           # SQLite database (created automatically)
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database

The SQLite database is automatically created in the `data/` directory on first run. The schema includes:
- **games**: Parsed game statistics
- **notes**: User notes for games
- **documents**: RAG documents (game stats and notes)
- **chunks**: Text chunks for semantic search

## 🎨 Features

- ✅ Bulk import Slippi replay files from folders
- ✅ Automatic game statistics extraction
- ✅ Character sprites and stage visualization
- ✅ Game-specific notes
- ✅ AI coaching with RAG context
- ✅ Semantic search through game data
- ✅ Soft purple/green UI theme
- ✅ Responsive design
- ✅ Database management (clear/reset)

## 📝 Notes

- The app uses OpenAI's API for embeddings and chat completions. Make sure you have API credits available.
- The folder selection feature requires the File System Access API, which is only available in Chromium-based browsers.
- Game statistics are extracted using the `@slippi/slippi-js` library, which parses official Slippi replay format.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

[Add your license here]

---

**Happy Melee grinding! 🎮**

