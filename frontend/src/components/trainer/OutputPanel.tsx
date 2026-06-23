import type { RunResult } from '@/lib/api'

type OutputPanelProps = {
  result: RunResult | null
  monoClassName?: string
}

export default function OutputPanel({ result, monoClassName = '' }: OutputPanelProps) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="text-sm font-semibold mb-2">Вывод</h3>
      <div className={`rounded-2xl border p-3 min-h-[110px] text-sm whitespace-pre-wrap ${monoClassName} ${
        result?.error
          ? 'border-red-500/40 bg-red-950/20 text-red-200'
          : result?.passed
            ? 'border-[#FFD60A]/40 bg-[#1a1500]/20 text-[#FFD60A]'
            : 'border-[#1f2937] bg-[#020617] text-gray-300'
      }`}>
        {result ? (result.error || result.output || (result.passed ? 'Тесты пройдены.' : 'Нет вывода')) : 'Нажми Run для запуска кода...'}
      </div>
    </div>
  )
}
