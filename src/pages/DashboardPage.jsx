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
        {isAdmin && <button className={'tab' + (tab === 'addtickets' ? ' active' : '')} onClick={() => setTab('addtickets')}>Add Tickets</button>}
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

      {tab === 'addtickets' && isAdmin && (
        <AddTicketsTab onAdded={refreshTickets} />
      )}

      {tab === 'account' && <AccountTab />}
    </div>
  );
}

function TicketsTab({ available, selected, toggleTicket, customers, customerId, setCustomerId, markSold, msg }) {
  const triple = available.filter((t) => t.tier === 'triple');
  const pair = available.filter((t) => t.tier === 'pair');
  const single = available.filter((t) => t.tier === 'single');
  const tiers = [
    { key: 'triple', label: 'Triple', dot: 'triple', list: triple },
    { key: 'pair', label: 'Paired', dot: 'pair', list: pair },
    { key: 'single', label: 'Single', dot: 'single', list: single }
  ];
  return (
    <div>
      {tiers.map((tr) => (
        <div className="section" key={tr.key}>
          <div className="section-head"><div className={'dot ' + tr.dot} /><div className="section-title">{tr.label} ({tr.list.length})</div></div>
          <div className="numbers">
            {tr.list.map((t) => (
              <div key={t.id} className={'num ' + tr.key + (selected.has(t.id) ? ' selected' : '')} onClick={() => toggleTicket(t.id)}>
                {t.number}
              </div>
            ))}
          </div>
        </div>
      ))}

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

function AddTicketsTab({ onAdded }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState('');
  const [tier, setTier] = useState('single');
  const [msg, setMsg] = useState('');
  const [result, setResult] = useState(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setScanning(true);
    setMsg('');
    setResult(null);
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(file, 'eng', {
        tessedit_char_whitelist: '0123456789'
      });
      // Pull out anything that looks like a run of digits; admin will clean up below
      const found = (data.text.match(/\d+/g) || []).join('\n');
      setRawText(found);
    } catch (err) {
      setMsg('Scan failed — you can still type numbers in manually below.');
    } finally {
      setScanning(false);
    }
  }

  function parseNumbers() {
    // Split on any non-digit, keep runs that are exactly 6 digits
    return [...new Set((rawText.match(/\d{6}/g) || []))];
  }

  async function submit() {
    const numbers = parseNumbers();
    if (numbers.length === 0) {
      setMsg('No valid 6-digit numbers found in the text box.');
      return;
    }
    setMsg('');
    try {
      const res = await api.addTickets(numbers, tier);
      setResult(res);
      setMsg(`Added ${res.added} ticket(s)${res.skipped ? `, skipped ${res.skipped} duplicate(s)` : ''}.`);
      setRawText('');
      setImagePreview(null);
      onAdded();
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div>
      <div className="field-row">
        <label>Photo of tickets</label>
        <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
      </div>

      {imagePreview && (
        <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: 10, marginBottom: 12 }} />
      )}

      {scanning && <div style={{ fontSize: 13, color: '#8a8f98', marginBottom: 12 }}>Scanning photo…</div>}

      <div className="field-row">
        <label>Tier for this batch</label>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="single">Single — 6,000,000 THB</option>
          <option value="pair">Pair — 12,000,000 THB</option>
          <option value="triple">Triple — 18,000,000 THB</option>
        </select>
      </div>

      <div className="field-row">
        <label>Detected numbers — review and fix before adding (one per line, 6 digits each)</label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={8}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e2e0', fontFamily: 'monospace', fontSize: 14 }}
        />
      </div>

      <div style={{ fontSize: 12, color: '#8a8f98', marginBottom: 12 }}>
        OCR on this ticket font isn't perfect — double-check every number against the photo before adding.
      </div>

      <button className="btn" onClick={submit}>Add {parseNumbers().length} ticket(s)</button>
      {msg && <div style={{ marginTop: 10, fontSize: 13 }}>{msg}</div>}
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
