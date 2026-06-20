import { createClient } from '@supabase/supabase-js';

const url = 'https://evcisvpjezfamtymmxzv.supabase.co';
const key = 'sb_publishable_TzjqAXwgExM-V-919x9hrQ_bd5fcZjK';

async function test() {
  console.log('Testing todoapp schema...');
  const supabase = createClient(url, key, { db: { schema: 'todoapp' } });
  
  const { data, error } = await supabase.from('boards').select('*').limit(1);
  
  if (error) {
    if (error.code === 'PGRST106') {
      console.log('FAIL: todoapp schema is not exposed in Supabase settings.');
    } else {
      console.log('FAIL: other error in todoapp:', error);
    }
  } else {
    console.log('OK: todoapp schema working and accessible!');
    console.log('Boards found:', data.length);
  }
}

test();
