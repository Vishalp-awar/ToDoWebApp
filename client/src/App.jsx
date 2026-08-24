import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const statuses = ['pending', 'working', 'done'];
const statusLabels = { pending: 'Pending', working: 'Working', done: 'Done' };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const pendingCount = todos.filter((todo) => todo.status === 'pending').length;
  const workingCount = todos.filter((todo) => todo.status === 'working').length;
  const doneCount = todos.filter((todo) => todo.status === 'done').length;

  const loadTodos = useCallback(async () => {
    try {
      setError('');
      setIsLoading(true);
      setTodos(await request('/todos'));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  async function createTodo(event) {
    event.preventDefault();
    if (!title.trim()) return;
    try {
      setIsSaving(true);
      setError('');
      const todo = await request('/todos', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), description: description.trim() })
      });
      setTodos((current) => [todo, ...current]);
      setTitle('');
      setDescription('');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      setError('');
      const updated = await request(`/todos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      setTodos((current) => current.map((todo) => todo._id === id ? updated : todo));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <div className="app-shell min-vh-100">
      <nav className="navbar navbar-expand-md app-navbar">
        <div className="container">
          <a className="navbar-brand brand-mark" href="#top" aria-label="TaskFlow home"><span>✦</span> taskflow</a>
          <button className="navbar-toggler border-0 p-0" type="button" data-bs-toggle="collapse" data-bs-target="#main-navigation" aria-controls="main-navigation" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon" /></button>
          <div className="collapse navbar-collapse" id="main-navigation">
            <div className="navbar-nav ms-auto align-items-md-center gap-md-4">
              <a className="nav-link active" href="#tasks">My tasks</a>
              <a className="nav-link" href="#create">Create task</a>
              <a className="nav-link" href="#create">Upcoming feature</a>
              <span className="nav-status"><i /> All systems clear</span>
            </div>
          </div>
        </div>
      </nav>

      <main id="top" className="py-4 py-lg-5">
      <div className="container">
        <header className="hero-panel mb-4 mb-lg-5">
          <div className="hero-copy">
            <p className="eyebrow mb-3">TODAY’S FOCUS <span>—</span> {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
            <h1>Make space for<br /><em>meaningful work.</em></h1>
            <p className="hero-description mb-0">A calm, considered place to capture what matters and move it towards done.</p>
          </div>
          <div className="hero-orb" aria-hidden="true"><span>✦</span><small>FOCUS<br />MODE</small></div>
        </header>
        <section className="stats-grid mb-4 mb-lg-5" aria-label="Task summary">
          <div className="stat-card"><span className="stat-label">Total tasks</span><strong>{todos.length}</strong><small>in your workspace</small></div>
          <div className="stat-card amber"><span className="stat-label">In progress</span><strong>{workingCount}</strong><small>currently moving</small></div>
          <div className="stat-card green"><span className="stat-label">Completed</span><strong>{doneCount}</strong><small>{todos.length ? `${Math.round((doneCount / todos.length) * 100)}% completion` : 'ready when you are'}</small></div>
        </section>
        <div className="row g-4">
          <section className="col-lg-4" id="create">
            <div className="card border-0 form-card"><div className="card-body p-4 p-xl-4">
              <span className="section-kicker">01 / CAPTURE</span>
              <h2 className="form-heading">Start with a<br /><em>small step.</em></h2>
              <form onSubmit={createTodo}>
                <label htmlFor="title" className="form-label fw-medium">Task title</label>
                <input id="title" className="form-control mb-3" value={title} onChange={(event) => setTitle(event.target.value)} maxLength="120" placeholder="e.g. Plan next sprint" required />
                <label htmlFor="description" className="form-label fw-medium">Description <span className="text-secondary fw-normal">(optional)</span></label>
                <textarea id="description" className="form-control mb-4" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} maxLength="500" placeholder="Add helpful details" />
                <button className="btn create-button w-100" disabled={isSaving}>{isSaving ? 'Adding task…' : <><span>+</span> Add to my list</>}</button>
              </form>
            </div></div>
          </section>
          <section className="col-lg-8" id="tasks">
            <div className="task-section-heading">
              <div><span className="section-kicker">02 / MOVE FORWARD</span><h2>Your open <em>canvas.</em></h2></div>
              <button className="refresh-button" onClick={loadTodos} aria-label="Refresh tasks"><span>↻</span> Refresh</button>
            </div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {isLoading ? <p className="text-secondary">Loading tasks…</p> : todos.length === 0 ? (
              <div className="empty-state text-center p-5 rounded-4"><span>✦</span><p className="mb-1">Your canvas is clear.</p><small>Add a thoughtful first task to begin.</small></div>
            ) : <div className="row g-3">{todos.map((todo) => (
              <div className="col-md-6" key={todo._id}><article className={`card h-100 border-0 task-card status-${todo.status}`}><div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between gap-3 mb-3"><span className="task-number">{String(todos.indexOf(todo) + 1).padStart(2, '0')}</span><span className={`badge status-badge ${todo.status}`}>{statusLabels[todo.status]}</span></div>
                <h3 className="task-title">{todo.title}</h3>
                {todo.description && <p className="task-description flex-grow-1">{todo.description}</p>}
                <label className="form-label small fw-semibold mt-auto" htmlFor={`status-${todo._id}`}>Update status</label>
                <select id={`status-${todo._id}`} className="form-select" value={todo.status} onChange={(event) => changeStatus(todo._id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>
              </div></article></div>
            ))}</div>}
          </section>
        </div>
      </div>
      </main>
      <footer className="app-footer"><div className="container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"><p className="mb-0 footer-brand">✦ taskflow</p><p className="mb-0 footer-note">Organize lightly. Accomplish deeply.</p><a href="#top" className="back-top">Back to top ↑</a></div></footer>
    </div>
  );
}

export default App;
