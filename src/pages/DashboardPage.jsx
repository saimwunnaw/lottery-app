import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const isAdmin = role === 'admin';

  const [tab, setTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [customerId, setCustomerId] = useState('');
  const [msg, setMsg] = useState('');

  function logout() {
    localStorage.clear();
    navigate('/');
  }

  async function refreshTickets() {
    try { setTickets(await api.getTickets()); } catch {}
  }
  async function refreshCustomers() {
    try { setCustomers(await api.getCustomers()); } catch {}
  }
  async function refreshUsers() {
    if (!isAdmin) return;
    try { setUsers(await api.getUsers()); } catch {}
  }

  useEffect(() => {
    refreshTickets();
    refreshCustomers();
    refreshUsers();
  }, []);

  const available = tickets.filter((t) => t.status === 'available');
  const soldTickets = tickets.filter((t) => t.status === 'sold');

  function toggleTicket(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function markSold() {
    if (selected.size === 0) return;
    setMsg('');
    try {
      await api.sellTickets([...selected], customerId ? Number(customerId) : null);
      setSelected(new Set());
      setCustomerId('');
      await refreshTickets();
      setMsg('Marked sold.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="sheet">
      <div className="top-bar">
        <div>
          <div style={{ fontWeight: 700 }}>{username}</div>
          <div className="who">{isAdmin ? 'Admin' : 'User'}</div>
        </div>
        <button className="btn btn-secondary" onClick={logout}>Log out</button>
      </div>

      <div className="tabs">
        <button className={'tab' + (tab === 'tickets' ? ' active' : '')} onClick={() => setTab('tickets')}>Tickets</button>
        <button className={'tab' + (tab === 'sold' ? ' active' : '')} onClick={() => setTab('sold')}>Sold</button>
        <button className={'tab' + (tab === 'customers' ? ' active' : '')} onClick={() => setTab('customers')}>Customers</button>
        {isAdmin && <button className={'tab' + (tab === 'users' ? ' active' : '')} onClick={() => setTab('users')}>Users</button>}
        <button className={'tab' + (tab === 'account' ? ' active' : '')} onClick={() => setTab('account')}>Account</button>
      </div>

      {tab === 'tickets' && (
        <TicketsTab
          available={available}
          selected={selected}
          toggleTicket={toggleTicket}
          customers={customers}
          customerId={customerId}
          setCustomerId={setCustomerId}
          markSold={markSold}
          msg={msg}
        />
      )}

      {tab === 'sold' && <SoldTab soldTickets={soldTickets} />}

      {tab === 'customers' && (
        <CustomersTab customers={customers} onAdded={refreshCustomers} />
      )}

      {tab === 'users' && isAdmin && (
        <UsersTab users={users} onChanged={refreshUsers} />
      )}

      {tab === 'account' && <AccountTab />}
    </div>
  );
}

function TicketsTab({ available, selected, toggleTicket, customers, customerId, setCustomerId, markSold, msg }) {
  const pair = available.filter((t) => t.tier === 'pair');
  const single = available.filter((t) => t.tier === 'single');
  return (
    <div>
      <div className="section">
        <div className="section-head"><div className="dot pair" /><div className="section-title">Paired ({pair.length})</div></div>
        <div className="numbers">
          {pair.map((t) => (
            <div key={t.id} className={'num pair' + (selected.has(t.id) ? ' selected' : '')} onClick={() => toggleTicket(t.id)}>
              {t.number}
            </div>
          ))}
        </div>
      </div>
      <div className="section">
        <div className="section-head"><div className="dot single" /><div className="section-title">Single ({single.length})</div></div>
        <div className="numbers">
          {single.map((t) => (
            <div key={t.id} className={'num' + (selected.has(t.id) ? ' selected' : '')} onClick={() => toggleTicket(t.id)}>
              {t.number}
            </div>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="field-row">
            <label>Attach customer (optional)</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">— none —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={markSold}>Mark {selected.size} ticket(s) sold</button>
          {msg && <div style={{ marginTop: 8, fontSize: 13 }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}

function SoldTab({ soldTickets }) {
  return (
    <div>
      {soldTickets.length === 0 && <div className="overlay-empty">No sold tickets yet.</div>}
      {soldTickets.map((t) => (
        <div key={t.id} className="list-row">
          <span>{t.number} <span className="meta">({t.tier})</span></span>
          <span className="meta">{t.customer_name || '—'}</span>
        </div>
      ))}
    </div>
  );
}

function CustomersTab({ customers, onAdded }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.addCustomer({ name, phone, notes });
      setName(''); setPhone(''); setNotes('');
      onAdded();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div>
      <form onSubmit={submit} style={{ marginBottom: 20 }}>
        <div className="field-row">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field-row">
          <label>Phone (optional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field-row">
          <label>Notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {msg && <div className="error-text">{msg}</div>}
        <button className="btn" type="submit">Add customer</button>
      </form>

      {customers.map((c) => (
        <div key={c.id} className="list-row">
          <span>{c.name}</span>
          <span className="meta">{c.phone || ''}</span>
        </div>
      ))}
    </div>
  );
}

function UsersTab({ users, onChanged }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [msg, setMsg] = useState('');

  const [resetUser, setResetUser] = useState('');
  const [resetPass, setResetPass] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  async function createUser(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.createUser(username, password, role);
      setUsername(''); setPassword(''); setRole('user');
      onChanged();
      setMsg('User created.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function masterReset(e) {
    e.preventDefault();
    setResetMsg('');
    try {
      await api.resetPassword(resetUser, resetPass);
      setResetPass('');
      setResetMsg('Password reset for ' + resetUser);
    } catch (err) {
      setResetMsg(err.message);
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 15 }}>Create user</h3>
      <form onSubmit={createUser} style={{ marginBottom: 24 }}>
        <div className="field-row">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="field-row">
          <label>Temporary password</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="field-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {msg && <div style={{ fontSize: 13 }}>{msg}</div>}
        <button className="btn" type="submit">Create user</button>
      </form>

      <h3 style={{ fontSize: 15 }}>Master reset a password</h3>
      <form onSubmit={masterReset} style={{ marginBottom: 24 }}>
        <div className="field-row">
          <label>Username</label>
          <select value={resetUser} onChange={(e) => setResetUser(e.target.value)}>
            <option value="">— select —</option>
            {users.map((u) => (
              <option key={u.id} value={u.username}>{u.username} ({u.role})</option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <label>New password</label>
          <input type="text" value={resetPass} onChange={(e) => setResetPass(e.target.value)} required />
        </div>
        {resetMsg && <div style={{ fontSize: 13 }}>{resetMsg}</div>}
        <button className="btn" type="submit">Reset password</button>
      </form>

      <h3 style={{ fontSize: 15 }}>All users</h3>
      {users.map((u) => (
        <div key={u.id} className="list-row">
          <span>{u.username}</span>
          <span className="meta">{u.role}</span>
        </div>
      ))}
    </div>
  );
}

function AccountTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword('');
      setMsg('Password changed.');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: 15 }}>Change your password</h3>
      <form onSubmit={submit}>
        <div className="field-row">
          <label>Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="field-row">
          <label>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        {msg && <div style={{ fontSize: 13 }}>{msg}</div>}
        <button className="btn" type="submit">Change password</button>
      </form>
    </div>
  );
}
