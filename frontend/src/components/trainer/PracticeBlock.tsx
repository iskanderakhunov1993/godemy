type PracticeItem = {
  id: number
  title: string
  code: string
  done: boolean
}

type PracticeBlockProps = {
  items: PracticeItem[]
  onRunItem: (id: number) => void
  monoClassName?: string
}

export default function PracticeBlock({ items, onRunItem, monoClassName = '' }: PracticeBlockProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-[#1f2937] bg-[#0b1220] p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm text-white">{item.title}</p>
            <span className={`text-xs ${item.done ? 'text-[#FFD60A]' : 'text-gray-500'}`}>{item.done ? 'готово' : 'ожидает'}</span>
          </div>

          <pre className={`rounded-xl border border-[#1f2937] bg-[#020617] p-3 text-xs text-[#FFD60A] whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
            {item.code}
          </pre>

          <button
            onClick={() => onRunItem(item.id)}
            className={`mt-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              item.done
                ? 'border border-emerald-400/40 bg-[#FFD60A]/20 text-[#FFD60A]'
                : 'border border-[#1f2937] text-gray-300 hover:border-cyan-500/40 hover:text-white'
            }`}
          >
            {item.done ? 'Run ✓' : 'Run'}
          </button>
        </div>
      ))}
    </div>
  )
}
