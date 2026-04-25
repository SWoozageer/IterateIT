import clsx from 'clsx'

const statusColours = {
  open:        'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  in_review:   'bg-purple-100 text-purple-700',
  on_hold:     'bg-gray-100 text-gray-600',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-200 text-gray-500',
}

const severityColours = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-green-100 text-green-700',
}

const typeColours = {
  enhancement:    'bg-blue-100 text-blue-700',
  bug:            'bg-red-100 text-red-700',
  question:       'bg-purple-100 text-purple-700',
  change_request: 'bg-orange-100 text-orange-700',
}

export default function Badge({ value, variant = 'status' }) {
  const colourMap = { status: statusColours, severity: severityColours, type: typeColours }
  const colours = colourMap[variant]?.[value] || 'bg-gray-100 text-gray-600'
  const label   = value?.replace(/_/g, ' ')
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', colours)}>
      {label}
    </span>
  )
}
