import { supabase } from '../lib/supabaseClient'

// Get all users in the current org
export async function getOrgUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, organisations(name)')
      .order('full_name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Update a user's role
export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Deactivate a user
export async function deactivateUser(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Reactivate a user
export async function reactivateUser(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
