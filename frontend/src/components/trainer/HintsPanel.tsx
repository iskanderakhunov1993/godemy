type HintsPanelProps = {
  hints: string[]
  opened: number[]
  onToggle: (level: number) => void
}

export default function HintsPanel({ hints, opened, onToggle }: HintsPanelProps) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="text-sm font-semibold mb-2">Подсказки</h3>
      <div className="space-y-2 text-sm">
        {[1, 2].map((level, idx) => (
          <button
            key={level}
            onClick={() => onToggle(level)}
            className="w-full text-left rounded-xl border border-[#1f2937] bg-[#0b1220] p-3 hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-200">{level}. Уровень {level}</span>
              <span className="text-xs text-gray-500">{opened.includes(level) ? 'Скрыть' : 'Показать'}</span>
            </div>
            {opened.includes(level) && <p className="mt-2 text-xs text-gray-400">{hints[idx] || 'Подсказка недоступна.'}</p>}
          </button>
        ))}

        <div className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-3 opacity-70">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">3. Показать решение</span>
            <span className="text-xs text-gray-500">🔒 заблокировано</span>
          </div>
        </div>
      </div>
    </div>
  )
}
