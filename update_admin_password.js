const pool = require('./server/config/database');
require('dotenv').config();

const updatePassword = async () => {
    try {
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, role',
            ['$2a$10$S9cRWL3rZ6MrvmE1FmXb2eGv1EDjEMJ86aAtHaGVaF98OJ0pcXCSq', 'admin@surveyapp.com']
        );
        
        if (result.rows.length > 0) {
            console.log('✅ Admin password updated successfully');
            console.log('Email:', result.rows[0].email);
            console.log('Role:', result.rows[0].role);
            console.log('\nYou can now login with:');
            console.log('Email: admin@surveyapp.com');
            console.log('Password: admin123');
        } else {
            console.log('❌ Admin user not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating password:', err.message);
        process.exit(1);
    }
};

updatePassword();
