# Milestone 2: Supabase Realtime Integration Analysis

## Summary
Client polling in the group detail and matches pages currently executes database fetches every 15 seconds. This document provides the investigation results and detailed strategy to replace this polling with Supabase Realtime subscriptions (postgres_changes) targeting group_scores, predictions, group_members, and matches tables, allowing instantaneous client-side updates and reducing database read traffic.

---

## 1. Current Polling Implementation

Polling is implemented in two frontend views inside the dashboard:

| File Path | Interval | Fetching Functions | Affected React States |
|---|---|---|---|
| pp/dashboard/grupos/[id]/page.tsx | 15,000 ms (15s) | etchGroupScores(), etchMatchesAndPredictions() | scores, matches, predictions, llPredictions |
| pp/dashboard/partidos/page.tsx | 15,000 ms (15s) | etchMatches() | matches |

### Detailed Current Logic

#### A. Group Detail Page (pp/dashboard/grupos/[id]/page.tsx)
Located at lines 457-480, the page executes three initial fetches, and then starts a setInterval that fires every 15 seconds to refetch scores and matches/predictions:

`	ypescript
  useEffect(() => {
    if (!groupId) {
      setTimeout(() => {
        setMessage("No se encontró el ID del grupo en la URL.");
      }, 0);
      return;
    }

    const timer = setTimeout(() => {
      fetchGroupDetail();
      fetchGroupScores();
      fetchMatchesAndPredictions();
    }, 0);

    const interval = setInterval(() => {
      fetchGroupScores();
      fetchMatchesAndPredictions();
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [groupId, fetchGroupDetail, fetchGroupScores, fetchMatchesAndPredictions]);
`

#### B. Matches Page (pp/dashboard/partidos/page.tsx)
Located at lines 45-59, the matches page fetches matches list initially and sets a 15-second interval:

`	ypescript
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 0);

    const interval = setInterval(() => {
      fetchMatches();
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchMatches]);
`

---

## 2. Supabase Client Verification

- **Configuration File**: lib/supabase.ts
- **SDK Version**: @supabase/supabase-js: ^2.106.2 (Verified in package.json)
- **Initialization Code**:
  `	ypescript
  import { createClient } from "@supabase/supabase-js";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  `
- **Assessment**: The client is already configured for realtime. No changes are required in lib/supabase.ts. However, the Supabase database itself **must have replication enabled** for the tables we want to listen to (see Section 4).

---

## 3. Realtime Subscription Strategy

We will replace the setInterval in both views with Supabase Realtime Channels. 

### A. Subscription Schema, Tables, and Filters

For the Group Detail Page:

| Table | Event | Filter | Callback / Refetch Action | Rationale |
|---|---|---|---|---|
| group_scores | * | group_id=eq. | etchGroupScores() | Keep rankings/scores up-to-date in real-time when calculations complete or member points change. |
| predictions | * | group_id=eq. | etchMatchesAndPredictions() | Keep group predictions ("Pronósticos del grupo") updated as other users save predictions. |
| group_members | * | group_id=eq. | etchGroupDetail(), etchGroupScores() | Refresh the members list and scores when users join or leave the group. |
| matches | * | None (Global) | etchMatchesAndPredictions(), etchGroupScores() | Update match scores, kickoff status, and closed flags when admin modifies matches. |

For the Matches Page:

| Table | Event | Filter | Callback / Refetch Action | Rationale |
|---|---|---|---|---|
| matches | * | None (Global) | etchMatches() | Instantly update match statuses and scores globally. |

---

## 4. Detailed Implementation Strategy

### Database Configuration (Prerequisite)
By default, Supabase tables do not broadcast changes. The backend/database manager must enable the supabase_realtime publication for these tables:
`sql
alter publication supabase_realtime add table group_scores;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table group_members;
`

### Proposed Code Replacements

#### 1. Group Detail Page (pp/dashboard/grupos/[id]/page.tsx)
Replace the current useEffect (lines 457–480) with:

`	ypescript
  useEffect(() => {
    if (!groupId) {
      setTimeout(() => {
        setMessage("No se encontró el ID del grupo en la URL.");
      }, 0);
      return;
    }

    // Initial load
    const timer = setTimeout(() => {
      fetchGroupDetail();
      fetchGroupScores();
      fetchMatchesAndPredictions();
    }, 0);

    // Subscribe to realtime updates for this group and global matches
    const channel = supabase
      .channel(group-realtime:)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_scores",
          filter: group_id=eq.,
        },
        () => {
          fetchGroupScores();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "predictions",
          filter: group_id=eq.,
        },
        () => {
          fetchMatchesAndPredictions();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: group_id=eq.,
        },
        () => {
          fetchGroupDetail();
          fetchGroupScores();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatchesAndPredictions();
          fetchGroupScores();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchGroupDetail, fetchGroupScores, fetchMatchesAndPredictions]);
`

#### 2. Matches Page (pp/dashboard/partidos/page.tsx)
Replace the current useEffect (lines 45–59) with:

`	ypescript
  useEffect(() => {
    // Initial load
    const timer = setTimeout(() => {
      fetchMatches();
    }, 0);

    // Subscribe to realtime updates for matches table
    const channel = supabase
      .channel("matches-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);
`

---

## 5. Potential Risks & Mitigations
1. **Replication Not Enabled**: Realtime listeners will subscribe successfully but will never receive events if the tables are not added to the supabase_realtime publication.
   * *Mitigation*: Ensure the database migrations/scripts include the lter publication supabase_realtime add table ... commands.
2. **Channel Overflow / Uncleaned Subscriptions**: Leaving active subscription channels when components unmount can exhaust connections.
   * *Mitigation*: The useEffect cleanup return function must call supabase.removeChannel(channel) to clean up listeners.
3. **Local Mutations vs. Realtime Race**: A user updates a score, and both local state updates and realtime broadcast triggers run.
   * *Mitigation*: Since the upsert code calls the fetch functions directly (etchMatchesAndPredictions()), and the realtime subscription will trigger another fetch, it is safe, but we could debouncing/deduping or rely on realtime to sync cleanly.
