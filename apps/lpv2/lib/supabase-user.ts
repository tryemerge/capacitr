import { supabase } from './supabase'

/**
 * Ensure a Supabase user record exists for the given Privy ID.
 * Creates one if it doesn't exist. Returns the user's UUID.
 */
export async function ensureSupabaseUser(
  privyId: string,
  provider?: string,
  displayName?: string,
): Promise<string> {
  // Check if user already exists
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single()

  if (existing) return existing.id

  // PGRST116 = "no rows returned" — that's expected when the user doesn't exist yet
  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking for existing user:', selectError)
    throw selectError
  }

  // Create a new user
  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({
      privy_id: privyId,
      privy_provider: provider ?? null,
      display_name: displayName ?? null,
    })
    .select('id')
    .single()

  if (insertError) {
    // Race condition: another request may have inserted between our select and insert
    if (insertError.code === '23505') {
      const { data: retry } = await supabase
        .from('users')
        .select('id')
        .eq('privy_id', privyId)
        .single()
      if (retry) return retry.id
    }
    console.error('Error creating user:', insertError)
    throw insertError
  }

  return created!.id
}

/**
 * Fetch the risk profile for a user.
 */
export async function getUserRiskProfile(userId: string) {
  const { data, error } = await supabase
    .from('risk_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching risk profile:', error)
    throw error
  }

  return data
}

/**
 * Upsert a risk profile for a user.
 */
export async function saveUserRiskProfile(
  userId: string,
  tier: string,
  scores: number[],
) {
  const { error } = await supabase
    .from('risk_profiles')
    .upsert(
      {
        user_id: userId,
        tier,
        scores,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('Error saving risk profile:', error)
    throw error
  }
}

/**
 * Fetch interests for a user.
 */
export async function getUserInterests(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_interests')
    .select('interest')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching interests:', error)
    throw error
  }

  return (data ?? []).map((row) => row.interest)
}

/**
 * Replace all interests for a user with a new set.
 */
export async function saveUserInterests(
  userId: string,
  interests: string[],
) {
  // Delete existing interests
  const { error: deleteError } = await supabase
    .from('user_interests')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error deleting existing interests:', deleteError)
    throw deleteError
  }

  // Insert new interests
  if (interests.length > 0) {
    const rows = interests.map((interest) => ({
      user_id: userId,
      interest,
    }))

    const { error: insertError } = await supabase
      .from('user_interests')
      .insert(rows)

    if (insertError) {
      console.error('Error inserting interests:', insertError)
      throw insertError
    }
  }
}
