import { get, set } from '@vercel/edge-config';

export interface GameSession {
  score: number;
  totalRounds: number;
  timestamp: number;
  timeTaken: number;
}

export interface UserData {
  sessions: GameSession[];
}

export async function getUserSessions(username: string): Promise<GameSession[]> {
  try {
    const userData = await get<UserData>(username);
    return userData?.sessions || [];
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

export async function saveUserSession(username: string, session: GameSession): Promise<void> {
  try {
    const existingSessions = await getUserSessions(username);
    
    // Add new session to the beginning of the array
    const updatedSessions = [session, ...existingSessions];
    
    // Keep only the last 10 sessions
    const sessionsToKeep = updatedSessions.slice(0, 10);
    
    await set(username, { sessions: sessionsToKeep });
  } catch (error) {
    console.error('Error saving user session:', error);
  }
}
