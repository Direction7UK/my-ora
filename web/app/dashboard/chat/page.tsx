'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const queryClient = useQueryClient()

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => conversationId ? api.chat.getMessages(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
  })

  const sendMutation = useMutation({
    mutationFn: (msg: string) => api.chat.sendMessage(msg, conversationId),
    onSuccess: (data) => {
      setConversationId(data.conversationId)
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', data.conversationId] })
      setMessage('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMutation.mutate(message)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              Start a conversation by sending a message below
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sendMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">Thinking...</div>
            </div>
          )}
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-md"
              disabled={sendMutation.isPending}
            />
            <Button type="submit" disabled={sendMutation.isPending || !message.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}

