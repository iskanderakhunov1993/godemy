type TestStatus = 'idle' | 'passed' | 'failed'

type TestCase = {
  id: number
  title: string
  input: string
  expected: string
  status: TestStatus
}

type TestsPanelProps = {
  tests: TestCase[]
}

export default function TestsPanel({ tests }: TestsPanelProps) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <h3 className="text-sm font-semibold mb-2">Тесты</h3>
      <div className="space-y-2">
        {tests.map((test) => (
          <div key={test.id} className="rounded-xl border border-[#1f2937] bg-[#0b1220] p-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{test.title}: {test.input}</span>
              <span className={`text-xs font-semibold ${
                test.status === 'passed'
                  ? 'text-[#FFD60A]'
                  : test.status === 'failed'
                    ? 'text-red-400'
                    : 'text-gray-500'
              }`}>
                {test.status === 'passed' ? 'пройден' : test.status === 'failed' ? 'ошибка' : 'ожидает'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Ожидаемый вывод: {test.expected}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
