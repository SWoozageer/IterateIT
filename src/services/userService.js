import { supabase } from '../lib/supabaseClient'

// Get all user→system assignments for the current org (admin view)
export async function getAllUserSystems() {
  try {
    const { data, error } = await supabase
      .from('user_systems')
      .select('user_id, system_id, systems(id, name)')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Replace all system assignments for a single user
export async function setUserSystems(userId, systemIds) {
  try {
    const { error: delError } = await supabase
      .from('user_systems')
      .delete()
      .eq('user_id', userId)

    if (delError) throw delError

    if (systemIds.length > 0) {
      const rows = systemIds.map(sid => ({ user_id: userId, system_id: sid }))
      const { error: insError } = await supabase
        .from('user_systems')
        .insert(rows)
      if (insError) throw insError
    }

    return { error: null }
  } catch (error) {
    return { error }
  }
}

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
