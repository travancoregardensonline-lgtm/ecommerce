import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProducts() {
  console.log('Fetching existing categories...');
  // Need a category ID if it's required
  const { data: categories, error: catError } = await supabase.from('categories').select('id').limit(1);
  let categoryId = null;
  if (!catError && categories && categories.length > 0) {
    categoryId = categories[0].id;
  }

  console.log('Seeding 15 mock products...');
  const products = [];
  
  for (let i = 1; i <= 15; i++) {
    const randomNum = Math.floor(Math.random() * 10000);
    products.push({
      name: `Mock Pagination Plant ${randomNum} - ${i}`,
      slug: `mock-pagination-plant-${randomNum}-${i}`,
      description: 'This is a mock product generated to test pagination features in the admin dashboard and shop.',
      price: Math.floor(Math.random() * 1000) + 100,
      stock: Math.floor(Math.random() * 50) + 10,
      is_active: true,
      sku: `MOCK-PG-${randomNum}-${i}`,
      category_id: categoryId
    });
  }

  const { data, error } = await supabase.from('products').insert(products).select();

  if (error) {
    console.error('Error inserting products:', error);
  } else {
    console.log(`Successfully added ${data.length} products!`);
    
    // Add dummy images for them
    const images = data.map(p => ({
        product_id: p.id,
        image_url: 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=600',
        is_primary: true
    }));
    await supabase.from('product_images').insert(images);
    console.log('Added dummy images to the new products.');
  }
}

seedProducts();
