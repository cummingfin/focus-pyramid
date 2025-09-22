import { supabase } from './supabase';
import { formatDate, getWeekStart } from './dates';

// Map frontend horizon values to database enum values
const mapHorizonToDB = (horizon: string): string => {
  const mapping: Record<string, string> = {
    'daily': 'daily',
    'weekly': 'weekly', 
    'monthly': 'monthly',
    'yearly': 'yearly',
    'five-year': 'five_year'  // Database likely uses snake_case
  };
  return mapping[horizon] || horizon;
};

const mapHorizonFromDB = (horizon: string): string => {
  const mapping: Record<string, string> = {
    'daily': 'daily',
    'weekly': 'weekly',
    'monthly': 'monthly', 
    'yearly': 'yearly',
    'five_year': 'five-year'  // Convert back to frontend format
  };
  return mapping[horizon] || horizon;
};

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

// Get current user and their workspace
const getCurrentUserAndWorkspace = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Getting user and workspace - User:', user?.email);
  
  if (!user) return { user: null, workspaceId: null };

  // Get user's workspace - use .maybeSingle() to handle multiple rows gracefully
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('Membership query result:', membership, 'Error:', error);
  
  // If no membership exists or there's an error, create workspace and membership
  if (!membership || error) {
    console.log('No membership found or error, creating workspace...');
    const workspaceId = await ensureWorkspace(user.id);
    return { user, workspaceId };
  }
  
  return { user, workspaceId: membership.workspace_id };
};

// Ensure workspace exists for user
const ensureWorkspace = async (userId: string) => {
  try {
    console.log('Ensuring workspace for user:', userId);
    
        // Check if user already has a workspace (ignore errors due to RLS)
        const { data: existingMembership, error: membershipCheckError } = await supabase
          .from('memberships')
          .select('workspace_id')
          .eq('user_id', userId)
          .maybeSingle();

    console.log('Existing membership check:', existingMembership, 'Error:', membershipCheckError);

    if (existingMembership) {
      console.log('User already has workspace:', existingMembership.workspace_id);
      return existingMembership.workspace_id;
    }

    // If there's an error (like RLS blocking), we'll still try to create a workspace
    if (membershipCheckError) {
      console.log('Membership check failed (likely RLS), proceeding to create workspace...');
    }

    console.log('Creating new workspace...');
    
    // Create new workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: 'My Workspace',
        owner_id: userId
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Error creating workspace:', workspaceError);
      // If workspace creation fails due to RLS, return null and fall back to localStorage
      return null;
    }

    console.log('Workspace created:', workspace.id);

    // Create membership
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner'
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      // If membership creation fails, we still have the workspace, so return it
      console.log('Membership creation failed, but workspace exists:', workspace.id);
      return workspace.id;
    }

    console.log('Membership created successfully');
    return workspace.id;
  } catch (error) {
    console.error('Error ensuring workspace:', error);
    return null;
  }
};

