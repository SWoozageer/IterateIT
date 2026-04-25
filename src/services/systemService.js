import { supabase } from '../lib/supabaseClient'

// Fetch all systems for the current user's org
export async function getSystems() {
  try {
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Create a new system
export async function createSystem(systemData) {
  try {
    const { data, error } = await supabase
      .from('systems')
      .insert(systemData)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}