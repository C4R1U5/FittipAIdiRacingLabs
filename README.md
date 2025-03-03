# FittipAIdi Racing Labs V2

A modern TypeScript React application for managing racing tracks and vehicles.

## Features

- Track Management
  - Create and edit racing tracks with segments
  - Define track properties like surface type and difficulty
  - Add checkpoints for racing objectives
  - Track metadata including author and creation date

- Vehicle Management
  - Create and customize vehicles
  - Configure performance attributes
  - Customize vehicle appearance with colors and decals

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