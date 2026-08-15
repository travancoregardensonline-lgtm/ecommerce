const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error.message);
    return;
  }
  
  const adminUser = users.find(u => u.email === 'admin@travancore.com');
  
  if (!adminUser) {
    console.log("User admin@travancore.com not found!");
    return;
  }
  
  const { data, error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
    password: 'AdminPassword123!'
  });
  
  if (updateError) {
    console.error("Error updating password:", updateError.message);
  } else {
    console.log("Password reset successfully for admin@travancore.com to: AdminPassword123!");
  }
}

resetPassword();
