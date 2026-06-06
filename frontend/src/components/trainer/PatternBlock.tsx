type PatternBlockProps = {
  code: string
  onApply: () => void
  applied: boolean
  monoClassName?: string
}

export default function PatternBlock({ code, onApply, applied, monoClassName = '' }: PatternBlockProps) {
  return (
    <div className="space-y-3">
      <pre className={`rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-cyan-200 whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
        {code}
      </pre>

      <button
        onClick={onApply}
        className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
          applied
            ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
            : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400'
        }`}
      >
        {applied ? 'Паттерн применён ✓' : 'Применить паттерн'}
      </button>
    </div>
  )
}
