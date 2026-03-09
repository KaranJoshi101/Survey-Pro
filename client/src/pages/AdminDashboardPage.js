import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import surveyService from '../services/surveyService';
import responseService from '../services/responseService';
import userService from '../services/userService';
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

const AdminDashboardPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [publishing, setPublishing] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [exporting, setExporting] = useState(null);

    useEffect(() => {
        fetchSurveys();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const response = await userService.getDashboardStats();
                setDashboardStats(response.data);
            } catch (err) {
                console.error('Failed to load dashboard stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const fetchSurveys = async () => {
        try {
            setLoading(true);
            const response = await surveyService.getAllSurveys(1, 100);
            setSurveys(response.data.surveys);
            setError('');
        } catch (err) {
            setError('Failed to load surveys');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (surveyId) => {
        if (window.confirm('Are you sure you want to delete this survey?')) {
            try {
                setDeleting(surveyId);
                await surveyService.deleteSurvey(surveyId);
                setSurveys(surveys.filter((s) => s.id !== surveyId));
            } catch (err) {
                setError('Failed to delete survey');
                console.error(err);
            } finally {
                setDeleting(null);
            }
        }
    };

    const handlePublish = async (surveyId) => {
        try {
            setPublishing(surveyId);
            await surveyService.publishSurvey(surveyId);
            setSurveys(
                surveys.map((s) =>
                    s.id === surveyId ? { ...s, status: 'published' } : s
                )
            );
            setError('');
        } catch (err) {
            setError('Failed to publish survey');
            console.error(err);
        } finally {
            setPublishing(null);
        }
    };

    const handleUnpublish = async (surveyId) => {
        try {
            setPublishing(surveyId);
            await surveyService.unpublishSurvey(surveyId);
            setSurveys(
                surveys.map((s) =>
                    s.id === surveyId ? { ...s, status: 'draft' } : s
                )
            );
            setError('');
        } catch (err) {
            setError('Failed to unpublish survey');
            console.error(err);
        } finally {
            setPublishing(null);
        }
    };

    const handleExportExcel = async (survey) => {
        setExporting(survey.id);
        try {
            const response = await responseService.exportSurveyResponses(survey.id);
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${survey.title.replace(/[^a-zA-Z0-9 ]/g, '')}-responses.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to export responses');
            console.error(err);
        } finally {
            setExporting(null);
        }
    };

    // Chart data
    const barChartData = dashboardStats ? {
        labels: dashboardStats.responses_per_survey.map((s) =>
            s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title
        ),
        datasets: [{
            label: 'Number of Responses',
            data: dashboardStats.responses_per_survey.map((s) => s.response_count),
            backgroundColor: 'rgba(0, 53, 148, 0.6)',
            borderColor: 'rgba(0, 53, 148, 1)',
            borderWidth: 1,
        }],
    } : null;

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Responses Per Survey' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
            },
        },
    };

    const doughnutChartData = dashboardStats ? {
        labels: dashboardStats.survey_status_distribution.map((s) =>
            s.status.charAt(0).toUpperCase() + s.status.slice(1)
        ),
        datasets: [{
            data: dashboardStats.survey_status_distribution.map((s) => s.count),
            backgroundColor: ['#FFB81C', '#27ae60', '#6c757d'],
            borderWidth: 2,
        }],
    } : null;

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Survey Status Distribution' },
        },
    };

    if (loading) {
        return <LoadingSpinner fullScreen={false} />;
    }

    return (
        <div className="container mt-4">
            <div className="flex justify-between align-center mb-4">
                <h1>Admin Dashboard</h1>
                <Link to="/admin/surveys/create" className="btn btn-success">
                    + Create Survey
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Summary Stats */}
            {!statsLoading && dashboardStats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#e8f0fe', borderRadius: '4px', borderLeft: '4px solid #003594' }}>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Users</p>
                        <h2 style={{ margin: '8px 0 0 0', color: '#003594' }}>{dashboardStats.summary.total_users}</h2>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#e8f8f0', borderRadius: '4px', borderLeft: '4px solid #27ae60' }}>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Surveys</p>
                        <h2 style={{ margin: '8px 0 0 0', color: '#27ae60' }}>{dashboardStats.summary.total_surveys}</h2>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#fff8e1', borderRadius: '4px', borderLeft: '4px solid #FFB81C' }}>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Total Responses</p>
                        <h2 style={{ margin: '8px 0 0 0', color: '#b8860b' }}>{dashboardStats.summary.total_responses}</h2>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#fde8e8', borderRadius: '4px', borderLeft: '4px solid #c0392b' }}>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Banned Users</p>
                        <h2 style={{ margin: '8px 0 0 0', color: '#c0392b' }}>{dashboardStats.summary.banned_users}</h2>
                    </div>
                </div>
            )}

            {/* Charts */}
            {!statsLoading && dashboardStats && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                    <div className="card">
                        <div className="card-body">
                            <h2>Responses Per Survey</h2>
                            {barChartData && barChartData.labels.length > 0 ? (
                                <Bar data={barChartData} options={barChartOptions} />
                            ) : (
                                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                                    No survey data available yet
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <h2>Survey Status</h2>
                            {doughnutChartData && doughnutChartData.labels.length > 0 ? (
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            ) : (
                                <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                                    No surveys created yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '32px' }}>
                <h2>Survey Management</h2>
                {surveys.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#666' }}>No surveys created yet</p>
                    </div>
                ) : (
                    <table className="card">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Questions</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.map((survey) => (
                                <tr key={survey.id}>
                                    <td style={{ padding: '12px' }}>
                                        <strong>{survey.title}</strong>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span
                                            style={{
                                                backgroundColor: survey.status === 'published' ? '#e8f8f0' : '#fff8e1',
                                                color: survey.status === 'published' ? '#1a6e42' : '#8a6d00',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.85rem',
                                            }}
                                        >
                                            {survey.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        N/A
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                                        {new Date(survey.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <Link
                                            to={`/admin/surveys/${survey.id}/edit`}
                                            className="btn btn-primary"
                                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px' }}
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            to={`/admin/surveys/${survey.id}/analytics`}
                                            className="btn btn-primary"
                                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px', backgroundColor: '#2980b9', borderColor: '#2980b9' }}
                                        >
                                            Analytics
                                        </Link>
                                        <button
                                            onClick={() => handleExportExcel(survey)}
                                            className="btn btn-secondary"
                                            disabled={exporting === survey.id}
                                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px' }}
                                        >
                                            {exporting === survey.id ? 'Exporting...' : 'Export'}
                                        </button>
                                        {survey.status === 'draft' ? (
                                            <button
                                                onClick={() => handlePublish(survey.id)}
                                                className="btn btn-success"
                                                disabled={publishing === survey.id}
                                                style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px' }}
                                            >
                                                {publishing === survey.id ? 'Publishing...' : 'Publish'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUnpublish(survey.id)}
                                                className="btn btn-warning"
                                                disabled={publishing === survey.id}
                                                style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: '4px' }}
                                            >
                                                {publishing === survey.id ? 'Unpublishing...' : 'Unpublish'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(survey.id)}
                                            className="btn btn-danger"
                                            disabled={deleting === survey.id}
                                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                                        >
                                            {deleting === survey.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card">
                <div className="card-body">
                    <h2>Quick Links</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '12px' }}>
                            <Link to="/admin/users" style={{ color: '#003594', textDecoration: 'none' }}>
                                → Manage Users
                            </Link>
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <Link to="/admin/articles" style={{ color: '#003594', textDecoration: 'none' }}>
                                → Manage Articles
                            </Link>
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <Link to="/admin/responses" style={{ color: '#003594', textDecoration: 'none' }}>
                                → View Responses & Analytics
                            </Link>
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <Link to="/surveys" style={{ color: '#003594', textDecoration: 'none' }}>
                                → View Published Surveys
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
