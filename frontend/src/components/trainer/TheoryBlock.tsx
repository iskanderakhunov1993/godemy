type TheoryBlockProps = {
  text: string
  syntax: string
  monoClassName?: string
}

export default function TheoryBlock({ text, syntax, monoClassName = '' }: TheoryBlockProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300">{text}</p>
      <pre className={`rounded-2xl border border-[#1f2937] bg-[#020617] p-4 text-sm text-cyan-200 whitespace-pre-wrap overflow-x-auto ${monoClassName}`}>
        {syntax}
      </pre>
    </div>
  )
}
