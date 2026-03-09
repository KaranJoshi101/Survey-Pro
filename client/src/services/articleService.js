import api from './api';

const articleService = {
    // Get all published articles
    getArticles: (page = 1, limit = 10) =>
        api.get(`/articles?page=${page}&limit=${limit}`),

    // Get article by ID
    getArticleById: (id) =>
        api.get(`/articles/${id}`),

    // Create article (admin)
    createArticle: (title, content) =>
        api.post('/articles', { title, content }),

    // Update article (admin)
    updateArticle: (id, data) =>
        api.put(`/articles/${id}`, data),

    // Delete article (admin)
    deleteArticle: (id) =>
        api.delete(`/articles/${id}`),

    // Get admin articles (admin)
    getAdminArticles: (page = 1, limit = 100) =>
        api.get(`/articles/admin/my-articles?page=${page}&limit=${limit}`),

    // Publish article (admin)
    publishArticle: (id) =>
        api.put(`/articles/${id}`, { is_published: true }),

    // Unpublish article (admin)
    unpublishArticle: (id) =>
        api.put(`/articles/${id}`, { is_published: false }),
};

export default articleService;
