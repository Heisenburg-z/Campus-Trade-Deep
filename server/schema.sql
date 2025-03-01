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