import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [view, setView] = useState(user ? 'dashboard' : 'login');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setToken('');
    setView('login');
  };

  if (!user) {
    return view === 'login' ?
      <Login onAuth={(u, t) => { setUser(u); setToken(t); setView('dashboard'); }} changeView={setView} /> :
      <Signup changeView={setView} />;
  }

  return (
    <div className="app-container">
      <header className="navbar">
        <h2>StoreRate Platform</h2>
        <div className="nav-actions">
          <span>Welcome, <strong>{user.name}</strong> ({user.role})</span>
          <button onClick={() => setView('password')}>Change Password</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button> 
        </div>
      </header>
      <div className="main-content">
        {view === 'password' && <ChangePassword onBack={() => setView('dashboard')} />}
        {view === 'dashboard' && user.role === 'ADMIN' && <AdminDashboard />}
        {view === 'dashboard' && user.role === 'NORMAL_USER' && <UserDashboard />}
        {view === 'dashboard' && user.role === 'STORE_OWNER' && <OwnerDashboard />}
      </div>
    </div>
  );
}

// --- MODULE: AUTH COMPONENTS ---

function Login({ onAuth, changeView }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user, data.token);
    } catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div className="auth-card">
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Sign In</button>
      </form>
      <p>New user? <span className="link" onClick={() => changeView('signup')}>Register here</span></p> 
    </div>
  );
}

function Signup({ changeView }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [err, setErr] = useState('');
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', form);
      alert('Signup complete! Please log in.');
      changeView('login');
    } catch (e) { setErr(e.response?.data?.message || 'Registration failed'); }
  };
  return (
    <div className="auth-card">
      <h2>Create Account</h2> 
      {err && <p className="error">{err}</p>}
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Name (Min 20 characters)" required onChange={e => setForm({ ...form, name: e.target.value })} /> 
        <input type="email" placeholder="Email Address" required onChange={e => setForm({ ...form, email: e.target.value })} /> 
        <input type="password" placeholder="Password (8-16 chars, Uppercase, Special)" required onChange={e => setForm({ ...form, password: e.target.value })} /> 
        <textarea placeholder="Address (Max 400 characters)" required onChange={e => setForm({ ...form, address: e.target.value })} /> 
        <button type="submit">Register</button>
      </form>
      <p>Have an account? <span className="link" onClick={() => changeView('login')}>Log in</span></p>
    </div>
  );
}

