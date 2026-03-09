import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import surveyService from '../services/surveyService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const SurveyDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSurvey = useCallback(async () => {
        try {
            setLoading(true);
            const response = await surveyService.getSurveyById(id);
            setSurvey(response.data.survey);
            setError('');
        } catch (err) {
            setError('Failed to load survey');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSurvey();
    }, [fetchSurvey]);

    if (loading) {
        return <LoadingSpinner fullScreen={false} />;
    }

    if (error || !survey) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error || 'Survey not found'}</div>
                <Link to="/surveys" className="btn btn-primary">
                    Back to Surveys
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <Link to="/surveys" style={{ color: '#003594', textDecoration: 'none' }}>
                ← Back to Surveys
            </Link>

            <div className="card mt-3">
                <div className="card-body">
                    <h1>{survey.title}</h1>
                    <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '24px' }}>
                        {survey.description}
                    </p>

                    <div style={{ marginBottom: '24px' }}>
                        <h3>Questions ({survey.questions?.length || 0})</h3>
                        {survey.questions && survey.questions.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {survey.questions.map((question, index) => (
                                    <li
                                        key={question.id}
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #eee',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <strong>
                                            {index + 1}. {question.question_text}
                                        </strong>
                                        <p style={{ margin: '8px 0 0 0', color: '#555', fontSize: '0.9rem' }}>
                                            Type: <span style={{ fontWeight: 'bold', color: '#003594' }}>{question.question_type}</span>
                                            {!question.is_required && ' (Optional)'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#555' }}>No questions yet</p>
                        )}
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate(`/survey/${id}/take`)}
                                className="btn btn-success"
                                style={{ fontSize: '1.1rem', padding: '12px 24px' }}
                            >
                                Take Survey
                            </button>
                        ) : (
                            <div className="alert alert-info">
                                <p>
                                    Please{' '}
                                    <Link to="/login" style={{ color: '#003594', fontWeight: 'bold' }}>
                                        login
                                    </Link>{' '}
                                    to take this survey
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyDetailPage;
