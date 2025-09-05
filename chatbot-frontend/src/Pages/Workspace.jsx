import React, { useEffect, useMemo, useState } from 'react'
import './workspace.css'
import { FiPlus, FiFolder, FiUpload } from 'react-icons/fi'

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const parts = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') inQ = !inQ
      else if (ch === ',' && !inQ) { parts.push(cur); cur = '' } else cur += ch
    }
    parts.push(cur)
    const row = {}
    headers.forEach((h, i) => row[h] = (parts[i] || '').trim())
    return row
  })
}

function buildOverview(data) {
  const totalRecords = data.length
  const intentSet = new Set()
  const entitySet = new Set()
  for (const item of data) {
    const intent = item.intent || item.Intent || item.label
    if (intent) intentSet.add(String(intent))
    const entities = item.entities || item.entity || item.Entities
    if (Array.isArray(entities)) {
      for (const e of entities) entitySet.add(String(e.entity || e))
    } else if (typeof entities === 'string') {
      entitySet.add(entities)
    }
  }
  return { totalRecords, intents: intentSet.size, entities: entitySet.size, sample: data.slice(0, 3) }
}

function suggestIntents(text) {
  const t = (text || '').toLowerCase()
  const suggestions = new Set()
  if (/biryani|biriyani|restaurant|eat|dinner|lunch|food/.test(t)) suggestions.add('book_table')
  if (/flight|book\s+flight|ticket|plane/.test(t)) suggestions.add('book_flight')
  if (/hotel|stay|room/.test(t)) suggestions.add('book_hotel')
  if (/taxi|cab|ride/.test(t)) suggestions.add('book_taxi')
  if (/weather|forecast|temperature/.test(t)) suggestions.add('check_weather')
  return Array.from(suggestions)
}

export default function Workspace({ goToLogin }) {
  const [workspaces, setWorkspaces] = useState([])
  const [newWs, setNewWs] = useState('')

  const [file, setFile] = useState(null)
  const [data, setData] = useState([])
  const overview = useMemo(() => buildOverview(data), [data])

  // Samples from JSON and intent text box
  const [samples, setSamples] = useState([])
  const [utterance, setUtterance] = useState('')
  const [suggested, setSuggested] = useState([])

  useEffect(() => {
    fetch('/data/utterances.json')
      .then(r => r.json())
      .then(list => {
        if (Array.isArray(list)) setSamples(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setSuggested(suggestIntents(utterance))
  }, [utterance])

  const createWorkspace = (e) => {
    e.preventDefault()
    const name = newWs.trim()
    if (!name) return
    if (workspaces.some(w => w.name.toLowerCase() === name.toLowerCase())) {
      alert('Workspace already exists')
      return
    }
    const d = new Date()
    const createdAt = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    setWorkspaces([{ id: String(Date.now()), name, createdAt }, ...workspaces])
    setNewWs('')
    alert('Workspace created')
  }

  const deleteWorkspace = (id, name) => {
    const ok = confirm(`Delete workspace "${name}"? This cannot be undone.`)
    if (!ok) return
    setWorkspaces(prev => prev.filter(w => w.id !== id))
  }

  const onSelectFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        let parsed = []
        if (f.name.toLowerCase().endsWith('.json')) {
          const j = JSON.parse(text)
          parsed = Array.isArray(j) ? j : (j.data || [])
        } else if (f.name.toLowerCase().endsWith('.csv')) {
          parsed = parseCsv(text)
        }
        setData(parsed)
        alert('Dataset uploaded')
      } catch (e) {
        console.error(e)
        alert('Failed to parse dataset. Use CSV or JSON array.')
      }
    }
    reader.readAsText(f)
  }

  const applySample = (s) => {
    setUtterance(s.text || '')
  }

  return (
    <div className="ws-root">
      <div className="ws-top">
        <div className="ws-brand">Project Workspace</div>
        <div className="ws-spacer" />
        <button className="ws-logout" onClick={goToLogin}>Log out</button>
      </div>

      <div className="ws-columns">
        <div className="ws-left">
          <div className="ws-section-title"><FiFolder /> Workspaces</div>
          <ul className="ws-list">
            {workspaces.map(w => (
              <li key={w.id} className="ws-item">
                <div className="ws-item-meta">
                  <span className="ws-name">{w.name}</span>
                  <span className="ws-date">Created: {w.createdAt}</span>
                </div>
                <button className="ws-delete" onClick={() => deleteWorkspace(w.id, w.name)}>Delete</button>
              </li>
            ))}
            {workspaces.length === 0 && (
              <li className="ws-item empty">No workspaces yet. Create your first one below.</li>
            )}
          </ul>
          <form className="ws-create" onSubmit={createWorkspace}>
            <div className="ws-input-row">
              <span className="ws-plus"><FiPlus /></span>
              <input className="ws-input" placeholder="Create New Workspace" value={newWs} onChange={(e)=>setNewWs(e.target.value)} />
            </div>
            <button className="ws-button" type="submit">Create</button>
          </form>

          {samples.length > 0 && (
            <div className="ws-samples">
              <div className="ws-samples-title">Sample Utterances (from JSON)</div>
              <ul className="ws-sample-list">
                {samples.map((s, i) => (
                  <li key={i} className="ws-sample-item" onClick={() => applySample(s)}>{s.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ws-right">
          <div className="ws-section-title"><FiUpload /> Dataset Upload</div>
          <div className="ws-upload">
            <input type="file" accept=".json,.csv" onChange={onSelectFile} />
            {file && <div className="ws-file">Selected: {file.name}</div>}
          </div>
          <div className="ws-overview">
            <div className="ov-title">Dataset Overview</div>
            <div className="ov-grid">
              <div className="ov-card"><div className="ov-label">Records</div><div className="ov-value">{overview.totalRecords}</div></div>
              <div className="ov-card"><div className="ov-label">Intents</div><div className="ov-value">{overview.intents}</div></div>
              <div className="ov-card"><div className="ov-label">Entities</div><div className="ov-value">{overview.entities}</div></div>
            </div>
            {overview.sample.length > 0 && (
              <div className="ov-sample">
                <div className="ov-sample-title">Sample</div>
                <pre className="ov-pre">{JSON.stringify(overview.sample, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="ws-intents">
            <div className="ov-title">Intent Suggestions</div>
            <textarea
              className="ws-textarea"
              rows={4}
              placeholder="Type something like: I want to eat biriyani"
              value={utterance}
              onChange={(e) => setUtterance(e.target.value)}
            />
            <div className="intent-suggest-list">
              {suggested.length === 0 ? (
                <div className="empty">No suggestions yet.</div>
              ) : (
                suggested.map(s => (
                  <span key={s} className="chip">{s}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
