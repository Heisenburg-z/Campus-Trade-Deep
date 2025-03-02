-- Drop existing schema
DROP TABLE IF EXISTS 
  messages, conversations, reviews, 
  listings, products, categories, users CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_listing_timestamp, find_nearby_listings, search_listings;

-- Now run schema creation
\i schema.sql