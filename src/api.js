function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (username, password) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  changePassword: (currentPassword, newPassword) =>
    request('/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),

  getTickets: () => request('/tickets'),

  sellTickets: (ticketIds, customerId) =>
    request('/tickets', { method: 'POST', body: JSON.stringify({ ticketIds, customerId }) }),

  getCustomers: () => request('/customers'),

  addCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),

  getUsers: () => request('/admin/users'),

  createUser: (username, password, role) =>
    request('/admin/create-user', { method: 'POST', body: JSON.stringify({ username, password, role }) }),

  resetPassword: (targetUsername, newPassword) =>
    request('/admin/reset-password', { method: 'POST', body: JSON.stringify({ targetUsername, newPassword }) })
};
