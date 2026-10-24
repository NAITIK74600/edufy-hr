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
  if (!open) return null
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
    <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="dialog-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={isDestructive ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </section>
  </div>
}
