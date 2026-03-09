import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import responseService from '../services/responseService';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const CHART_COLORS = ['#003594', '#27ae60', '#FFB81C', '#c0392b', '#2980b9', '#8e44ad', '#e67e22', '#6c757d'];

const SurveyAnalyticsPage = () => {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [demographics, setDemographics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const [analyticsRes, demographicsRes] = await Promise.all([
                responseService.getSurveyAnalytics(id),
                responseService.getSurveyDemographics(id),
            ]);
            setAnalytics(analyticsRes.data);
            setDemographics(demographicsRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const renderChoiceQuestion = (question) => {
        const barData = {
            labels: question.option_counts.map(o => o.option_text),
            datasets: [{
                label: 'Responses',
                data: question.option_counts.map(o => o.count),
                backgroundColor: 'rgba(0, 53, 148, 0.6)',
                borderColor: 'rgba(0, 53, 148, 1)',
                borderWidth: 1,
            }],
        };

        const barOptions = {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
        };

        const doughnutData = {
            labels: question.option_counts.map(o => o.option_text),
            datasets: [{
                data: question.option_counts.map(o => o.count),
                backgroundColor: CHART_COLORS.slice(0, question.option_counts.length),
                borderWidth: 2,
            }],
        };

        const doughnutOptions = {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
            },
        };

        return (
            <div className="card" style={{ marginBottom: '24px' }} key={question.id}>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>{question.question_text}</h3>
                        <span style={{
                            backgroundColor: question.question_type === 'multiple_choice' ? '#e8f0fe' : '#e8f8f0',
                            color: question.question_type === 'multiple_choice' ? '#003594' : '#1a6e42',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                        }}>
                            {question.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Checkbox'} | {question.total_answered} responses
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px', alignItems: 'center' }}>
                        <div><Bar data={barData} options={barOptions} /></div>
                        <div><Doughnut data={doughnutData} options={doughnutOptions} /></div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        {question.option_counts.map((opt, idx) => (
                            <div key={opt.option_id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 12px', borderBottom: idx < question.option_counts.length - 1 ? '1px solid #eee' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '12px', height: '12px', borderRadius: '2px',
                                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                                    }} />
                                    <span>{opt.option_text}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '100px', height: '8px', backgroundColor: '#E8E9EE', borderRadius: '4px', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${opt.percentage}%`, height: '100%',
                                            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: '4px',
                                        }} />
                                    </div>
                                    <span style={{ color: '#666', fontSize: '0.9rem', minWidth: '80px', textAlign: 'right' }}>
                                        {opt.count} ({opt.percentage}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderRatingQuestion = (question) => {
        const barData = {
            labels: question.rating_distribution.map(d => `${d.rating} Star${d.rating > 1 ? 's' : ''}`),
            datasets: [{
                label: 'Responses',
                data: question.rating_distribution.map(d => d.count),
                backgroundColor: [
                    'rgba(220, 53, 69, 0.6)',
                    'rgba(253, 126, 20, 0.6)',
                    'rgba(255, 193, 7, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(0, 53, 148, 0.6)',
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(253, 126, 20, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(0, 53, 148, 1)',
                ],
                borderWidth: 1,
            }],
        };

        const barOptions = {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
        };

        return (
            <div className="card" style={{ marginBottom: '24px' }} key={question.id}>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>{question.question_text}</h3>
                        <span style={{
                            backgroundColor: '#fff8e1', color: '#8a6d00',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                        }}>
                            Rating | {question.total_answered} responses
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
                        <div><Bar data={barData} options={barOptions} /></div>
                        <div style={{
                            padding: '24px 32px', textAlign: 'center',
                            backgroundColor: '#e8f0fe', borderRadius: '8px', minWidth: '140px',
                        }}>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Average Rating</p>
                            <h2 style={{ margin: '8px 0 0 0', color: '#003594', fontSize: '2.5rem' }}>
                                {question.average_rating}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', color: '#999', fontSize: '0.8rem' }}>out of 5</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        {question.rating_distribution.map((d, idx) => {
                            const totalAnswered = question.total_answered || 1;
                            const percentage = Math.round((d.count / totalAnswered) * 100);
                            const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#003594'];
                            return (
                                <div key={d.rating} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '6px 0',
                                }}>
                                    <span style={{ minWidth: '55px', fontSize: '0.9rem', color: '#555' }}>{d.rating} Star{d.rating > 1 ? 's' : ''}</span>
                                    <div style={{
                                        flex: 1, height: '10px', backgroundColor: '#E8E9EE', borderRadius: '5px', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`, height: '100%',
                                            backgroundColor: colors[idx], borderRadius: '5px',
                                        }} />
                                    </div>
                                    <span style={{ minWidth: '70px', textAlign: 'right', fontSize: '0.85rem', color: '#666' }}>
                                        {d.count} ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderTextQuestion = (question) => {
        return (
            <div className="card" style={{ marginBottom: '24px' }} key={question.id}>
                <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>{question.question_text}</h3>
                        <span style={{
                            backgroundColor: '#f3e5f5', color: '#8e44ad',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                        }}>
                            Text | {question.total_answered} responses
                        </span>
                    </div>
                    {question.text_responses.length === 0 ? (
                        <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>
                            No text responses yet
                        </p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {question.text_responses.map((resp, idx) => (
                                <div key={idx} style={{
                                    padding: '12px 16px', marginBottom: '8px',
                                    backgroundColor: '#f8f9fa', borderRadius: '4px',
                                    borderLeft: '3px solid #8e44ad',
                                }}>
                                    <p style={{ margin: 0, lineHeight: '1.5' }}>"{resp.answer_text}"</p>
                                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#999' }}>
                                        — {resp.user_name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <LoadingSpinner fullScreen={false} />;
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <Link to="/admin" className="btn btn-primary">Back to Admin</Link>
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0 }}>Analytics: {analytics.survey_title}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/admin/responses" className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        View Responses
                    </Link>
                    <Link to="/admin" className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        Back to Admin
                    </Link>
                </div>
            </div>

            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                    padding: '16px', backgroundColor: '#e8f0fe',
                    borderRadius: '4px', borderLeft: '4px solid #003594',
                }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Responses</p>
                    <h2 style={{ margin: '8px 0 0 0', color: '#003594' }}>{analytics.total_responses}</h2>
                </div>
                <div style={{
                    padding: '16px', backgroundColor: '#e8f8f0',
                    borderRadius: '4px', borderLeft: '4px solid #27ae60',
                }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Unique Users</p>
                    <h2 style={{ margin: '8px 0 0 0', color: '#27ae60' }}>{analytics.unique_users}</h2>
                </div>
                <div style={{
                    padding: '16px', backgroundColor: '#fff8e1',
                    borderRadius: '4px', borderLeft: '4px solid #FFB81C',
                }}>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Questions</p>
                    <h2 style={{ margin: '8px 0 0 0', color: '#b8860b' }}>{analytics.analytics.length}</h2>
                </div>
            </div>

            {/* Respondent Demographics */}
            {demographics && (demographics.gender_distribution.length > 0 || demographics.age_distribution.length > 0 || demographics.location_distribution.length > 0) && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ color: '#003594', marginBottom: '16px' }}>Respondent Demographics</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {/* Gender Distribution */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Gender Distribution</h3>
                                {demographics.gender_distribution.length > 0 ? (
                                    <Doughnut
                                        data={{
                                            labels: demographics.gender_distribution.map(d => d.gender),
                                            datasets: [{
                                                data: demographics.gender_distribution.map(d => d.count),
                                                backgroundColor: CHART_COLORS.slice(0, demographics.gender_distribution.length),
                                                borderWidth: 2,
                                            }],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No data</p>
                                )}
                            </div>
                        </div>

                        {/* Age Distribution */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Age Distribution</h3>
                                {demographics.age_distribution.length > 0 ? (
                                    <Bar
                                        data={{
                                            labels: demographics.age_distribution.map(d => d.age_group),
                                            datasets: [{
                                                label: 'Respondents',
                                                data: demographics.age_distribution.map(d => d.count),
                                                backgroundColor: 'rgba(0, 53, 148, 0.6)',
                                                borderColor: 'rgba(0, 53, 148, 1)',
                                                borderWidth: 1,
                                            }],
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No data</p>
                                )}
                            </div>
                        </div>

                        {/* Location Distribution */}
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Top Locations</h3>
                                {demographics.location_distribution.length > 0 ? (
                                    <Bar
                                        data={{
                                            labels: demographics.location_distribution.map(d => d.location),
                                            datasets: [{
                                                label: 'Respondents',
                                                data: demographics.location_distribution.map(d => d.count),
                                                backgroundColor: 'rgba(39, 174, 96, 0.6)',
                                                borderColor: 'rgba(39, 174, 96, 1)',
                                                borderWidth: 1,
                                            }],
                                        }}
                                        options={{
                                            indexAxis: 'y',
                                            responsive: true,
                                            plugins: { legend: { display: false } },
                                            scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                                        }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', textAlign: 'center', padding: '24px' }}>No data</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Per-Question Analytics */}
            {analytics.analytics.length === 0 ? (
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>
                            No questions found for this survey
                        </p>
                    </div>
                </div>
            ) : (
                analytics.analytics.map((question, index) => (
                    <div key={question.id}>
                        <h3 style={{ color: '#555', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Question {index + 1}
                        </h3>
                        {(question.question_type === 'multiple_choice' || question.question_type === 'checkbox')
                            && renderChoiceQuestion(question)}
                        {question.question_type === 'rating' && renderRatingQuestion(question)}
                        {question.question_type === 'text' && renderTextQuestion(question)}
                    </div>
                ))
            )}
        </div>
    );
};

export default SurveyAnalyticsPage;
