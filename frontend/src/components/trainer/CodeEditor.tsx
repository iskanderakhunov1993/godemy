'use client'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0b1220] animate-pulse" />,
})

type CodeEditorProps = {
  code: string
  onChange: (value: string) => void
  onRun: () => void
  onSubmit: () => void
  onReset: () => void
  onToggleFullscreen: () => void
  running: boolean
  submitting: boolean
  fullscreen: boolean
  monoClassName?: string
}

export default function CodeEditor({
  code,
  onChange,
  onRun,
  onSubmit,
  onReset,
  onToggleFullscreen,
  running,
  submitting,
  fullscreen,
  monoClassName = '',
}: CodeEditorProps) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] bg-[#0b1220]">
        <div className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-xs text-gray-200">Go 1.21</div>
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="px-3 py-1.5 rounded-lg text-xs border border-[#1f2937] text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">Сбросить код</button>
          <button onClick={onToggleFullscreen} className="px-3 py-1.5 rounded-lg text-xs border border-[#1f2937] text-gray-300 hover:border-cyan-400 hover:text-white transition-colors">{fullscreen ? 'Exit' : 'Fullscreen'}</button>
        </div>
      </div>

      <div className="h-[430px] border-b border-[#1f2937]">
        <MonacoEditor
          height="100%"
          language="go"
          theme="vs-dark"
          value={code}
          onChange={(v) => onChange(v ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 2,
            fontFamily: monoClassName,
            padding: { top: 12 },
          }}
        />
      </div>

      <div className="px-4 py-3 flex items-center gap-2 bg-[#0b1220]">
        <button onClick={onRun} disabled={running} className="px-4 py-2 rounded-xl border border-cyan-400/40 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-60">{running ? 'Run...' : 'Run'}</button>
        <button onClick={onSubmit} disabled={submitting} className="px-4 py-2 rounded-xl bg-[#22d3ee] text-slate-900 text-sm font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-60">{submitting ? 'Submit...' : 'Submit'}</button>
      </div>
    </div>
  )
}
