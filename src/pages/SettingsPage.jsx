import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Plus, Copy, Check, Eye, EyeOff, Trash2 } from 'lucide-react'

const WIDGET_URL = 'https://iterate-it.vercel.app/widget.js'

const FRAMEWORKS = [
  { id: 'nextjs',    label: 'Next.js'       },
  { id: 'react',     label: 'React (Vite)'  },
  { id: 'html',      label: 'Plain HTML'    },
  { id: 'vue',       label: 'Vue.js'        },
]

function getEmbedCode(framework, { orgId, systemId, apiKey, defaultUserId }) {
  const config = `    orgId:         '${orgId}',
    systemId:      '${systemId}',
    apiKey:        '${apiKey}',
    defaultUserId: '${defaultUserId}',
    position:      'bottom-right'`

  switch (framework) {
    case 'nextjs': return `// src/app/layout.tsx
// Add this import at the top:
import Script from 'next/script'

// Add inside your <body> tag, before closing </body>:
<Script src="${WIDGET_URL}" strategy="lazyOnload" />
<Script id="iterateit-init" strategy="lazyOnload">{\`
  window.addEventListener('load', function() {
    if (window.IterateIT) {
      IterateIT.init({
${config}
      });
    }
  });
\`}</Script>`

    case 'react': return `// src/App.jsx
// Add this inside your App component:
import { useEffect } from 'react'

useEffect(() => {
  const script = document.createElement('script')
  script.src = '${WIDGET_URL}'
  script.onload = () => {
    window.IterateIT.init({
${config}
    })
  }
  document.body.appendChild(script)
  return () => document.body.removeChild(script)
}, [])`

    case 'vue': return `// src/App.vue
// Add this in your <script setup> or mounted():
onMounted(() => {
  const script = document.createElement('script')
  script.src = '${WIDGET_URL}'
  script.onload = () => {
    window.IterateIT.init({
${config}
    })
  }
  document.body.appendChild(script)
})`

    case 'html':
    default: return `<!-- Add before </body> in your base/layout HTML file -->
<script src="${WIDGET_URL}"></script>
<script>
  window.addEventListener('load', function() {
    IterateIT.init({
${config}
    });
  });
</script>`
  }
}

function getInstructions(framework) {
  switch (framework) {
    case 'nextjs': return 'Add to src/app/layout.tsx — this wraps every page automatically. Import Script from next/script.'
    case 'react':  return 'Add the useEffect to your src/App.jsx — it runs once on app load and persists across all pages.'
    case 'vue':    return 'Add to src/App.vue in your mounted() or onMounted() hook — runs once on app startup.'
    case 'html':   return 'Add to your shared layout/base HTML file before </body> — or to every page if no shared layout exists.'
    default:       return 'Paste before the closing </body> tag.'
  }
}

