# Campus Tournament Hub

A Supabase-backed tournament platform for organising campus esports competitions. Players can create accounts, join tournaments, view brackets, submit match results, track ELO ratings, and review their match history. Organisers can create tournaments, generate seeded brackets, confirm results, and advance winners through later rounds.

## Features

- Player registration, login, profiles, and session handling through Supabase Auth
- Tournament discovery, registration, and tournament creation
- Single-elimination bracket generation seeded by player ELO
- Match result submission and organiser confirmation
- Automatic ELO updates and leaderboard data
- Player match history and notifications
- Responsive React interface built with Vite and Tailwind CSS

## Project Structure

```text
client/   React + Vite frontend
server/   Express API for bracket generation and match confirmation
```

The frontend reads and writes most application data directly through Supabase. The Express server handles operations that need server-side coordination, including bracket generation and match confirmation.

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project with the application tables and authentication enabled

## Setup

1. Install dependencies for both packages:

	```bash
	cd client
	npm install

	cd ../server
	npm install
	```

2. Create `client/.env.local`:

	```env
	VITE_SUPABASE_URL=https://your-project.supabase.co
	VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
	```

3. Create `server/.env`:

	```env
	SUPABASE_URL=https://your-project.supabase.co
	SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
	PORT=3001
	```

	Keep the service-role key private. Do not expose it in the frontend or commit it to source control.

4. Start the API in one terminal:

	```bash
	cd server
	npm start
	```

5. Start the frontend in another terminal:

	```bash
	cd client
	npm run dev
	```

	Open the URL printed by Vite, normally `http://localhost:5173`.

## Available Commands

Run these from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

Run these from `server/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Express API on port 3001 |

## Supabase Data Model

The application expects Supabase tables for the following data:

- `profiles`: usernames and organiser permissions
- `tournaments`: tournament metadata, capacity, owner, deadline, and status
- `tournament_registrations`: players registered for tournaments
- `matches`: bracket matches, submissions, winners, rounds, and statuses
- `player_elo`: per-game ELO, wins, losses, and match counts
- `notifications`: player match-result notifications

Configure Row Level Security policies so authenticated users can access only the records appropriate to their role. The frontend assumes that a newly registered user can create a corresponding `profiles` row.

## Routes

The client currently exposes these main routes:

- `/`: landing page
- `/login` and `/register`: player authentication
- `/tournaments`: tournament listing and registration
- `/create-tournament`: create a tournament
- `/bracket/:tournament_id`: view a bracket
- `/matches`: view the current player's matches
- `/match/:match_id`: submit a match result
- `/leaderboard`: view player ratings
- `/profile`: view the current profile
- `/organiser-login`, `/organiser`, and `/organiser/matches`: organiser workflows

The API runs on port `3001` and provides:

- `POST /api/bracket/generate` to create the first round for a tournament
- `POST /api/matches/:match_id/confirm` to confirm a winner, update ELO, and create the next round when appropriate

## Development Notes

- The organiser pages currently use `http://localhost:3001` as the API base URL.
- Bracket generation requires at least two registered players and existing `player_elo` rows.
- A tournament is marked `completed` when its final match is confirmed.
- The API forwards the authenticated request's `Authorization` header when generating brackets.
