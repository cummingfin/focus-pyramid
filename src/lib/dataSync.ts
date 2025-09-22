import { supabase } from './supabase';
import { formatDate, getWeekStart } from './dates';

interface Goal {
  id: string;
  slot: number;
  title: string;
  done: boolean;
  area: string | null;
  linkedToParent: string | null;
  created_at: string;
}

interface UserData {
  daily: Goal[];
  weekly: Goal[];
  monthly: Goal[];
  yearly: Goal[];
  fiveYear: Goal[];
  inactiveGoals: any[];
}

// Get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Save goals to Supabase
export const saveGoalsToSupabase = async (horizon: string, goals: Goal[]) => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    // Clear existing goals for this horizon
    await supabase
      .from('goals')
      .delete()
      .eq('user_id', user.id)
      .eq('horizon', horizon);

    // Insert new goals
    if (goals.length > 0) {
      const goalsToInsert = goals.map(goal => ({
        user_id: user.id,
        horizon,
        slot: goal.slot,
        title: goal.title,
        done: goal.done,
        area: goal.area,
        linked_to_parent: goal.linkedToParent,
        created_at: goal.created_at
      }));

      const { error } = await supabase
        .from('goals')
        .insert(goalsToInsert);

      if (error) {
        console.error(`Error saving ${horizon} goals:`, error);
      }
    }
  } catch (error) {
    console.error(`Error syncing ${horizon} goals:`, error);
  }
};

// Load goals from Supabase
export const loadGoalsFromSupabase = async (horizon: string): Promise<Goal[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('horizon', horizon)
      .order('slot');

    if (error) {
      console.error(`Error loading ${horizon} goals:`, error);
      return [];
    }

    return data.map(goal => ({
      id: goal.id,
      slot: goal.slot,
      title: goal.title,
      done: goal.done,
      area: goal.area,
      linkedToParent: goal.linked_to_parent,
      created_at: goal.created_at
    }));
  } catch (error) {
    console.error(`Error loading ${horizon} goals:`, error);
    return [];
  }
};

// Sync all user data
export const syncUserData = async (): Promise<UserData> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Return localStorage data if no user
      return {
        daily: JSON.parse(localStorage.getItem('daily-outcomes') || '[]'),
        weekly: JSON.parse(localStorage.getItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`) || '[]'),
        monthly: JSON.parse(localStorage.getItem('monthly-goals') || '[]'),
        yearly: JSON.parse(localStorage.getItem('yearly-goals') || '[]'),
        fiveYear: JSON.parse(localStorage.getItem('five-year-goals') || '[]'),
        inactiveGoals: JSON.parse(localStorage.getItem('inactive-goals') || '[]')
      };
    }

    // Load from Supabase
    const [daily, weekly, monthly, yearly, fiveYear] = await Promise.all([
      loadGoalsFromSupabase('daily'),
      loadGoalsFromSupabase('weekly'),
      loadGoalsFromSupabase('monthly'),
      loadGoalsFromSupabase('yearly'),
      loadGoalsFromSupabase('five-year')
    ]);

    // Also sync localStorage for offline capability
    localStorage.setItem('daily-outcomes', JSON.stringify(daily));
    localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(weekly));
    localStorage.setItem('monthly-goals', JSON.stringify(monthly));
    localStorage.setItem('yearly-goals', JSON.stringify(yearly));
    localStorage.setItem('five-year-goals', JSON.stringify(fiveYear));

    return {
      daily,
      weekly,
      monthly,
      yearly,
      fiveYear,
      inactiveGoals: JSON.parse(localStorage.getItem('inactive-goals') || '[]')
    };
  } catch (error) {
    console.error('Error syncing user data:', error);
    // Fallback to localStorage
    return {
      daily: JSON.parse(localStorage.getItem('daily-outcomes') || '[]'),
      weekly: JSON.parse(localStorage.getItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`) || '[]'),
      monthly: JSON.parse(localStorage.getItem('monthly-goals') || '[]'),
      yearly: JSON.parse(localStorage.getItem('yearly-goals') || '[]'),
      fiveYear: JSON.parse(localStorage.getItem('five-year-goals') || '[]'),
      inactiveGoals: JSON.parse(localStorage.getItem('inactive-goals') || '[]')
    };
  }
};

// Save all user data
export const saveUserData = async (data: UserData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Save to localStorage if no user
      localStorage.setItem('daily-outcomes', JSON.stringify(data.daily));
      localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(data.weekly));
      localStorage.setItem('monthly-goals', JSON.stringify(data.monthly));
      localStorage.setItem('yearly-goals', JSON.stringify(data.yearly));
      localStorage.setItem('five-year-goals', JSON.stringify(data.fiveYear));
      localStorage.setItem('inactive-goals', JSON.stringify(data.inactiveGoals));
      return;
    }

    // Save to Supabase
    await Promise.all([
      saveGoalsToSupabase('daily', data.daily),
      saveGoalsToSupabase('weekly', data.weekly),
      saveGoalsToSupabase('monthly', data.monthly),
      saveGoalsToSupabase('yearly', data.yearly),
      saveGoalsToSupabase('five-year', data.fiveYear)
    ]);

    // Also save to localStorage for offline capability
    localStorage.setItem('daily-outcomes', JSON.stringify(data.daily));
    localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(data.weekly));
    localStorage.setItem('monthly-goals', JSON.stringify(data.monthly));
    localStorage.setItem('yearly-goals', JSON.stringify(data.yearly));
    localStorage.setItem('five-year-goals', JSON.stringify(data.fiveYear));
    localStorage.setItem('inactive-goals', JSON.stringify(data.inactiveGoals));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};
