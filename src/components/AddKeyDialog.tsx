import { useState } from 'react'
import { ApiKey } from '../App'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { X, Plus } from 'lucide-react'

interface AddKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddKey: (keyData: Omit<ApiKey, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

const categories = [
  { value: 'ai', label: 'AI & ML' },
  { value: 'payment', label: 'Payment' },
  { value: 'email', label: 'Email' },
  { value: 'database', label: 'Database' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'social', label: 'Social' },
  { value: 'general', label: 'General' }
]

export function AddKeyDialog({ open, onOpenChange, onAddKey }: AddKeyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    apiKey: '',
    category: 'general',
    serviceUrl: '',
    expiresAt: ''
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.apiKey.trim()) return

    setIsSubmitting(true)
    
    try {
      await onAddKey({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        apiKey: formData.apiKey.trim(),
        category: formData.category,
        serviceUrl: formData.serviceUrl.trim() || undefined,
        expiresAt: formData.expiresAt || undefined,
        lastUsedAt: undefined,
        isActive: true,
        tags
      })
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        apiKey: '',
        category: 'general',
        serviceUrl: '',
        expiresAt: ''
      })
      setTags([])
      setNewTag('')
    } catch (error) {
      console.error('Failed to add API key:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New API Key</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., OpenAI API, Stripe Payment"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this API key is used for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Textarea
              id="apiKey"
              placeholder="Paste your API key here..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              rows={3}
              className="font-mono text-sm"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service URL */}
          <div className="space-y-2">
            <Label htmlFor="serviceUrl">Service URL</Label>
            <Input
              id="serviceUrl"
              type="url"
              placeholder="https://api.example.com"
              value={formData.serviceUrl}
              onChange={(e) => setFormData({ ...formData, serviceUrl: e.target.value })}
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date</Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add API Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}