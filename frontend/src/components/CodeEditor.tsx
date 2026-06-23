'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { api, RunResult } from '@/lib/api'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface Props {
  initialCode: string
  exerciseId?: number
  onSuccess?: () => void
}

export function CodeEditor({ initialCode, exerciseId, onSuccess }: Props) {
  const [code, setCode] = useState(initialCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'output' | 'hints'>('output')

  const run = async (submit = false) => {
    setLoading(true)
    setResult(null)
    try {
      const res = submit && exerciseId
        ? await api.submitExercise(code, exerciseId)
        : await api.runCode(code)
      setResult(res)
      if (res.passed && onSuccess) onSuccess()
    } catch (e: unknown) {
      setResult({ output: '', error: e instanceof Error ? e.message : 'Ошибка', passed: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor */}
      <div className="flex-1 min-h-0 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-[#FFD60A]/60" />
          <span className="ml-2 text-xs text-gray-500 font-mono">solution.go</span>
        </div>
        <MonacoEditor
          height="100%"
          defaultLanguage="go"
          value={code}
          onChange={(v) => setCode(v || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineNumbers: 'on',
            tabSize: 4,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 py-3">
        <button
          onClick={() => run(false)}
          disabled={loading}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          ▶ Запустить
        </button>
        {exerciseId && (
          <button
            onClick={() => run(true)}
            disabled={loading}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {loading ? '...' : '✓ Проверить решение'}
          </button>
        )}
        <button
          onClick={() => setCode(initialCode)}
          className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Сбросить
        </button>
      </div>

      {/* Output */}
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center border-b border-gray-700 bg-gray-900">
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'output' ? 'text-[#FFD60A] border-b-2 border-[#FFD60A]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Вывод
          </button>
        </div>
        <div className="p-4 bg-gray-950 min-h-[80px] max-h-[200px] overflow-y-auto font-mono text-sm">
          {loading && (
            <div className="text-gray-400 animate-pulse">Выполняется...</div>
          )}
          {result && !loading && (
            <>
              {result.passed && (
                <div className="text-[#FFD60A] mb-2 font-semibold">✓ Все тесты прошли!</div>
              )}
              {result.output && (
                <pre className="text-gray-200 whitespace-pre-wrap">{result.output}</pre>
              )}
              {result.error && (
                <pre className="text-red-400 whitespace-pre-wrap">{result.error}</pre>
              )}
              {!result.output && !result.error && result.passed && (
                <span className="text-gray-500">Нет вывода</span>
              )}
            </>
          )}
          {!loading && !result && (
            <span className="text-gray-600">Нажми ▶ Запустить чтобы увидеть результат</span>
          )}
        </div>
      </div>
    </div>
  )
}
