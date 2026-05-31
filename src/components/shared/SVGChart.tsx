interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  showValues?: boolean
  unit?: string
}

export function BarChart({ data, height = 120, showValues = true, unit = '' }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barW = 100 / (data.length * 2 + 1)

  return (
    <svg width="100%" viewBox={`0 0 100 ${height + 20}`} preserveAspectRatio="none" className="overflow-visible">
      {data.map((d, i) => {
        const barHeight = (d.value / max) * height
        const x = barW + i * barW * 2
        const y = height - barHeight
        return (
          <g key={i}>
            <rect x={`${x}%`} y={y} width={`${barW * 0.9}%`} height={barHeight}
              rx="2" fill={d.color ?? '#3B82F6'} opacity={0.85} className="transition-all duration-300" />
            {showValues && d.value > 0 && (
              <text x={`${x + barW * 0.45}%`} y={y - 3} textAnchor="middle" fontSize="5" fill="#6B7280">
                {d.value}{unit}
              </text>
            )}
            <text x={`${x + barW * 0.45}%`} y={height + 14} textAnchor="middle" fontSize="5" fill="#9CA3AF">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  fill?: boolean
}

export function LineChart({ data, color = '#3B82F6', height = 80, fill = true }: LineChartProps) {
  if (data.length < 2) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const W = 100, H = height

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((d.value - min) / range) * (H - 10) - 5,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaD = `${pathD} L${points[points.length-1].x},${H} L0,${H} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none" className="overflow-visible">
      {fill && <path d={areaD} fill={color} opacity={0.1} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
      ))}
      {data.map((d, i) => (
        <text key={i} x={points[i].x} y={H + 14} textAnchor="middle" fontSize="5" fill="#9CA3AF">{d.label}</text>
      ))}
    </svg>
  )
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
  size?: number
}

export function DonutChart({ data, size = 120 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumulative = 0
  const r = 45, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
        {data.map((d, i) => {
          const pct = d.value / total
          const offset = circumference * (1 - pct)
          const rotation = -90 + (cumulative / total) * 360
          cumulative += d.value
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth="16"
              strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
              strokeDashoffset={circumference * 0.25}
              transform={`rotate(${rotation - 90} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          )
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill="#1F2937">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-bold text-gray-900">{d.value}</span>
            <span className="text-gray-400">({Math.round(d.value / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
