type ExampleBlockProps = {
  code: string
  preview: string
  onRun: () => void
  hasRun: boolean
  monoClassName?: string
}

export default function ExampleBlock({ code, preview, onRun, hasRun, monoClassName = '' }: ExampleBlockProps) {
  return (
    <div className="grid grid-cols-[1fr_220px] gap-3">
      <pre className={`rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
        {code}
      </pre>

      <div className="rounded-2xl border border-[#1f2937] bg-[#0b1220] p-3 flex flex-col justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-2">Результат</p>
          <p className="text-sm text-white whitespace-pre-wrap">{preview}</p>
        </div>
        <button
          onClick={onRun}
          className={`mt-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            hasRun ? 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40' : 'bg-[#FFD60A] text-slate-900 hover:bg-[#FFD60A]'
          }`}
        >
          {hasRun ? 'Run выполнен ✓' : 'Run'}
        </button>
      </div>
    </div>
  )
}
