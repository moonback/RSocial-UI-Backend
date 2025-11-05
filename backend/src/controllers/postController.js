import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { calculateDistance } from '../utils/geolocation.js';

// Créer un post
export const createPost = async (req, res) => {
  try {
    const { content, type, images, location } = req.body;
    const userId = req.user.id;

    const postId = uuidv4();
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([{
        id: postId,
        user_id: userId,
        content,
        type,
        images: images || [],
        location,
        likes: 0,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        users (id, name, avatar)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Post créé',
      post
    });
  } catch (error) {
    console.error('Erreur createPost:', error);
    res.status(500).json({
      error: 'Erreur lors de la création du post'
    });
  }
};

// Récupérer les posts locaux
export const getPosts = async (req, res) => {
  try {
    const { lat, lng, radius = 3, type } = req.query;

    let query = supabaseAdmin
      .from('posts')
      .select(`
        *,
        users (id, name, avatar),
        comments (
          id,
          content,
          created_at,
          user:users (id, name, avatar)
        )
      `)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    // Filtrer par distance si coordonnées fournies
    let filteredPosts = posts;
    if (lat && lng) {
      filteredPosts = posts.filter(post => {
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          post.location.lat,
          post.location.lng
        );
        return distance <= parseFloat(radius);
      });
    }

    res.json({ posts: filteredPosts });
  } catch (error) {
    console.error('Erreur getPosts:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des posts'
    });
  }
};

// Liker un post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Vérifier si l'utilisateur a déjà liké
    const { data: existingLike } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Décrémenter le compteur
      await supabaseAdmin
        .rpc('decrement_post_likes', { post_id: postId });

      return res.json({ message: 'Like retiré', liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from('post_likes')
        .insert([{
          id: uuidv4(),
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        }]);

      // Incrémenter le compteur
      await supabaseAdmin
        .rpc('increment_post_likes', { post_id: postId });

      return res.json({ message: 'Post liké', liked: true });
    }
  } catch (error) {
    console.error('Erreur likePost:', error);
    res.status(500).json({
      error: 'Erreur lors du like'
    });
  }
};

// Commenter un post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const commentId = uuidv4();
    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([{
        id: commentId,
        post_id: postId,
        user_id: userId,
        content,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        user:users (id, name, avatar)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Commentaire ajouté',
      comment
    });
  } catch (error) {
    console.error('Erreur addComment:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'ajout du commentaire'
    });
  }
};

// Supprimer un post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Vérifier que le post appartient à l'utilisateur
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post || post.user_id !== userId) {
      return res.status(403).json({
        error: 'Non autorisé'
      });
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Post supprimé' });
  } catch (error) {
    console.error('Erreur deletePost:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du post'
    });
  }
};

