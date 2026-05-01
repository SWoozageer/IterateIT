import { supabase } from '../lib/supabaseClient'

export async function getTickets({ orgId, systemId, status } = {}) {
  try {
    let query = supabase
      .from('tickets')
      .select(`*, reporter_name, reporter_email, systems(name), profiles!tickets_created_by_fkey(full_name),assignee:profiles!tickets_assigned_to_fkey(full_name)`)
      .order('created_at', { ascending: false })
    if (systemId) query = query.eq('system_id', systemId)
    if (status)   query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getTicketById(ticketId) {
  try {
    const { data, error } = await supabase
      .from('tickets')
     .select(`*, reporter_name, reporter_email, systems(name), profiles!tickets_created_by_fkey(full_name),assignee:profiles!tickets_assigned_to_fkey(full_name), ticket_comments(id, body, is_internal, created_at, profiles(full_name))`)
      .eq('id', ticketId)
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function createTicket(ticketData) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateTicket(ticketId, updates) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteTickets(ticketIds) {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .in('id', ticketIds)
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function addComment(ticketId, authorId, body, isInternal = false) {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({ ticket_id: ticketId, author_id: authorId, body, is_internal: isInternal })
      .select()
      .single()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
