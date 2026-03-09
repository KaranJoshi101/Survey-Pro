import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import responseService from '../services/responseService';
import LoadingSpinner from '../components/LoadingSpinner';

const ResponsesPage = () => {
    const navigate = useNavigate();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchResponses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await responseService.getUserResponses(page, 10);
            setResponses(response.data.responses || []);
            setTotalPages(response.data.pagination?.pages || 1);
            setError('');
        } catch (err) {
            setResponses([]);
            setError(err.response?.data?.error || 'Failed to load responses');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchResponses();
    }, [fetchResponses]);

    if (loading) {
        return <LoadingSpinner fullScreen={false} />;
    }

    return (
        <div className="container mt-4">
            <h1 style={{ color: '#003594' }}>My Survey Responses</h1>
            <p style={{ color: '#555', marginBottom: '24px' }}>
                View all surveys you have responded to
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            {responses.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: '#888' }}>No responses yet</h2>
                    <p style={{ color: '#999', marginBottom: '24px' }}>
                        You haven't submitted any survey responses yet. Start by taking a survey!
                    </p>
                    <button
                        onClick={() => navigate('/surveys')}
                        className="btn btn-primary"
                    >
                        Take a Survey
                    </button>
                </div>
            ) : (
                <div>
                    <table className="card">
                        <thead>
                            <tr>
                                <th>Survey</th>
                                <th>Submitted</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((response) => (
                                <tr key={response.id}>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{response.survey_title || 'Survey'}</strong>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {new Date(response.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            onClick={() => navigate(`/responses/${response.id}`)}
                                            className="btn btn-secondary"
                                            style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

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
            )}
        </div>
    );
};

export default ResponsesPage;
