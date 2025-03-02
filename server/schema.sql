-- campus_trade_schema_v2.sql

/* ========== EXTENSIONS ========== */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* ========== TABLES ========== */

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    university VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    verified BOOLEAN DEFAULT false,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~* '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT username_length CHECK (LENGTH(username) BETWEEN 3 AND 50),
    CONSTRAINT password_complexity CHECK (LENGTH(password_hash) >= 60)
);

-- Categories Table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon_url TEXT
);

-- Products Table (Now condition-agnostic)
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', title || ' ' || description)
    ) STORED,
    
    CONSTRAINT title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Listings Table (Now contains condition)
CREATE TABLE listings (
    listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    price DECIMAL(10,2) CHECK (price >= 0),
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    listing_type VARCHAR(10) CHECK (listing_type IN ('sale', 'trade', 'both')),
    status VARCHAR(20) CHECK (status IN ('active', 'pending', 'sold', 'traded', 'expired')),
    location GEOGRAPHY(POINT),
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Conversations Table with Ordered Users
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
    user1_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (user1_id < user2_id),
    UNIQUE (user1_id, user2_id, listing_id)
);

-- Messages Table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Reviews Table with Self-Review Prevention
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(listing_id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CHECK (reviewer_id != reviewee_id)
);

/* ========== INDEXES ========== */
-- Products
CREATE INDEX idx_products_fts ON products USING GIN(search_vector);

-- Listings
CREATE INDEX idx_listings_location ON listings USING GIST(location);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_user_status ON listings(user_id, status);
CREATE INDEX idx_listings_condition ON listings(condition);
CREATE INDEX idx_listings_expires ON listings(expires_at);

-- Users
CREATE INDEX idx_users_email ON users(email);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Reviews
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

/* ========== VIEWS ========== */
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.user_id,
    u.username,
    COUNT(DISTINCT l.listing_id) AS total_listings,
    COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.listing_id END) AS active_listings,
    COUNT(DISTINCT CASE WHEN l.status IN ('sold', 'traded') THEN l.listing_id END) AS completed_transactions,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(DISTINCT r.review_id) AS total_reviews
FROM users u 
LEFT JOIN listings l ON u.user_id = l.user_id
LEFT JOIN reviews r ON u.user_id = r.reviewee_id
GROUP BY u.user_id;

