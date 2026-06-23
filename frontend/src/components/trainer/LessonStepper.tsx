type StepItem = {
  id: number
  title: string
  subtitle: string
  expandedText?: string
  locked: boolean
  done: boolean
}

type LessonStepperProps = {
  steps: StepItem[]
  activeStep: number
  onSelectStep: (stepId: number) => void
}

export default function LessonStepper({ steps, activeStep, onSelectStep }: LessonStepperProps) {
  const current = steps.findIndex((s) => s.id === activeStep) + 1

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Пошаговое обучение</h3>
        <span className="text-xs text-[#FFD60A]">step {current}/{steps.length}</span>
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const active = step.id === activeStep
          return (
            <button
              key={step.id}
              onClick={() => !step.locked && onSelectStep(step.id)}
              disabled={step.locked}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                active
                  ? 'border-[#FFD60A] bg-cyan-500/10'
                  : step.locked
                    ? 'border-[#1f2937] bg-[#0b1220] opacity-45 cursor-not-allowed'
                    : 'border-[#1f2937] bg-[#0b1220] hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-6 w-6 shrink-0 rounded-full border text-xs font-semibold flex items-center justify-center ${
                  step.done
                    ? 'border-emerald-400/60 bg-[#FFD60A]/20 text-[#FFD60A]'
                    : active
                      ? 'border-[#FFD60A]/60 bg-cyan-500/20 text-[#FFD60A]'
                      : 'border-gray-600 text-gray-400'
                }`}>
                  {step.done ? '✓' : step.id}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{step.title}</p>
                  <p className="text-xs text-gray-400">{step.subtitle}</p>
                </div>
              </div>

              {active && step.expandedText && (
                <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2">
                  <p className="text-xs leading-relaxed text-[#FFE44D]">{step.expandedText}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
