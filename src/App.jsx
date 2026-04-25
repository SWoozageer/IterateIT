import { Routes, Route } from 'react-router-dom'

// Temporary placeholder — we'll replace these with real pages shortly
function HomePage() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-5xl font-extrabold text-white">
          Iterate<span className="text-brand-blue">IT</span>
        </h1>
        <p className="font-body text-brand-steel mt-2 tracking-widest uppercase text-sm">
          Log It · Track It · Fix It
        </p>
        <p className="text-brand-steel mt-8 text-sm">
          🚀 Foundation ready — building auth next
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}