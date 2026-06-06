import { useState } from "react"

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: (value: string) => void
  initialValue?: string
  placeholder?: string
  submitLabel?: string
}

export default function SimpleInputModal({ open, title, onClose, onSubmit, initialValue = "", placeholder = "", submitLabel = "Сохранить" }: ModalProps) {
  const [value, setValue] = useState(initialValue)
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-cyan-900 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-cyan-400">{title}</h2>
        <input
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-cyan-500"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-white">Отмена</button>
          <button onClick={() => onSubmit(value)} className="px-3 py-1 rounded bg-cyan-700 text-white">{submitLabel}</button>
        </div>
      </div>
    </div>
  )
}