// Get or create default area
const getDefaultArea = async (workspaceId: string) => {
  try {
    // Check if default area exists
    const { data: existingArea } = await supabase
      .from('areas')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('is_default', true)
      .single();

    if (existingArea) {
      return existingArea.id;
    }

    // Create default area
    const { data: area, error } = await supabase
      .from('areas')
      .insert({
        workspace_id: workspaceId,
        name: 'General',
        is_default: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default area:', error);
      return null;
    }

    return area.id;
  } catch (error) {
    console.error('Error getting default area:', error);
    return null;
  }
};

// Save goals to Supabase using your existing schema
export const saveGoalsToSupabase = async (horizon: string, goals: Goal[]) => {
  try {
    const { user, workspaceId } = await getCurrentUserAndWorkspace();
    console.log('Save goals - User:', user?.email, 'WorkspaceId:', workspaceId);
    
    if (!user || !workspaceId) {
      console.log('No user or workspace, falling back to localStorage');
      return;
    }

    // Ensure default area exists
    const areaId = await getDefaultArea(workspaceId);
    console.log('Area ID:', areaId);
    if (!areaId) return;

    // Map horizon to database format
    const dbHorizon = mapHorizonToDB(horizon);
    console.log(`Mapping horizon "${horizon}" to "${dbHorizon}"`);

    // Clear existing goals for this horizon
    await supabase
      .from('goals')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('horizon', dbHorizon);

    // Insert new goals
    if (goals.length > 0) {
      const goalsToInsert = goals.map((goal, index) => ({
        workspace_id: workspaceId,
        area_id: areaId,
        horizon: dbHorizon,
        title: goal.title,
        active: !goal.done, // In your schema, active=true means not completed
        parent_goal_id: goal.linkedToParent || null,
        created_at: goal.created_at || new Date().toISOString()
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

// Load goals from Supabase using your existing schema
export const loadGoalsFromSupabase = async (horizon: string): Promise<Goal[]> => {
  try {
    const { user, workspaceId } = await getCurrentUserAndWorkspace();
    if (!user || !workspaceId) return [];

    // Map horizon to database format
    const dbHorizon = mapHorizonToDB(horizon);
    console.log(`Loading goals for horizon "${horizon}" -> "${dbHorizon}"`);

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('horizon', dbHorizon)
      .eq('active', true)
      .order('created_at');

    if (error) {
      console.error(`Error loading ${horizon} goals:`, error);
      return [];
    }

    return data.map((goal, index) => ({
      id: goal.id,
      slot: index + 1, // Convert to slot-based system
      title: goal.title,
      done: !goal.active, // In your schema, active=false means completed
      area: null, // We'll use the area_id from the goal
      linkedToParent: goal.parent_goal_id,
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
    const { user, workspaceId } = await getCurrentUserAndWorkspace();
    console.log('Sync user data - User:', user?.email, 'WorkspaceId:', workspaceId);
    
    if (!user || !workspaceId) {
      console.log('No user or workspace, using localStorage only');
      // Return localStorage data if no user or workspace
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

export const saveUserData = async (goals: UserData) => {
  try {
    const { user, workspaceId } = await getCurrentUserAndWorkspace();
    if (!user || !workspaceId) {
      // Fallback to localStorage only
      localStorage.setItem('daily-outcomes', JSON.stringify(goals.daily));
      localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(goals.weekly));
      localStorage.setItem('monthly-goals', JSON.stringify(goals.monthly));
      localStorage.setItem('yearly-goals', JSON.stringify(goals.yearly));
      localStorage.setItem('five-year-goals', JSON.stringify(goals.fiveYear));
      return;
    }

    // Save to Supabase
    await Promise.all([
      saveGoalsToSupabase('daily', goals.daily),
      saveGoalsToSupabase('weekly', goals.weekly),
      saveGoalsToSupabase('monthly', goals.monthly),
      saveGoalsToSupabase('yearly', goals.yearly),
      saveGoalsToSupabase('five-year', goals.fiveYear)
    ]);

    // Also save to localStorage for offline capability
    localStorage.setItem('daily-outcomes', JSON.stringify(goals.daily));
    localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(goals.weekly));
    localStorage.setItem('monthly-goals', JSON.stringify(goals.monthly));
    localStorage.setItem('yearly-goals', JSON.stringify(goals.yearly));
    localStorage.setItem('five-year-goals', JSON.stringify(goals.fiveYear));
  } catch (error) {
    console.error('Error saving user data:', error);
    // Fallback to localStorage
    localStorage.setItem('daily-outcomes', JSON.stringify(goals.daily));
    localStorage.setItem(`weekly-goals-${formatDate(getWeekStart(), 'yyyy-MM-dd')}`, JSON.stringify(goals.weekly));
    localStorage.setItem('monthly-goals', JSON.stringify(goals.monthly));
    localStorage.setItem('yearly-goals', JSON.stringify(goals.yearly));
    localStorage.setItem('five-year-goals', JSON.stringify(goals.fiveYear));
  }
};

// Clean up duplicate workspaces (run this once to fix the current mess)
export const cleanupDuplicateWorkspaces = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('Cleaning up duplicate workspaces for user:', user.email);

    // Get all memberships for this user
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('workspace_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching memberships:', error);
      return;
    }

    if (memberships && memberships.length > 1) {
      console.log(`Found ${memberships.length} workspaces, keeping the first one`);
      
      // Keep the first workspace, delete the rest
      const workspacesToDelete = memberships.slice(1);
      
      for (const membership of workspacesToDelete) {
        console.log('Deleting workspace:', membership.workspace_id);
        
        // Delete goals in this workspace
        await supabase
          .from('goals')
          .delete()
          .eq('workspace_id', membership.workspace_id);
        
        // Delete areas in this workspace
        await supabase
          .from('areas')
          .delete()
          .eq('workspace_id', membership.workspace_id);
        
        // Delete membership
        await supabase
          .from('memberships')
          .delete()
          .eq('workspace_id', membership.workspace_id)
          .eq('user_id', user.id);
        
        // Delete workspace
        await supabase
          .from('workspaces')
          .delete()
          .eq('id', membership.workspace_id);
      }
      
      console.log('Cleanup complete!');
    }
  } catch (error) {
    console.error('Error cleaning up workspaces:', error);
  }
};