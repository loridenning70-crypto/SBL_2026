import { createClient } from '@supabase/supabase-js'
import { response } from './format'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'client-type': 'super-control-panel' },
  },
})

export const getAllRuns = async () => {
  const { data, error } = await supabase
    .from('run')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching runs:', error)
    return []
  }

  return data
}

export const getRunById = async (runId) => {
  const { data, error } = await supabase
    .from('run')
    .select()
    .eq('run_id', runId)
    .single()

  if (error) {
    console.error(`Error fetching run with ID ${runId}:`, error)
    return null
  }

  return data
}

export const getCharacterIdFromCharCode = async (charCode) => {
  const { data, error } = await supabase
    .from('character')
    .select('character_id')
    .eq('char_code', charCode)
    .single()

  if (error) {
    console.error(`Error fetching character ID for char code ${charCode}:`, error)
    return null
  }

  return data.character_id
}

export const getResponsesForRunAndCharacter = async (runId, charCode) => {
  const characterId = await getCharacterIdFromCharCode(charCode);
  const { data, error } = await supabase
    .from('response')
    .select(response)
    .eq('run', runId)
    .eq('character_id', characterId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching responses:', error)
    return []
  }

  return { data }
}

export const getAllResponsesForRunId = async (runId) => {
  const { data, error } = await supabase
    .from('response')
    .select(response)
    .eq('run', runId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching responses:', error)
    return []
  }

  return { data }
}










export const postResponses = async (responses) => {
  const { data, error } = await supabase
    .from('response')
    .insert(responses)
    .select(response);

  if (error) {
    console.error('Error inserting responses:', error);
  }

  return data;
}

export const createRun = async (name, model) => {
  const { data, error } = await supabase
    .from('run')
    .insert([{ name, model }])
    .select()
    .single();

  if (error) {
    console.error('Error creating new run:', error);
    return null;
  }

  return { data, error };
}

export const getCurrentRun = async () => {
  const { data, error } = await supabase
    .from('general')
    .select('run')
    .eq('general_id', 1)
    .single();

  if (error) {
    console.error('Error fetching current run:', error);
    return null;
  }

  return data?.run;
}

export const incrementRun = async () => {
  const run = await getCurrentRun();
  const { data, error } = await supabase
    .from('general')
    .update({ run: run + 1 })
    .select('run')
    .eq('general_id', 1)
    .single();

  if (error) {
    console.error('Error incrementing run:', error);
    return null;
  }

  return data?.run;
}
