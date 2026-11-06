import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Button({ children, variant = 'primary', as: Element = 'button', href, ...props }) {
  return <Element className={`ui-button ${variant}`} href={href} {...props}>{children}</Element>
}

export function PageHeader({ eyebrow, title, description, children }) {
  return <section className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="lede">{description}</p>}
    </div>
    {children && <div className="page-header-actions">{children}</div>}
  </section>
}

export function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`ui-status ${tone}`}>{children}</span>
}

export function Field({ label, hint, children, required = false }) {
  return <label className="ui-field">
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
}

export function DataTable({ caption, columns, rows, emptyMessage = 'No records found.' }) {
  return <div className="ui-table-wrap">
    <table className="ui-table">
      <caption>{caption}</caption>
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
      <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}><EmptyState title={emptyMessage} /></td></tr> : rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export function StatePanel({ title, message, tone = 'neutral', action }) {
  return <section className={`state-panel ${tone}`} role={tone === 'error' ? 'alert' : undefined}>
    <div><strong>{title}</strong><p>{message}</p></div>
    {action}
  </section>
}

export function LoadingState() {
  return <StatePanel title="Loading" message="Preparing this workspace." tone="loading" />
}

export function EmptyState({ title = 'Nothing here yet.', message }) {
  return <div className="empty-state"><strong>{title}</strong>{message && <p>{message}</p>}</div>
}

export function ErrorState({ message = 'Something went wrong.', action }) {
  return <StatePanel title="Unable to load this view" message={message} tone="error" action={action} />
}

export function AccessDeniedState() {
  return <StatePanel title="Access denied" message="You do not have permission to view this workspace." tone="warning" />
}

export function ConfirmationDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, isDestructive = false }) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div 
      className="dialog-backdrop" 
      role="presentation" 
      onMouseDown={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <section 
        className="dialog" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="dialog-title" 
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: 'relative',
          margin: 'auto',
          maxWidth: '440px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid var(--line, #e2e8f0)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
          padding: '24px',
          boxSizing: 'border-box',
          animation: 'dialogPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <h2 id="dialog-title" style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700, color: 'var(--ink, #1e293b)' }}>
          {title}
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: '13px', lineHeight: 1.55, color: '#64748b' }}>
          {message}
        </p>
        <div className="dialog-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={isDestructive ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>,
    document.body
  )
}
