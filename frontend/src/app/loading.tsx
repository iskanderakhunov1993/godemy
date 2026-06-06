export default function Loading() {
  return (
    <div className="go-loader-shell" role="status" aria-live="polite" aria-label="Загрузка страницы">
      <div className="go-loader-panel">
        <div className="go-loader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="go-loader-caption">Собираем страницу...</div>

        <pre className="go-loader-code" aria-hidden="true">
{`func BuildPage() string {
    return "Godemy"
}`}
        </pre>

        <div className="go-loader-typing-wrap" aria-hidden="true">
          <div className="go-loader-typing">{`func BuildPage() string { return "Godemy" }`}</div>
        </div>
      </div>
    </div>
  )
}
