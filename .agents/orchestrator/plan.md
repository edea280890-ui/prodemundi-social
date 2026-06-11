# Project Plan: Prode Mundial 2026

## Architecture
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, TypeScript.
- **Backend/Database**: Supabase (Auth, Database, Realtime).
- **Core Tables**:
  - `profiles` (id, username, display_name, avatar_id)
  - `groups` (id, name, code, owner_id)
  - `group_members` (user_id, group_id)
  - `group_scores` (user_id, group_id, points, exacts)
  - `matches` (id, home_team, away_team, match_date, status, home_score, away_score, competition, scores_calculated)
  - `predictions` (id, group_id, match_id, user_id, predicted_home_score, predicted_away_score)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Setup & Calculation Tests | Install and configure Vitest, write unit tests for match score calculation logic | None | PLANNED |
| 2 | Supabase Realtime Integration | Replace client polling with Realtime subscription to `group_scores` and `predictions` | M1 | PLANNED |
| 3 | Auto-Profile DB Trigger | Create database trigger to auto-insert a profile when a new user registers | None | PLANNED |
| 4 | Verification & Build Validation | Verify npm run build, npm run lint, and test suite execution | M1, M2, M3 | PLANNED |

## Interface Contracts
- **Realtime Channels**: Listen to `postgres_changes` on schema `public`, table `group_scores`, filter `group_id=eq.${groupId}`.
- **Auto-Profile Trigger**: On `INSERT` to `auth.users`, create entry in `public.profiles` using `new.raw_user_meta_data`.
- **Score Calculator**:
  - Exact match (score matches exactly): 5 points
  - Winner/draw match (predicted outcome matches real outcome but not exact score): 3 points
  - No match outcome match: 0 points