function ChangePassword({ onBack }) {
  const [password, setPassword] = useState('');
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/change-password', { password });
      alert('Password changed successfully!');
      onBack();
    } catch (e) { alert(e.response?.data?.message || 'Error updating password'); }
  };
  return (
    <div className="dashboard-section card">
      <h3>Update Security Password</h3> 
      <form onSubmit={handleUpdate} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="password" placeholder="New Password" required onChange={e => setPassword(e.target.value)} /> 
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">Save Changes</button>
          <button type="button" className="secondary-btn" onClick={onBack}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

// --- MODULE: SYSTEM ADMINISTRATOR DASHBOARD --- 
function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [listings, setListings] = useState({ users: [], stores: [] });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', owner_id: '' });

  const loadAdminData = async () => {
    try {
      const sRes = await API.get('/admin/dashboard'); setStats(sRes.data);
      const lRes = await API.get(`/admin/all-listings?search=${search}&roleFilter=${roleFilter}`); setListings(lRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAdminData(); }, [search, roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try { await API.post('/admin/users', userForm); alert('User created!'); loadAdminData(); } 
        catch (e) { alert(e.response?.data?.message); }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try { await API.post('/admin/stores', storeForm); alert('Store created!'); loadAdminData(); } 
        catch (e) { alert(e.response?.data?.message); }
  };

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card"><h4>Total Users</h4><h2>{stats.totalUsers}</h2></div> 
        <div className="stat-card"><h4>Total Stores</h4><h2>{stats.totalStores}</h2></div> 
        <div className="stat-card"><h4>Submitted Ratings</h4><h2>{stats.totalRatings}</h2></div> 
      </div>

      <div className="grid-2col">
        <div className="card">
          <h3>Add New User Account</h3> 
          <form onSubmit={handleCreateUser} className="vertical-form">
            <input type="text" placeholder="Name" required onChange={e => setUserForm({ ...userForm, name: e.target.value })} /> 
            <input type="email" placeholder="Email" required onChange={e => setUserForm({ ...userForm, email: e.target.value })} /> 
            <input type="password" placeholder="Password" required onChange={e => setUserForm({ ...userForm, password: e.target.value })} /> 
            <input type="text" placeholder="Address" required onChange={e => setUserForm({ ...userForm, address: e.target.value })} /> 
            <select onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
            <button type="submit">Create User</button>
          </form>
        </div>
        <div className="card">
          <h3>Register New Store Profile</h3> 
          <form onSubmit={handleCreateStore} className="vertical-form">
            <input type="text" placeholder="Store Name" required onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
            <input type="email" placeholder="Store Email" required onChange={e => setStoreForm({ ...storeForm, email: e.target.value })} />
            <input type="text" placeholder="Store Address" required onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
            <input type="number" placeholder="Owner User ID (Optional)" onChange={e => setStoreForm({ ...storeForm, owner_id: e.target.value })} />
            <button type="submit">Create Store</button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Platform User Logs & Directory</h3>
        <div className="filters">
          <input type="text" placeholder="Filter directories..." onChange={e => setSearch(e.target.value)} /> 
          <select onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Account Roles</option> 
            <option value="NORMAL_USER">Normal Users</option>
            <option value="STORE_OWNER">Store Owners</option>
            <option value="ADMIN">System Administrators</option>
          </select>
        </div>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Address</th><th>Role</th><th>Store Rating</th></tr>
          </thead>
          <tbody>
            {listings.users.map(u => (
              <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td><td>{u.role === 'STORE_OWNER' ? `${Number(u.store_rating).toFixed(1)} ★` : 'N/A'}</td></tr> 
                        ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Registered Stores Directory</h3> 
        <table>
          <thead><tr><th>Store Name</th><th>Email</th><th>Address</th><th>Aggregate Rating</th></tr></thead>
          <tbody>
            {listings.stores.map((s, i) => (
              <tr key={i}><td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{Number(s.rating).toFixed(1)} ★</td></tr> 
                        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MODULE: NORMAL USER DASHBOARD --- 

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');

  const fetchStores = async () => {
    const { data } = await API.get(`/user/stores?search=${search}`);
    setStores(data);
  };

  useEffect(() => { fetchStores(); }, [search]);

  const submitRating = async (storeId, score) => {
    try {
      await API.post('/user/rate', { store_id: storeId, rating_value: score });
      alert('Rating submitted successfully!');
      fetchStores();
    } catch (e) { alert('Failed submission.'); }
  };

  return (
    <div className="card">
      <h3>Explore Registered Platform Stores</h3> 
      <input type="text" placeholder="Search stores by name or address location..." className="search-bar" onChange={e => setSearch(e.target.value)} /> 
      <div className="store-grid">
        {stores.map(s => (
          <div key={s.id} className="store-item-card">
            <h4>{s.name}</h4> 
            <p className="address-txt">{s.address}</p> 
            <div className="rating-row">
              <span>Community: <strong>{Number(s.overall_rating).toFixed(1)} ★</strong></span> 
              <span>Your Score: <strong>{s.user_rating ? `${s.user_rating} ★` : 'None'}</strong></span> 
            </div>
            <div className="action-row">
              <label>Submit Rating: </label> 
              <select value={s.user_rating || ""} onChange={e => submitRating(s.id, e.target.value)}>
                <option value="" disabled>Select</option>
                {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} ★</option>)} 
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MODULE: STORE OWNER DASHBOARD --- 

function OwnerDashboard() {
  const [data, setData] = useState({ averageRating: '0.0', contributors: [] });
  useEffect(() => {
    API.get('/owner/dashboard')
      .then(res => setData(res.data))
      .catch(() => alert('Could not fetch store owner metric data.'));
  }, []);

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card" style={{ background: '#2e7d32', color: '#fff' }}>
          <h4>Your Store Average Rating</h4>
          <h2>{data.averageRating} / 5.0 ★</h2>
        </div>
      </div>
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Customer Evaluations Breakdown</h3> 
        <table>
          <thead><tr><th>Customer Name</th><th>Email</th><th>Customer Address</th><th>Submitted Score</th></tr></thead>
          <tbody>
            {data.contributors.map((c, i) => (
              <tr key={i}><td>{c.name}</td><td>{c.email}</td><td>{c.address}</td><td><strong>{c.rating_value} ★</strong></td></tr> 
                        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}