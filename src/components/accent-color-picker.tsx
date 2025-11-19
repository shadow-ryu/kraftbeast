'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface AccentColorPickerProps {
  initialColor: string
  onSave: (color: string) => Promise<void>
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
]

export function AccentColorPicker({ initialColor, onSave }: AccentColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [customColor, setCustomColor] = useState(initialColor)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedColor)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Preset Colors</Label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setSelectedColor(color.value)}
              className={`h-10 rounded-lg border-2 transition-all ${
                selectedColor === color.value
                  ? 'border-neutral-900 scale-110'
                  : 'border-neutral-200 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="customColor">Custom Color</Label>
        <div className="flex gap-2 mt-2">
          <input
            id="customColor"
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value)
              setSelectedColor(e.target.value)
            }}
            className="h-10 w-20 rounded-lg border border-neutral-300 cursor-pointer"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="#3b82f6"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-lg border-2 border-neutral-200"
          style={{ backgroundColor: selectedColor }}
        />
        <div className="flex-1">
          <p className="text-sm font-medium">Preview</p>
          <p className="text-xs text-neutral-600">{selectedColor}</p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? 'Saving...' : 'Save Accent Color'}
      </Button>
    </div>
  )
}
