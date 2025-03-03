# Apex Architects
### A FittipAIdi Racing Labs Production

Apex Architects is not just a racing game — it's a revolution in racecraft.

Every player becomes a driver *and* a track architect, sketching their way to racing glory.
We blend the purity of retro top-down racing with creative control over every curve, apex, and chicane.

## Core Features
- Draw your own tracks, race your own creations.
- Conquer legendary real-world-inspired circuits with creative twists.
- Unlock faster machines as you master the craft.
- Compete for the perfect lap — on tracks you designed.
- All under the roof of **FittipAIdi Racing Labs**.

## Game Modes
- 🏁 **ThrottleScrawl:** Full Season Campaign
- ✏️ **Sketch & Shred:** Instant Track & Race
- 🛠️ **Apex Architects:** Full Creative Track Builder
- 🏆 **Tarmac Graffiti Certified Tracks:** Showcase Your Best Lines

## Future Features
- 👻 **Ghostline Grandmasters:** Time attack against global legends.
- 🌍 **Shared Tracks & Challenges:** Upload and race the world's best player-created tracks.
- ❤️ **Track Voting System:** Discover the most-loved creations in the community.

## Technology Stack

- React 18+ with TypeScript
- Vite for build tooling
- React Router for navigation
- Zustand for state management
- CSS Modules for styling

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── store/         # Zustand store
  ├── types/         # TypeScript interfaces
  └── styles/        # CSS modules
```

## Models

### Track Model
- `id`: Unique identifier
- `name`: Track name
- `segments`: Array of track segments (straight, curve, chicane)
- `checkpoints`: Array of checkpoint coordinates
- `surface`: Track surface type (asphalt, gravel, mixed)
- `difficulty`: Track difficulty rating
- `commentary`: Track description
- `createdAt`: Creation timestamp
- `author`: Track creator

### Vehicle Model
- `id`: Unique identifier
- `name`: Vehicle name
- `speed`: Maximum speed rating
- `acceleration`: Acceleration capability
- `handling`: Handling performance
- `visuals`: Visual customization options

## Development

The project uses TypeScript for type safety and better developer experience. All components are function components using React hooks.

#### Racing isn't just speed. Racing is art.
#### Join us — and leave your mark on racing history.
