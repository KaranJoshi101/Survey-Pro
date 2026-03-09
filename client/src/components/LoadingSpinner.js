import React from 'react';

const LoadingSpinner = ({ fullScreen = true }) => {
    const style = fullScreen
        ? {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#E8E9EE',
        }
        : {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
        };

    return (
        <div style={style}>
            <div style={{ textAlign: 'center' }}>
                <div className="loading"></div>
                <p style={{ marginTop: '20px', color: '#003594' }}>Loading...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
