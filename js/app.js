import { getReviews, toggleReaction, getReactionState } from './storage.js';

/* ---- Card Factory ---- */
const createCard = (review) => {
    const isLiked = getReactionState(review.id);
    return `
    <div class="post-card" onclick="window.location.href='review.html?id=${review.id}'">

        <!-- Vote Column -->
        <div class="vote-column" onclick="handleVote(event, ${review.id})">
            <i class="fas fa-arrow-up vote-btn ${isLiked ? 'active' : ''}"
               id="vote-btn-${review.id}"
               style="${isLiked ? 'color:var(--accent-brand);' : ''}"></i>
            <span class="vote-count" style="opacity:0;">•</span>
            <i class="fas fa-arrow-down vote-btn" style="opacity:0.2; pointer-events:none;"></i>
        </div>

        <!-- Content -->
        <div class="content-column">
            <div class="post-meta">
                <i class="fas fa-theater-masks" style="color:var(--accent-brand);"></i>
                <span class="subreddit-name">r/${review.category.replace(/\s+/g, '')}</span>
                <span>•</span>
                <span class="posted-by">u/Anonimo</span>
                <span>•</span>
                <span>${review.date}</span>
                <span class="flair-tag">${review.category}</span>
            </div>

            <h3 class="post-title">${review.title}</h3>

            ${review.image ? `<img src="${review.image}" class="post-preview-img" loading="lazy" alt="${review.title}">` : ''}

            <div class="post-body-text">${review.excerpt}</div>

            <div class="post-footer-actions">
                <div class="action-item"><i class="fas fa-book-open"></i> Leer Crítica</div>
                <div class="action-item"><i class="fas fa-share"></i> Compartir</div>
                <div class="action-item"><i class="fas fa-bookmark"></i> Guardar</div>
            </div>
        </div>
    </div>`;
};

/* ---- Vote Handler (global) ---- */
window.handleVote = async (e, id) => {
    e.stopPropagation();
    const result = await toggleReaction(id);
    const btn = document.getElementById(`vote-btn-${id}`);
    if (!btn || !result) return;
    if (result.isLiked) {
        btn.style.color = 'var(--accent-brand)';
        btn.classList.add('active');
    } else {
        btn.style.color = '';
        btn.classList.remove('active');
    }
};

/* ---- Render Feed ---- */
const renderFeed = (reviews) => {
    const feed = document.getElementById('reviews-feed');
    if (!feed) return;

    if (reviews.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-theater-masks"></i>
                <h3>Aún no hay críticas</h3>
                <p>El administrador publicará las primeras reseñas pronto.</p>
            </div>`;
        return;
    }

    feed.innerHTML = reviews.map(createCard).join('');

    const countEl = document.getElementById('total-reviews-count');
    if (countEl) countEl.textContent = reviews.length;
};

/* ---- Search ---- */
const setupSearch = (allReviews) => {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = allReviews.filter(r =>
            r.title.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.excerpt.toLowerCase().includes(q)
        );
        renderFeed(filtered);
    });
};

/* ---- Filter Bar ---- */
const setupFilters = (allReviews) => {
    document.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const filter = item.dataset.filter;
            let sorted = [...allReviews];
            if (filter === 'top') sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            if (filter === 'new') sorted.sort((a, b) => b.id - a.id);
            if (filter === 'hot') sorted.sort((a, b) => ((b.likes || 0) * b.rating) - ((a.likes || 0) * a.rating));
            renderFeed(sorted);
        });
    });
};

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', async () => {
    const reviews = await getReviews();
    renderFeed(reviews);
    setupSearch(reviews);
    setupFilters(reviews);
});
