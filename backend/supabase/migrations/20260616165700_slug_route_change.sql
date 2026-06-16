-- Drop the UNIQUE constraint on the slug column in the stories table.
-- With the new routing format /story/:storyId-:slug, the storyId makes the URL unique.
-- The slug column no longer needs to be unique, allowing multiple stories to share the same slug name.
ALTER TABLE "public"."stories" DROP CONSTRAINT IF EXISTS "stories_slug_key";
