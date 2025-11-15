'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WorkHistoryItem {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string | null
  bullets: string[]
}

export default function WorkHistoryManager({ workHistory }: { workHistory: WorkHistoryItem[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    bullet1: '',
    bullet2: '',
    bullet3: ''
  })

  const handleAdd = async () => {
    const bullets = [newItem.bullet1, newItem.bullet2, newItem.bullet3].filter(b => b.trim())
    
    const response = await fetch('/api/work-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newItem.title,
        company: newItem.company,
        startDate: newItem.startDate,
        endDate: newItem.endDate || null,
        bullets
      })
    })

    if (response.ok) {
      setNewItem({ title: '', company: '', startDate: '', endDate: '', bullet1: '', bullet2: '', bullet3: '' })
      setShowForm(false)
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/work-history/${id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      router.refresh()
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Work History</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 mb-4 bg-neutral-50">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newItem.company}
                  onChange={(e) => setNewItem({ ...newItem, company: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  value={newItem.startDate}
                  onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                  placeholder="Jan 2023"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  value={newItem.endDate}
                  onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
            </div>
            <div>
              <Label>Bullet Points (up to 3)</Label>
              <Input
                value={newItem.bullet1}
                onChange={(e) => setNewItem({ ...newItem, bullet1: e.target.value })}
                placeholder="Bullet point 1"
                className="mb-2"
              />
              <Input
                value={newItem.bullet2}
                onChange={(e) => setNewItem({ ...newItem, bullet2: e.target.value })}
                placeholder="Bullet point 2"
                className="mb-2"
              />
              <Input
                value={newItem.bullet3}
                onChange={(e) => setNewItem({ ...newItem, bullet3: e.target.value })}
                placeholder="Bullet point 3"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Add</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {workHistory.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.company}</p>
                <p className="text-xs text-neutral-500 mb-2">
                  {item.startDate} - {item.endDate || 'Present'}
                </p>
                {item.bullets.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-neutral-600">
                    {item.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
