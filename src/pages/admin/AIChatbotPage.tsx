import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, RefreshCw, Zap } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_PROMPTS = [
  'Chó Golden Retriever nên tắm bao lâu 1 lần?',
  'Mèo bị rụng lông nhiều có cần lo không?',
  'Thức ăn nào phù hợp cho chó con dưới 3 tháng?',
  'Cách huấn luyện chó đi vệ sinh đúng chỗ?',
  'Bệnh parvo là gì? Làm sao phòng ngừa?',
]

const AI_RESPONSES: Record<string, string> = {
  default: 'Cảm ơn câu hỏi của bạn! Tôi là PetCare AI Assistant, chuyên tư vấn về sức khỏe và chăm sóc thú cưng. Để trả lời chính xác hơn, bạn có thể cho biết thêm về loài và độ tuổi của thú cưng không?',
  tắm: '🛁 **Tần suất tắm thú cưng:**\n\n**Chó:**\n- Chó ngắn lông: 4–6 tuần/lần\n- Chó dài lông: 2–4 tuần/lần\n- Golden Retriever: 4–6 tuần là lý tưởng\n\nLưu ý: Không tắm quá thường xuyên vì làm mất dầu tự nhiên trên da. Dùng dầu gội chuyên cho thú cưng, tránh dầu người.',
  rụng: '🐾 **Mèo rụng lông là bình thường**, đặc biệt theo mùa. Tuy nhiên cần chú ý khi:\n\n❗ Rụng lông thành từng mảng (có thể do nấm, ve)\n❗ Da đỏ, ngứa, có vảy\n❗ Rụng quá nhiều kết hợp mệt mỏi\n\n**Giải pháp:** Chải lông 2–3 lần/tuần, bổ sung Omega-3, vệ sinh môi trường sống thường xuyên.',
  thức: '🍽️ **Dinh dưỡng chó con < 3 tháng:**\n\nNếu còn bú mẹ: duy trì sữa mẹ đến 6–8 tuần.\n\nKhi cai sữa:\n- **Pate ướt** dành cho chó con (có nhãn "Puppy/Junior")\n- **Kibble ngâm nước ấm** cho mềm dễ nhai\n- **Sữa dành riêng cho chó** (không phải sữa bò)\n\nBrand phù hợp: Royal Canin Starter, Pedigree Puppy.',
  parvo: '⚕️ **Bệnh Parvo (Parvovirus):**\n\nBệnh virus nguy hiểm, lây qua phân, tỷ lệ tử vong cao nếu không điều trị kịp thời.\n\n**Triệu chứng:** Nôn, tiêu chảy ra máu, mất nước, lờ đờ.\n\n**Phòng ngừa:** Tiêm vaccine lúc 6, 9, 12 tuần tuổi, sau đó nhắc lại hàng năm.\n\n🚨 Khi phát hiện triệu chứng — đưa đến bác sĩ thú y NGAY lập tức!',
  huấn: '🏡 **Huấn luyện chó đi vệ sinh đúng chỗ:**\n\n1. **Chọn vị trí cố định** — miếng lót vệ sinh hoặc một góc ngoài trời\n2. **Quan sát dấu hiệu** — ngửi đất, xoay vòng, khựng lại\n3. **Đưa chó đến đúng chỗ** ngay khi thấy dấu hiệu\n4. **Khen thưởng ngay** khi chó đi đúng (treat + lời khen)\n5. **Không phạt** khi chó đi sai — chỉ dọn dẹp và nhẹ nhàng nhắc lại\n\nKiên trì 2–3 tuần là có kết quả!',
}

function getAIResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase()
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) return val
  }
  return AI_RESPONSES.default
}

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '🐾 Xin chào! Tôi là **PetCare AI Assistant** — trợ lý tư vấn chăm sóc thú cưng. Tôi có thể giúp bạn về:\n\n• Dinh dưỡng và thức ăn\n• Sức khỏe và bệnh thú y\n• Chăm sóc lông, móng, tai\n• Huấn luyện hành vi\n• Tư vấn giống phù hợp\n\nHãy đặt câu hỏi!', timestamp: '08:00' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send(text?: string) {
    const msg = text ?? input.trim()
    if (!msg) return
    setInput('')
    const ts = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: ts }])
    setTyping(true)
    setTimeout(() => {
      const reply = getAIResponse(msg)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: ts }])
      setTyping(false)
    }, 1200 + Math.random() * 800)
  }

  function renderContent(content: string) {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mb-1">{line.slice(2, -2)}</p>
      if (line.startsWith('• ')) return <li key={i} className="ml-3 list-disc">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>
      if (line.match(/^\d\./)) return <li key={i} className="ml-3 list-decimal">{line.replace(/^\d\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className={line === '' ? 'my-1' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">PetCare AI Assistant</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-500">Online · Phản hồi trong vài giây</span>
          </div>
        </div>
        <button onClick={() => setMessages([{ id: '0', role: 'assistant', content: '🐾 Hội thoại mới. Tôi có thể giúp gì cho bạn?', timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }])}
          className="ml-auto btn-secondary text-sm py-1.5">
          <RefreshCw size={13} /> Cuộc trò chuyện mới
        </button>
      </div>

      {/* Chat window */}
      <div className="card">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary-100' : 'bg-gray-100'}`}>
                {msg.role === 'assistant' ? <Bot size={14} className="text-primary-600" /> : <User size={14} className="text-gray-600" />}
              </div>
              <div className={`max-w-xs md:max-w-sm lg:max-w-md ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-primary-500 text-white rounded-tr-none'}`}>
                  <div className={`space-y-0.5 ${msg.role === 'user' ? '' : ''}`}>
                    {renderContent(msg.content)}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-primary-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-3 border-t overflow-x-auto">
          <div className="flex gap-2">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => send(p)}
                className="shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 border hover:border-primary-300 rounded-full text-xs text-gray-600 hover:text-primary-700 transition-colors">
                {p.length > 30 ? p.slice(0, 30) + '...' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t flex items-center gap-3">
          <input
            className="flex-1 bg-gray-50 border-none outline-none px-4 py-2.5 rounded-xl text-sm"
            placeholder="Hỏi về sức khỏe, chăm sóc thú cưng..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <button onClick={() => send()} disabled={!input.trim() || typing}
            className="w-10 h-10 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors">
            <Send size={15} />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        ⚠️ AI có thể mắc lỗi. Với vấn đề sức khỏe nghiêm trọng, hãy luôn tham khảo bác sĩ thú y.
      </p>
    </div>
  )
}
