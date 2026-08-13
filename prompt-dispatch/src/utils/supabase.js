import { createClient } from '@supabase/supabase-js'

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

// {
//   output_id,
//   phase,
//   loop_index,
//   model,
//   character_id,
//   raw_output
// }

export const postResponses = async (responses) => {
  const { data, error } = await supabase
    .from('response')
    .insert(responses);

  if (error) {
    console.error('Error inserting responses:', error);
  }

  return data;
}

export const getCharacterIdFromCharCode = async (charCode) => {
  const { data, error } = await supabase
    .from('character')
    .select('character_id')
    .eq('char_code', charCode)
    .single();

  if (error) {
    console.error(`Error fetching character ID for charCode ${charCode}:`, error);
    return null;
  }

  return data?.character_id;
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

// export const uploadCharactersToSupabase = async (characters) => {
//   const refined = characters.map((char) => ({
//     ...char,
//     passages: JSON.stringify(char.passages || []).replace(/\s+/g, ""),
//   }));  

//   const { data, error } = await supabase
//     .from('character')
//     .insert(refined);

//   if (error) {
//     console.error('Error uploading characters:', error);
//   }

//   return data;
// }
