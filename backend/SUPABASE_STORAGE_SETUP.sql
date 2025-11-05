-- ====================================
-- Configuration Supabase Storage (Simplifié)
-- ====================================
-- Ce script configure les politiques RLS pour le bucket rsocial-uploads

-- 1. Créer le bucket (si pas déjà fait)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rsocial-uploads', 'rsocial-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Politique : Autoriser TOUS les uploads authentifiés (PERMISSIF - MVP)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rsocial-uploads');

-- 3. Politique : Autoriser la lecture publique
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rsocial-uploads');

-- 4. Politique : Autoriser la suppression par les utilisateurs authentifiés (PERMISSIF - MVP)
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'rsocial-uploads');

-- 5. Politique : Autoriser la mise à jour par les utilisateurs authentifiés (PERMISSIF - MVP)
CREATE POLICY "Allow authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'rsocial-uploads');

-- ====================================
-- Notes importantes
-- ====================================
-- 1. Ces politiques sont PERMISSIVES (MVP) :
--    ✅ N'importe quel utilisateur authentifié peut upload
--    ✅ N'importe quel utilisateur authentifié peut supprimer/modifier
--    ✅ Tout le monde peut lire (bucket public)
--
-- 2. Pour la PRODUCTION, vous devriez :
--    ⚠️  Restreindre les uploads à un dossier par utilisateur
--    ⚠️  Limiter la suppression aux propres fichiers
--    ⚠️  Ajouter des quotas de stockage
--    ⚠️  Limiter les types MIME et tailles
--
-- 3. Comment tester :
--    - Aller sur Supabase Dashboard → Storage
--    - Vérifier que le bucket 'rsocial-uploads' est public
--    - Tester l'upload d'une image depuis l'app
--

