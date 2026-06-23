type PatternBlockProps = {
  code: string
  onApply: () => void
  applied: boolean
  monoClassName?: string
}

export default function PatternBlock({ code, onApply, applied, monoClassName = '' }: PatternBlockProps) {
  return (
    <div className="space-y-3">
      <pre className={`rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
        {code}
      </pre>

      <button
        onClick={onApply}
        className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
          applied
            ? 'border border-[#FFD60A]/40 bg-[#FFD60A]/20 text-[#FFD60A]'
            : 'bg-[#FFD60A] text-slate-900 hover:bg-[#FFD60A]'
        }`}
      >
        {applied ? 'Паттерн применён ✓' : 'Применить паттерн'}
      </button>
    </div>
  )
}
