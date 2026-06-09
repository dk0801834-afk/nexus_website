from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
import sqlite3
from datetime import datetime
import hashlib
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)  # Session security key

# Database configuration
DATABASE = 'contact_database.db'

def get_db_connection():
    """Create database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create contacts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            phone TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'new'
        )
    ''')
    
    # Create users table for authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT,
            name TEXT NOT NULL,
            avatar_url TEXT,
            provider TEXT DEFAULT 'email',
            provider_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    # Create subscriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verify password against hash"""
    return hashlib.sha256(password.encode()).hexdigest() == password_hash

@app.route('/')
def home():
    # Check if user is logged in
    user = None
    if 'user_id' in session:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
        user = cursor.fetchone()
        conn.close()
    
    return render_template('index.html', user=user)

# ========================================
# Authentication Routes
# ========================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Handle user registration"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Validation
    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400
    
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email is required'}), 400
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered. Please sign in.'}), 400
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, provider)
            VALUES (?, ?, ?, 'email')
        ''', (name, email, password_hash))
        
        conn.commit()
        user_id = cursor.lastrowid
        
        # Auto login after signup
        session['user_id'] = user_id
        session['user_name'] = name
        session['user_email'] = email
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully!',
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            }
        })
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'success': False, 'message': 'Failed to create account. Please try again.'}), 500

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    """Handle user login"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Validation
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email is required'}), 400
    
    if not password:
        return jsonify({'success': False, 'message': 'Password is required'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find user
        # Find user (provider must be 'email' for password-based login)
        cursor.execute("SELECT * FROM users WHERE email = ? AND provider = 'email'", (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'No account found with this email. Please sign up.'}), 400
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            conn.close()
            return jsonify({'success': False, 'message': 'Incorrect password. Please try again.'}), 400
        
        # Update last login
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user['id'],))
        conn.commit()
        
        # Set session
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Welcome back!',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }
        })
    except Exception as e:
        print(f"Signin error: {e}")
        return jsonify({'success': False, 'message': 'Login failed. Please try again.'}), 500

@app.route('/api/auth/social', methods=['POST'])
def social_login():
    """Handle social login (Google, GitHub, Facebook)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    provider = data.get('provider', '').strip().lower()
    email = data.get('email', '').strip()
    name = data.get('name', '').strip()
    provider_id = data.get('provider_id', '')
    avatar_url = data.get('avatar_url', '')
    
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email is required'}), 400
    
    if provider not in ['google', 'github', 'facebook']:
        return jsonify({'success': False, 'message': 'Invalid provider'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists with this email
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user:
            # Update provider info if different
            if user['provider'] != provider:
                cursor.execute('''
                    UPDATE users SET provider = ?, provider_id = ?, last_login = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (provider, provider_id, user['id']))
            else:
                cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user['id'],))
            
            conn.commit()
        else:
            # Create new user
            cursor.execute('''
                INSERT INTO users (name, email, provider, provider_id, avatar_url)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, email, provider, provider_id, avatar_url))
            
            conn.commit()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
        
        # Set session
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Successfully signed in with {provider.title()}!',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'avatar_url': user['avatar_url']
            }
        })
    except Exception as e:
        print(f"Social login error: {e}")
        return jsonify({'success': False, 'message': 'Login failed. Please try again.'}), 500

@app.route('/api/auth/signout', methods=['POST'])
def signout():
    """Handle user logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Signed out successfully'})

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    """Check if user is logged in"""
    if 'user_id' in session:
        return jsonify({
            'success': True,
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'email': session['user_email']
            }
        })
    return jsonify({'success': True, 'authenticated': False})

# ========================================
# Contact Routes
# ========================================

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    company = data.get('company', '').strip()
    phone = data.get('phone', '').strip()
    message = data.get('message', '').strip()
    
    # Validation
    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400
    
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email is required'}), 400
    
    if not message:
        return jsonify({'success': False, 'message': 'Message is required'}), 400
    
    # Save to database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO contacts (name, email, company, phone, message)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, email, company, phone, message))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Thank you for reaching out! We\'ll get back to you within 24 hours.'
        })
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'success': False, 'message': 'Failed to save your message. Please try again.'}), 500

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """Newsletter subscription endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    email = data.get('email', '').strip()
    
    if '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email is required'}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO subscriptions (email) VALUES (?)
        ''', (email,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Successfully subscribed to our newsletter!'
        })
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already subscribed!'}), 400
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'success': False, 'message': 'Failed to subscribe. Please try again.'}), 500

# Initialize database on startup
init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)