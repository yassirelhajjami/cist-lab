import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-navy-dark text-white p-8">
      <h1 className="text-xl font-bold mb-4 uppercase tracking-wider text-gold-accent">Supabase Todo Verification</h1>
      <ul className="space-y-2">
        {todos?.map((todo: any) => (
          <li key={todo.id} className="bg-navy-deep p-3 rounded-lg border border-navy-light/20 font-mono text-xs">
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <p className="text-xs text-gray-400 italic">No todos found in 'todos' table.</p>
        )}
      </ul>
    </div>
  )
}
