import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import surveyService from '../services/surveyService';
import responseService from '../services/responseService';
import LoadingSpinner from '../components/LoadingSpinner';

const TakeSurveyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [answers, setAnswers] = useState({});

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

    const handleAnswerChange = (questionId, value) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Convert answers object to array format
            const answersArray = survey.questions.map((question) => {
                const answer = {};
                answer.question_id = question.id;

                if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
                    const selectedOptionId = parseInt(answers[question.id]);
                    if (selectedOptionId) {
                        answer.option_id = selectedOptionId;
                    }
                } else {
                    answer.answer_text = answers[question.id] || '';
                }

                return answer;
            });

            await responseService.submitResponse(parseInt(id), answersArray);
            setSuccess('Survey submitted successfully!');
            setTimeout(() => {
                navigate('/responses');
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to submit survey';
            setError(errorMsg);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen={false} />;
    }

    if (error && !survey) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <Link to="/surveys" className="btn btn-primary">
                    Back to Surveys
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <Link to={`/surveys/${id}`} style={{ color: '#003594', textDecoration: 'none' }}>
                ← Back to Survey
            </Link>

            <div className="card mt-3" style={{ maxWidth: '700px', margin: '24px auto 0' }}>
                <div className="card-body">
                    <h1>{survey?.title}</h1>
                    <p style={{ color: '#555', marginBottom: '24px' }}>Please answer all questions:</p>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        {survey?.questions?.map((question, index) => (
                            <div key={question.id} className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: 'bold', marginBottom: '12px' }}>
                                    {index + 1}. {question.question_text}
                                    {question.is_required && <span style={{ color: '#c0392b' }}> *</span>}
                                </label>

                                {question.question_type === 'text' && (
                                    <textarea
                                        value={answers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder="Enter your answer"
                                        rows="4"
                                        required={question.is_required}
                                    />
                                )}

                                {question.question_type === 'rating' && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <label
                                                key={rating}
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`rating-${question.id}`}
                                                    value={rating}
                                                    checked={parseInt(answers[question.id]) === rating}
                                                    onChange={() => handleAnswerChange(question.id, rating.toString())}
                                                    required={question.is_required}
                                                />
                                                {rating}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {question.options?.map((option) => (
                                            <label
                                                key={option.id}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                            >
                                                <input
                                                    type={question.question_type === 'checkbox' ? 'checkbox' : 'radio'}
                                                    name={`option-${question.id}`}
                                                    value={option.id}
                                                    checked={
                                                        question.question_type === 'checkbox'
                                                            ? false
                                                            : parseInt(answers[question.id]) === option.id
                                                    }
                                                    onChange={() => handleAnswerChange(question.id, option.id.toString())}
                                                    required={question.is_required && question.question_type === 'multiple_choice'}
                                                />
                                                {option.option_text}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="btn btn-success btn-block"
                            disabled={submitting}
                            style={{ fontSize: '1.1rem', padding: '12px' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Survey'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TakeSurveyPage;
