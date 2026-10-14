// Connexion à Supabase pour synchroniser la progression entre appareils.
// L'URL du projet et la clé « anon / public » sont faites pour être publiques :
// la table n'est accessible qu'à travers les fonctions get_progress / save_progress (voir supabase/schema.sql).
// Ne jamais mettre ici la clé « service_role ».
export const SUPABASE_URL = 'https://ixexcjounpwijkxbwebj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_B0i5zXwB1hp0_loWgXwcQQ_jZuhCLjb';
