import initialData from './data.js';

const STORAGE_KEY = 'iv_muro_reviews';
const LIKES_KEY = 'iv_muro_user_likes';

/* ---- Local helpers ---- */
const getLocal = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
const saveLocal = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

/* ---- Public API ---- */

export const getReviews = async () => {
    let data = getLocal();
    if (!data) { data = initialData; saveLocal(data); }
    return data;
};

export const addReview = async (review) => {
    const reviews = await getReviews();
    reviews.unshift(review);
    saveLocal(reviews);
    return true;
};

export const deleteReview = async (id) => {
    const reviews = await getReviews();
    saveLocal(reviews.filter(r => r.id !== id));
    return true;
};

export const updateReview = async (updated) => {
    const reviews = await getReviews();
    const idx = reviews.findIndex(r => r.id === updated.id);
    if (idx !== -1) { reviews[idx] = updated; saveLocal(reviews); }
    return true;
};

export const exportData = () => localStorage.getItem(STORAGE_KEY) || JSON.stringify(initialData);

export const importData = async (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if (Array.isArray(data)) { saveLocal(data); return true; }
        return false;
    } catch { return false; }
};

/* ---- Reactions ---- */

export const getReactionState = (reviewId) => {
    const likes = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]'));
    return likes.has(reviewId);
};

export const toggleReaction = async (reviewId) => {
    const reviews = await getReviews();
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return null;

    if (!reviews[idx].likes) reviews[idx].likes = 0;

    const likes = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]'));
    const isLiked = likes.has(reviewId);

    if (isLiked) {
        reviews[idx].likes = Math.max(0, reviews[idx].likes - 1);
        likes.delete(reviewId);
    } else {
        reviews[idx].likes++;
        likes.add(reviewId);
    }

    saveLocal(reviews);
    localStorage.setItem(LIKES_KEY, JSON.stringify([...likes]));
    return { newCount: reviews[idx].likes, isLiked: !isLiked };
};
