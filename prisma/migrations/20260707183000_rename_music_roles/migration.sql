-- Rename legacy music roles to hierarchy roles
UPDATE "User" SET role = 'music_minister' WHERE role = 'music_director';
UPDATE "User" SET role = 'band_member' WHERE role = 'musician';
