-- seed.sql
TRUNCATE 
  messages, conversations, reviews, 
  listings, products, categories, users 
  RESTART IDENTITY CASCADE;

-- Insert categories
INSERT INTO categories (name) 
VALUES 
  ('Books'),
  ('Electronics'),
  ('Furniture'),
  ('Clothing'),
  ('School Supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert users
INSERT INTO users (user_id, username, email, password_hash, university, verified)
VALUES
  (uuid_generate_v4(), 'Thapelo', 'john@campus.edu', crypt('SecurePass123', gen_salt('bf')), 'State University', true),
  (uuid_generate_v4(), 'Barggins', 'tech@campus.edu', crypt('MacBook2023!', gen_salt('bf')), 'Tech Institute', true),
  (uuid_generate_v4(), 'HomeDecor', 'decor@uni.edu', crypt('Chair123!', gen_salt('bf')), 'State University', true),
  (uuid_generate_v4(), 'Fashionista', 'fashion@college.edu', crypt('Jacket2023!', gen_salt('bf')), 'Fashion School', true),
  (uuid_generate_v4(), 'AudioPro', 'audio@campus.edu', crypt('Headphones1!', gen_salt('bf')), 'Music College', true);

-- Insert products
INSERT INTO products (product_id, title, description, category_id, image_url)
VALUES
  (uuid_generate_v4(), 'Like New Calculus Textbook', 'Used for one semester, excellent condition with no markings', 1, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'),
  (uuid_generate_v4(), 'MacBook Pro 2020', '13-inch, 256GB SSD, 16GB RAM. Perfect condition', 2, 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2'),
  (uuid_generate_v4(), 'Ergonomic Office Chair', 'Adjustable height and lumbar support. Like new', 3, 'https://images.unsplash.com/photo-1505798577917-a65157d3320a');

-- Insert listings with valid condition values
INSERT INTO listings (listing_id, user_id, product_id, price, condition, listing_type, status)
SELECT 
  uuid_generate_v4(),
  u.user_id,
  p.product_id,
  CASE 
    WHEN p.title LIKE '%Textbook%' THEN 30 + (random() * 20)
    WHEN p.category_id = 2 THEN 100 + (random() * 1000)
    ELSE 20 + (random() * 80)
  END,
  CASE 
    WHEN p.title LIKE '%Like New%' THEN 'like_new'
    WHEN p.title LIKE '%Used%' THEN 'good'
    ELSE 'new'  -- Only allowed values: new, like_new, good, fair, poor
  END,
  'sale',
  'active'
FROM products p
JOIN users u ON u.username = 
  CASE 
    WHEN p.title LIKE '%Textbook%' THEN 'john_doe'
    WHEN p.title LIKE '%MacBook%' THEN 'TechGuy'
    ELSE 'HomeDecor'
  END;