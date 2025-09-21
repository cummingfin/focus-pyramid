import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const bootstrapWorkspace = async (userId: string) => {
  try {
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
      return null;
    }

    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner'
      });

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
    }

    return workspace;
  } catch (error) {
    console.error('Bootstrap workspace error:', error);
    return null;
  }
};

export const getUserWorkspace = async (userId: string) => {
  try {
    const { data: membership } = await supabase
      .from('memberships')
      .select('workspace_id')
      .eq('user_id', userId)
      .single();

    return membership?.workspace_id || null;
  } catch (error) {
    console.error('Get user workspace error:', error);
    return null;
  }
};

export const ensureToday = async (workspaceId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingDay } = await supabase
      .from('days')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('date', today)
      .single();

    if (existingDay) {
      return existingDay.id;
    }

    const { data: newDay, error } = await supabase
      .from('days')
      .insert({
        workspace_id: workspaceId,
        date: today
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating day:', error);
      return null;
    }

    return newDay.id;
  } catch (error) {
    console.error('Ensure today error:', error);
    return null;
  }
};