// ── System Card ──────────────────────────────
function SystemCard({ system, widgetKeys, orgId, defaultUserId, onRefresh }) {
  const [copied,      setCopied]      = useState(null)
  const [showCode,    setShowCode]    = useState(false)
  const [framework,   setFramework]   = useState('nextjs')

  const activeKey = widgetKeys.find(k => k.system_id === system.id && k.is_active)

  const embedCode = activeKey ? getEmbedCode(framework, {
    orgId,
    systemId:      system.id,
    apiKey:        activeKey.key,
    defaultUserId,
  }) : ''

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
    if (!window.confirm('Revoke this key? Apps using it will stop working.')) return
    await supabase.from('widget_keys').update({ is_active: false }).eq('id', keyId)
    onRefresh()
  }

  async function deleteSystem() {
    if (!window.confirm(`Deactivate "${system.name}"? This cannot be undone.`)) return
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
          <div className="flex items-center gap-2 mt-1">
  <p className="text-xs text-brand-steel font-mono">
    System ID: {system.id}
  </p>
  <button
    onClick={() => copyToClipboard(system.id, 'systemid')}
    className="text-brand-steel hover:text-brand-blue transition-colors flex-shrink-0"
    title="Copy System ID"
  >
    {copied === 'systemid'
      ? <Check size={12} className="text-green-500" />
      : <Copy size={12} />}
  </button>
</div>
        </div>
        <button
          onClick={deleteSystem}
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
              <code className="flex-1 text-xs bg-white border border-brand-divider rounded px-3 py-2 text-brand-navy font-mono truncate">
                {activeKey.key}
              </code>
              <button
                onClick={() => copyToClipboard(activeKey.key, 'key')}
                className="text-brand-steel hover:text-brand-blue transition-colors flex-shrink-0"
                title="Copy key"
              >
                {copied === 'key'
                  ? <Check size={16} className="text-green-500" />
                  : <Copy size={16} />}
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
          <p className="text-xs text-brand-steel">
            No active key — generate one to use the widget.
          </p>
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
            <div>
              {/* Framework tabs */}
              <div className="flex gap-1 mb-3 bg-brand-off-white rounded-lg p-1">
                {FRAMEWORKS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFramework(f.id)}
                    className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-colors ${
                      framework === f.id
                        ? 'bg-white text-brand-blue shadow-sm'
                        : 'text-brand-steel hover:text-brand-navy'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  📋 Where to paste this
                </p>
                <p className="text-xs text-blue-600">
                  {getInstructions(framework)}
                </p>
              </div>

              {/* Code block */}
              <div className="relative">
                <pre className="bg-brand-navy text-brand-off-white text-xs rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {embedCode}
                </pre>
                <button
                  onClick={() => copyToClipboard(embedCode, 'embed')}
                  className="absolute top-3 right-3 bg-brand-blue text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                >
                  {copied === 'embed'
                    ? <><Check size={12} /> Copied!</>
                    : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </div>
          )}
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
    const val   = e.target.value
    const field = e.target.name
    setForm(f => ({
      ...f,
      [field]: val,
      ...(field === 'name' ? {
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      } : {})
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
    if (error) { setError(error.message); setLoading(false) }
    else onSuccess()
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
                System Name * <span className="text-brand-steel font-normal">(e.g., HR Portal)</span>
              </label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} required
                placeholder="HR Portal"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Slug *</label>
              <input
                type="text" name="slug" value={form.slug}
                onChange={handleChange} required
                placeholder="hr-portal"
                className="w-full border border-brand-divider rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue font-mono"
              />
              <p className="text-xs text-brand-steel mt-1">Auto-generated. Lowercase and hyphens only.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1">Description</label>
              <input
                type="text" name="description" value={form.description}
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
// ── Integration Guide ────────────────────────
function IntegrationGuide() {
  const [open, setOpen] = useState(false)

  const frameworks = [
    {
      files: 'next.config.js + src/app/ folder',
      framework: 'Next.js',
      tab: 'Next.js',
      colour: 'bg-black text-white',
    },
    {
      files: 'vite.config.js + src/main.jsx',
      framework: 'React (Vite)',
      tab: 'React (Vite)',
      colour: 'bg-blue-500 text-white',
    },
    {
      files: 'vue.config.js or .vue files',
      framework: 'Vue.js',
      tab: 'Vue.js',
      colour: 'bg-green-500 text-white',
    },
    {
      files: 'Just .html files, no config file',
      framework: 'Plain HTML',
      tab: 'Plain HTML',
      colour: 'bg-orange-400 text-white',
    },
  ]

  const steps = [
    { num: '1', title: 'Add your app as a System', desc: 'Click "Add System" above. Give it a clear name (e.g., "HR Portal") and description.' },
    { num: '2', title: 'Generate a Widget Key', desc: 'Click "Generate Key" on your new system. This is a secure API key scoped only to that app.' },
    { num: '3', title: 'Identify your framework', desc: 'Look at your project files (see table below) to determine which framework your app uses.' },
    { num: '4', title: 'Copy the embed code', desc: 'Click "Show embed code", select the correct framework tab, and copy the code.' },
    { num: '5', title: 'Paste into your layout file', desc: 'Add the code once into your app\'s root layout file. The widget will appear on every page automatically.' },
    { num: '6', title: 'Add aria standards', desc: 'For active tabs, add aria-selected="true" to the active button. For breadcrumbs, add aria-label="breadcrumb" to the nav element. This enables automatic tab and path detection.' },
    { num: '7', title: 'Deploy your app', desc: 'Commit, push, and deploy. The widget will appear in the bottom-right corner of every page.' },
  ]

  return (
    <div className="bg-white rounded-lg border border-brand-divider overflow-hidden">
      {/* Header — clickable to expand/collapse */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-off-white transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
            <span className="text-white text-sm font-bold">?</span>
          </div>
          <div className="text-left">
            <p className="font-display text-base font-extrabold text-brand-navy">
              Integration Guide
            </p>
            <p className="text-brand-steel text-xs">
              How to add the widget to any app — step by step
            </p>
          </div>
        </div>
        <span className="text-brand-steel text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-brand-divider">

          {/* Steps */}
          <div className="mt-5 mb-6">
            <h4 className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-4">
              Step-by-Step Process
            </h4>
            <div className="space-y-3">
              {steps.map(step => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{step.title}</p>
                    <p className="text-xs text-brand-steel mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Framework detection */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-4">
              How to Identify Your Framework
            </h4>
            <p className="text-xs text-brand-steel mb-3">
              Open your project folder and look for these files:
            </p>
            <div className="rounded-lg border border-brand-divider overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-off-white border-b border-brand-divider">
                    <th className="text-left px-4 py-2.5 text-brand-steel font-semibold text-xs uppercase tracking-wider">
                      Files you see in the project
                    </th>
                    <th className="text-left px-4 py-2.5 text-brand-steel font-semibold text-xs uppercase tracking-wider">
                      Framework
                    </th>
                    <th className="text-left px-4 py-2.5 text-brand-steel font-semibold text-xs uppercase tracking-wider">
                      Select this tab
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-divider">
                  {frameworks.map(f => (
                    <tr key={f.framework}>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-brand-off-white px-2 py-1 rounded text-brand-navy">
                          {f.files}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${f.colour}`}>
                          {f.framework}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-steel">
                        "{f.tab}" tab in embed code
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aria standards */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-brand-steel uppercase tracking-wider mb-4">
              Required Code Standards for Full Widget Functionality
            </h4>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  Active Tab Detection
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  Add <code className="bg-blue-100 px-1 rounded">aria-selected="true"</code> to the active tab button and <code className="bg-blue-100 px-1 rounded">aria-selected="false"</code> to all others. Update dynamically when the tab changes.
                </p>
                <pre className="bg-blue-900 text-blue-100 text-xs rounded p-3 overflow-x-auto">{`<button aria-selected={activeTab === 'milestones'}>
  Milestones
</button>`}</pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-700 mb-1">
                  Breadcrumb Path Detection
                </p>
                <p className="text-xs text-green-600 mb-2">
                  Wrap your breadcrumb in a <code className="bg-green-100 px-1 rounded">nav</code> element with <code className="bg-green-100 px-1 rounded">aria-label="breadcrumb"</code>.
                </p>
                <pre className="bg-green-900 text-green-100 text-xs rounded p-3 overflow-x-auto">{`<nav aria-label="breadcrumb">
  <span>Home</span> › <span>Projects</span>
</nav>`}</pre>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-brand-off-white rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-brand-navy mb-1">
              💡 Pro tip — Tell Claude upfront
            </p>
            <p className="text-xs text-brand-steel">
              When starting a new app with Claude, say: <em>"This app will use the IterateIT widget. Please add aria-selected to all active tabs and aria-label='breadcrumb' to all breadcrumb navs throughout the build."</em> Claude will apply these standards automatically from the start.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
// ── Main Page ────────────────────────────────
export default function SettingsPage() {
  const { orgId, user } = useAuth()

  const [systems,    setSystems]    = useState([])
  const [widgetKeys, setWidgetKeys] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: sys }, { data: keys }] = await Promise.all([
      supabase.from('systems').select('*').eq('is_active', true).order('name'),
      supabase.from('widget_keys').select('*').eq('is_active', true),
    ])
    setSystems(sys || [])
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
        <>
        <IntegrationGuide /> 
        <div className="bg-white rounded-lg border border-brand-divider p-12 text-center">
          <p className="text-brand-steel text-sm mb-4">
            No systems yet. Add your first system to get the widget embed code.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Your First System
          </Button>
        </div>
        </>
      ) : (
        <div className="space-y-6">
          <IntegrationGuide />
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