/* ========== FUNCTIONS ========== */
-- Nearby listings with condition
CREATE OR REPLACE FUNCTION find_nearby_listings(
    lat double precision,
    lng double precision,
    radius_meters integer DEFAULT 5000
) RETURNS TABLE (
    listing_id UUID,
    title VARCHAR,
    price DECIMAL,
    condition VARCHAR,
    distance_meters double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.listing_id,
        p.title,
        l.price,
        l.condition,
        ST_Distance(l.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance
    FROM listings l
    JOIN products p USING (product_id)
    WHERE 
        l.status = 'active'
        AND ST_DWithin(
            l.location,
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            radius_meters
        )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Enhanced search with condition
CREATE OR REPLACE FUNCTION search_listings(search_query text)
RETURNS TABLE (listing_id UUID, title VARCHAR, price DECIMAL, condition VARCHAR, rank float) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.listing_id,
        p.title,
        l.price,
        l.condition,
        ts_rank(
            to_tsvector('english', p.title || ' ' || p.description || ' ' || l.condition),
            websearch_to_tsquery('english', search_query)
        ) * (1 / (1 + EXTRACT(DAY FROM NOW() - l.created_at))) AS rank
    FROM listings l
    JOIN products p USING (product_id)
    WHERE 
        l.status = 'active'
        AND to_tsvector('english', p.title || ' ' || p.description || ' ' || l.condition)
            @@ websearch_to_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

/* ========== TRIGGERS ========== */
-- Listing update timestamp
CREATE OR REPLACE FUNCTION update_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_listing_timestamp
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_timestamp();

/* ========== SECURITY ========== */
-- Create application user (Password should be set via environment variables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ct_appuser') THEN
        CREATE ROLE ct_appuser WITH LOGIN PASSWORD 'REPLACE_WITH_ENV_VARIABLE';
    END IF;
END
$$;

-- Grant privileges
GRANT CONNECT ON DATABASE campustrade TO ct_appuser;
GRANT USAGE ON SCHEMA public TO ct_appuser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ct_appuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ct_appuser;

/* ========== SAMPLE DATA ========== */
INSERT INTO categories (name) VALUES 
    ('Books'),
    ('Electronics'),
    ('Furniture'),
    ('Clothing'),
    ('School Supplies');
/* ========== SAMPLE DATA ========== */
-- Users
/* ========== SCHEMA UPDATE ========== */
-- Add image_url column to products
ALTER TABLE products ADD COLUMN image_url TEXT;

/* ========== ENHANCED SAMPLE DATA ========== */
-- Users (12 total)
INSERT INTO users (user_id, username, email, password_hash, university, verified) VALUES
(uuid_generate_v4(), 'TechGuy', 'tech@campus.edu', crypt('MacBook2023!', gen_salt('bf')), 'Tech Institute', true),
(uuid_generate_v4(), 'HomeDecor', 'decor@uni.edu', crypt('Chair123!', gen_salt('bf')), 'State University', true),
(uuid_generate_v4(), 'Fashionista', 'fashion@college.edu', crypt('Jacket2023!', gen_salt('bf')), 'Fashion School', true),
(uuid_generate_v4(), 'AudioPro', 'audio@campus.edu', crypt('Headphones1!', gen_salt('bf')), 'Music College', true),
(uuid_generate_v4(), 'ScienceStudent', 'science@uni.edu', crypt('Chemistry123', gen_salt('bf')), 'Science University', true),
(uuid_generate_v4(), 'LightItUp', 'lighting@college.edu', crypt('Lamp456!', gen_salt('bf')), 'Design Institute', true),
(uuid_generate_v4(), 'TeeShop', 'tshirts@campus.edu', crypt('Tees2023!', gen_salt('bf')), 'State University', true),
(uuid_generate_v4(), 'ScreenMaster', 'screens@tech.edu', crypt('Monitor789!', gen_salt('bf')), 'Tech Institute', true),
(uuid_generate_v4(), 'LangLearner', 'language@uni.edu', crypt('French123!', gen_salt('bf')), 'Language College', true),
(uuid_generate_v4(), 'WoodWorks', 'wood@campus.edu', crypt('Furniture456!', gen_salt('bf')), 'Design University', true),
(uuid_generate_v4(), 'SneakerHead', 'shoes@college.edu', crypt('Sneakers789!', gen_salt('bf')), 'Sports Academy', true),
(uuid_generate_v4(), 'GamerPro', 'gaming@tech.edu', crypt('Keyboard123!', gen_salt('bf')), 'Tech Institute', true);

-- Products (15 items with images)
INSERT INTO products (product_id, title, description, category_id, image_url) VALUES
(uuid_generate_v4(), 'Like New Calculus Textbook', 'Used for one semester, excellent condition with no markings', 1, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'),
(uuid_generate_v4(), 'MacBook Pro 2020', '13-inch, 256GB SSD, 16GB RAM. Perfect condition', 2, 'https://images.unsplash.com/photo-1511385348-a52b4a160dc2'),
(uuid_generate_v4(), 'Ergonomic Office Chair', 'Adjustable height and lumbar support. Like new', 3, 'https://images.unsplash.com/photo-1505798577917-a65157d3320a'),
(uuid_generate_v4(), 'Men''s Winter Jacket', 'Size L, waterproof, only worn twice', 4, 'https://images.unsplash.com/photo-1551028719-00167b16eac5'),
(uuid_generate_v4(), 'Wireless Headphones', 'Noise-cancelling, 20hr battery life', 2, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'),
(uuid_generate_v4(), 'Organic Chemistry Textbook', 'Latest edition, highlighted chapters 1-5', 1, 'https://images.unsplash.com/photo-1589998059171-988d887df646'),
(uuid_generate_v4(), 'LED Desk Lamp', 'Adjustable brightness, USB charging port', 3, 'https://images.unsplash.com/photo-1586201375761-83865001e31c'),
(uuid_generate_v4(), 'Graphic T-Shirt Bundle', '3 vintage band tees, size M', 4, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820'),
(uuid_generate_v4(), 'External Monitor 24"', 'Full HD, HDMI/VGA inputs', 2, 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c'),
(uuid_generate_v4(), 'French Dictionary', 'Like new, never used', 1, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19'),
(uuid_generate_v4(), 'Coffee Table', 'Modern design, minor surface scratches', 3, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc'),
(uuid_generate_v4(), 'Women''s Running Shoes', 'Size 8, barely worn', 4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'),
(uuid_generate_v4(), 'Gaming Keyboard', 'RGB lighting, mechanical switches', 2, 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e'),
(uuid_generate_v4(), 'World History Textbook', '2019 edition, some notes in margins', 1, 'https://images.unsplash.com/photo-1519682337058-a94d519337bc'),
(uuid_generate_v4(), 'Bookshelf', '5-tier wooden shelf, easy assembly', 3, 'https://images.unsplash.com/photo-1598300056393-4aac492f4344');

-- Listings (15 active listings)
INSERT INTO listings (listing_id, user_id, product_id, price, condition, listing_type, status, location) 
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
    ELSE 'excellent'
  END,
  'sale',
  'active',
  ST_SetSRID(ST_MakePoint(-118.4452 + (random() * 0.01), 34.0631 + (random() * 0.01)), 4326)::geography
FROM products p
JOIN users u ON 
  CASE 
    WHEN p.title LIKE '%Textbook%' THEN u.username = 'ScienceStudent'
    WHEN p.title LIKE '%MacBook%' THEN u.username = 'TechGuy'
    WHEN p.title LIKE '%Chair%' THEN u.username = 'HomeDecor'
    ELSE u.username = split_part(p.title, ' ', 1) || '_' || split_part(p.title, ' ', 2)
  END;

/* ========== OPTIONAL CONSTRAINTS ========== */
-- Uncomment if you want unique product listings:
-- ALTER TABLE listings ADD UNIQUE (product_id);

-- Uncomment if you want to enforce category existence on product creation:
-- ALTER TABLE products 
--   ALTER COLUMN category_id SET NOT NULL,
--   DROP CONSTRAINT products_category_id_fkey,
--   ADD CONSTRAINT products_category_id_fkey 
--     FOREIGN KEY (category_id) REFERENCES categories(category_id)
--     ON DELETE RESTRICT;