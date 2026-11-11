import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, CheckCircle2, Circle, ClipboardList, LayoutDashboard, ListTodo, Loader2, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { api } from './api'
import type { Task, TaskInput, TaskStatus } from './types'

type Filter = 'all' | TaskStatus

const statusLabel: Record<TaskStatus, string> = {
  todo: 'To do', in_progress: 'In progress', done: 'Completed',
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskInput>({ title: '', description: '' })

  useEffect(() => {
    api.list().then(setTasks).catch((e: Error) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks])

  const visible = useMemo(() => tasks.filter(t =>
    (filter === 'all' || t.status === filter) &&
    `${t.title} ${t.description}`.toLowerCase().includes(search.toLowerCase())
  ), [tasks, filter, search])

  function openCreate() {
    setEditing(null)
    setForm({ title: '', description: '' })
    setError('')
    setShowForm(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setForm({ title: task.title, description: task.description })
    setError('')
    setShowForm(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 3) { setError('Title must contain at least 3 characters.'); return }
    setBusy(true)
    setError('')
    try {
      if (editing) {
        const updated = await api.update(editing.id, { title: form.title.trim(), description: form.description })
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      } else {
        const created = await api.create({ title: form.title.trim(), description: form.description })
        setTasks(prev => [created, ...prev])
      }
      setShowForm(false)
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    setError('')
    try {
      const updated = await api.update(task.id, { status })
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
    } catch (e) { setError((e as Error).message) }
  }

  async function remove(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return
    setError('')
    try {
      await api.remove(task.id)
      setTasks(prev => prev.filter(t => t.id !== task.id))
    } catch (e) { setError((e as Error).message) }
  }

  const filters: { key: Filter, label: string }[] = [
    { key: 'all', label: 'All tasks' }, { key: 'todo', label: 'To do' },
    { key: 'in_progress', label: 'In progress' }, { key: 'done', label: 'Completed' },
  ]

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={21} strokeWidth={3} /></div><span>taskflow<span className="brand-dot">.</span></span></div>
        <div className="sidebar-caption">WORKSPACE</div>
        <button className="nav-link active" onClick={() => setFilter('all')}><LayoutDashboard size={18} /> Overview</button>
        <button className="nav-link" onClick={() => setFilter('all')}><ListTodo size={18} /> My tasks <span className="nav-count">{counts.all}</span></button>
        <div className="sidebar-caption second">FILTER BY STATUS</div>
        {filters.slice(1).map(({ key, label }) => <button key={key} className={`nav-link ${filter === key ? 'selected' : ''}`} onClick={() => setFilter(key)}><span className={`side-dot ${key}`} />{label}<span className="nav-count">{counts[key]}</span></button>)}
        <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={18} /><strong>A little progress every day.</strong><span>Keep your momentum going, one task at a time.</span></div><div className="sidebar-foot">TaskFlow · v1.0</div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="top-avatar" aria-label="Profile">TF</div></header>
        <div className="content">
          <div className="heading-row"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>Good to see you <span className="wave">✳</span></h1><p className="subtitle">Here's what's happening with your tasks today.</p></div><button className="primary" onClick={openCreate}><Plus size={18} /> New task</button></div>
          <section className="stats">
            <div className="stat-card"><div className="stat-header"><span>Total tasks</span><span className="stat-icon purple"><ClipboardList size={20}/></span></div><div className="stat-value">{counts.all}</div><span className="stat-note">Tasks in your workspace</span></div>
            <div className="stat-card"><div className="stat-header"><span>In progress</span><span className="stat-icon amber"><Loader2 size={20}/></span></div><div className="stat-value">{counts.in_progress}</div><span className="stat-note">You're working on these</span></div>
            <div className="stat-card"><div className="stat-header"><span>Completed</span><span className="stat-icon green"><CheckCircle2 size={20}/></span></div><div className="stat-value">{counts.done}</div><span className="stat-note">Well done, keep it up!</span></div>
          </section>

          <section className="task-panel">
            <div className="panel-head"><div><h2>My Tasks <span className="count-pill">{counts.all}</span></h2><p>Manage and organize your daily work</p></div><div className="search"><Search size={17}/><input aria-label="Search tasks" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..." /></div></div>
            <div className="tabs">{filters.map(({key,label})=><button key={key} onClick={()=>setFilter(key)} className={`tab ${filter===key?'on':''}`}>{label} <span>{counts[key]}</span></button>)}</div>
            {error && !showForm && <div className="error-banner" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss error"><X size={16}/></button></div>}
            {loading ? <div className="empty"><Loader2 className="spin" size={27}/><p>Loading tasks...</p></div> : visible.length === 0 ? <div className="empty"><div className="empty-icon"><ClipboardList size={28}/></div><h3>{search || filter!=='all' ? 'No matching tasks' : 'No tasks yet'}</h3><p>{search || filter!=='all' ? 'Try another filter or search term.' : 'Create your first task and start making progress.'}</p>{!search && filter==='all' && <button className="empty-add" onClick={openCreate}><Plus size={16}/> Create a task</button>}</div> : <div className="task-list">{visible.map(task=><article className="task-row" key={task.id}><div className={`task-state ${task.status}`}><Circle size={18}/></div><div className="task-body"><h3>{task.title}</h3><p>{task.description || 'No description'}</p><span className="task-date">Created {new Date(task.created_at).toLocaleDateString()}</span></div><select className={`status-select ${task.status}`} aria-label={`Status for ${task.title}`} value={task.status} onChange={e=>changeStatus(task,e.target.value as TaskStatus)}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Completed</option></select><div className="task-actions"><button title="Edit task" aria-label={`Edit ${task.title}`} onClick={()=>openEdit(task)}><Pencil size={16}/></button><button title="Delete task" aria-label={`Delete ${task.title}`} onClick={()=>remove(task)}><Trash2 size={16}/></button></div></article>)}</div>}
            <div className="panel-footer">Showing {visible.length} of {counts.all} tasks <span>Stay focused. You've got this.</span></div>
          </section>
        </div>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget && !busy) setShowForm(false)}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><h2 id="modal-title">{editing?'Edit task':'Create a new task'}</h2><p>{editing?'Update your task details.':'What would you like to work on?'}</p></div><button aria-label="Close" className="close" onClick={()=>setShowForm(false)} disabled={busy}><X size={20}/></button></div><form onSubmit={submit}><label htmlFor="task-title">Task title <span>*</span></label><input id="task-title" placeholder="e.g. Finish project documentation" maxLength={120} minLength={3} required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><label htmlFor="task-desc">Description</label><textarea id="task-desc" placeholder="Add a few details (optional)" rows={4} maxLength={2000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="primary" disabled={busy}>{busy?'Saving...':editing?'Save changes':'Create task'}</button></div></form></div></div>}
    </div>
  )
}

export default App
