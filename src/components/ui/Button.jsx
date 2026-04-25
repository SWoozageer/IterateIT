import clsx from 'clsx'

// Reusable button component with brand variants
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-brand-blue text-white hover:bg-blue-700',
    secondary: 'bg-brand-off-white text-brand-navy border border-brand-divider hover:bg-brand-divider',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-brand-steel hover:text-brand-navy hover:bg-brand-off-white',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-6 py-3',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}