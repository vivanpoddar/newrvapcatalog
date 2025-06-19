console.log('Testing database connection...');
const { createClient } = require('./utils/supabase/server.ts');

async function testConnection() {
  try {
    const supabase = await createClient();
    const { data, error, count } = await supabase
      .from('catalog')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('Data:', data);
    console.log('Count:', count);
    console.log('Error:', error);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testConnection();
