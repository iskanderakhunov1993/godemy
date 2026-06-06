type TaskBlockProps = {
  title: string
  conditions: string[]
}

export default function TaskBlock({ title, conditions }: TaskBlockProps) {
  return (
    <div>
      <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-300">
        {conditions.map((condition) => (
          <li key={condition}>• {condition}</li>
        ))}
      </ul>
    </div>
  )
}
