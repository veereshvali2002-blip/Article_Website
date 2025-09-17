/*
  # Create articles table and authentication setup

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, required, max 200 chars)
      - `content` (text, rich text content)
      - `excerpt` (text, auto-generated from content)
      - `featured_image_url` (text, optional)
      - `attachments` (jsonb, array of file info)
      - `status` (text, 'draft' or 'published')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `author_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `articles` table
    - Add policy for public read access to published articles
    - Add policy for authenticated users to manage all articles
    
  3. Storage
    - Create storage buckets for images and attachments
    - Set up storage policies for file uploads
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) <= 200),
  content text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  featured_image_url text,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read published articles"
  ON articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage all articles"
  ON articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('article-images', 'article-images', true),
  ('article-attachments', 'article-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view article images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can update article images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can delete article images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can view attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'article-attachments');

CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-attachments');

CREATE POLICY "Authenticated users can update attachments"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-attachments');

CREATE POLICY "Authenticated users can delete attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-attachments');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate excerpt
CREATE OR REPLACE FUNCTION generate_excerpt()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove HTML tags and get first 150 characters
  NEW.excerpt = LEFT(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), 150);
  IF LENGTH(NEW.excerpt) = 150 THEN
    NEW.excerpt = NEW.excerpt || '...';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate excerpt
CREATE TRIGGER generate_article_excerpt
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION generate_excerpt();