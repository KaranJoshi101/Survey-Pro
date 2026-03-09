import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import articleService from '../services/articleService';
import LoadingSpinner from '../components/LoadingSpinner';

const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await articleService.getArticles(page, 10);
            setArticles(response.data.articles);
            setTotalPages(response.data.pagination.pages);
            setError('');
        } catch (err) {
            setError('Failed to load articles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    if (loading && articles.length === 0) {
        return <LoadingSpinner fullScreen={false} />;
    }

    return (
        <div className="container mt-4">
            <div className="container mt-4"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
            <div></div>
            <h1 style={{ margin: 0, color: '#003594' }}>Published Articles</h1>
            
            <Link
                to="/"
                className="btn btn-primary btn-sm"
            >
                Go Back
            </Link>
            </div>


            <p style={{ color: '#555', marginBottom: '24px', textAlign: 'center' }}>
                Read helpful articles and guides
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            {articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>
                        No articles available yet.
                    </p>
                </div>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {articles.map((article) => (
                        <div key={article.id} className="card" style={{ marginBottom: '20px' }}>
                            <div className="card-body">
                                <h2>
                                    <Link
                                        to={`/articles/${article.id}`}
                                        style={{ color: '#003594', textDecoration: 'none' }}
                                    >
                                        {article.title}
                                    </Link>
                                </h2>
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                    By {article.author_name} on{' '}
                                    {new Date(article.created_at).toLocaleDateString()}
                                </p>
                                <p style={{ color: '#555', marginBottom: '16px' }}>
                                    {stripHtml(article.content).substring(0, 150)}...
                                </p>
                                <Link
                                    to={`/articles/${article.id}`}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.9rem' }}
                                >
                                    Read More
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <span style={{ padding: '6px 12px' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArticlesPage;
