import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Plus, Copy, Check, Eye, EyeOff, Trash2 } from 'lucide-react'

const WIDGET_URL = 'https://iterate-it.vercel.app/widget.js'

// ── System Card ──────────────────────────────
function SystemCard({ system, widgetKeys, orgId, defaultUserId, onRefresh }) {
  const [copied,   setCopied]   = useState(null)
  const [showCode, setShowCode] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const activeKey = widgetKeys.find(k => k.system_id === system.id && k.is_active)

  function getEmbedCode(key) {
    return `<!-- IterateIT Widget -->
<script src="${WIDGET_URL}"></script>
<script>
  IterateIT.init({
    orgId:         '${orgId}',
    systemId:      '${system.id}',
    apiKey:        '${key}',
    defaultUserId: '${defaultUserId}',
    position:      'bottom-right'
  });
</script>`
  }

  async function copyToClipboard(text, label) {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  async function generateKey() {
    await supabase.from('widget_keys').insert({
      org_id:    orgId,
      system_id: system.id,
    })
    onRefresh()
  }

  async function revokeKey(keyId) {
    await supabase.from('widget_keys').update({ is_active: false }).eq('id', keyId)
    onRefresh()
  }

  async function deleteSystem() {
    if (!window.confirm(`Delete "${system.name}"? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('systems').update({ is_active: false }).eq('id', system.id)
    onRefresh()
  }

  return (
    <div className="bg-white rounded-lg border border-brand-divider p-6">
      {/* System header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-extrabold text-brand-navy">
            {system.name}
          </h3>
          {system.description && (
            <p className="text-brand-steel text-sm mt-0.5">{system.description}</p>
          )}
          <p className="text-xs text-brand-steel mt-1 font-mono">ID: {system.id}</p>
        </div>
        <button
          onClick={deleteSystem}
          disabled={deleting}
          className="text-brand-steel hover:text-red-500 transition-colors"
          title="Deactivate system"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Widget Key */}
      <div className="bg-brand-off-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-brand-navy uppercase tracking-wider">
            Widget API Key
          </p>
          {!activeKey && (
            <Button size="sm" onClick={generateKey}>
              <Plus size={12} /> Generate Key
            </Button>
          )}
        </div>

        {activeKey ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white border border-brand-divider rounded px-3 py-2 text-brand-navy font-mono">
                {activeKey.key}
              </code>
              <button
                onClick={() => copyToClipboard(activeKey.key, 'key')}
                className="text-brand-steel hover:text-brand-blue transition-colors flex-shrink-0"
                title="Copy key"
              >
                {copied === 'key' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <button
              onClick={() => revokeKey(activeKey.id)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Revoke key
            </button>
          </div>
        ) : (
          <p className="text-xs text-brand-steel">No active key — generate one to use the widget.</p>
        )}
      </div>

      {/* Embed Code */}
      {activeKey && (
        <div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 text-sm text-brand-blue hover:underline mb-3"
          >
            {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
            {showCode ? 'Hide' : 'Show'} embed code
          </button>

          {showCode && (
            <div className="relative">
              <pre className="bg-brand-navy text-brand-off-white text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
                {getEmbedCode(activeKey.key)}
              </pre>
              <button
                onClick={() => copyToClipboard(getEmbedCode(activeKey.key), 'embed')}
                className="absolute top-3 right-3 bg-brand-blue text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
              >
                {copied === 'embed' ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}

          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">How to embed</p>
            <p className="text-xs text-blue-600">
              Paste the embed code just before the closing <code>&lt;/body&gt;</code> tag
              on every page of your app. The widget will appear automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── New System Modal ─────────────────────────
function NewSystemModal({ orgId, onClose, onSuccess }) {
  const [form,    setForm]    = useState({ name: '', slug: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function handleChange(e) {
    const val = e.target.value
    const field = e.target.name
    setForm(f => ({
      ...f,
      [field]: val,
      // Auto-generate slug from name
      ...(field === 'name' ? { slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') } : {})
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.from('systems').insert({
      org_id:      orgId,
      name:        form.name,
      slug:        form.slug,
      description: form.description,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-divider">
          <h3 className="font-display text-lg font-extrabold text-brand-navy">
            Add New System
          </h3>
          <button onClick={onClose} className="text-brand-steel hover:text-brand-navy text-xl">✕</button>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                System Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g., HR Portal"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="e.g., hr-portal"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
              />
              <p className="text-xs text-brand-steel mt-1">Auto-generated from name. Lowercase, hyphens only.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of this system"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create System'}
              </Button>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Main Settings Page ───────────────────────
export default function SettingsPage() {
  const { orgId, user } = useAuth()

  const [systems,    setSystems]    = useState([])
  const [widgetKeys, setWidgetKeys] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: systems }, { data: keys }] = await Promise.all([
      supabase.from('systems').select('*').eq('is_active', true).order('name'),
      supabase.from('widget_keys').select('*').eq('is_active', true),
    ])
    setSystems(systems || [])
    setWidgetKeys(keys || [])
    setLoading(false)
  }

  return (
    <PageWrapper
      title="Settings"
      subtitle="Manage your systems and widget integrations."
      actions={
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add System
        </Button>
      }
    >
      {loading ? (
        <div className="text-brand-steel text-sm animate-pulse">Loading...</div>
      ) : systems.length === 0 ? (
        <div className="bg-white rounded-lg border border-brand-divider p-12 text-center">
          <p className="text-brand-steel text-sm mb-4">
            No systems yet. Add your first system to get the widget embed code.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Your First System
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {systems.map(system => (
            <SystemCard
              key={system.id}
              system={system}
              widgetKeys={widgetKeys}
              orgId={orgId}
              defaultUserId={user?.id}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewSystemModal
          orgId={orgId}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadData() }}
        />
      )}
    </PageWrapper>
  )
}
