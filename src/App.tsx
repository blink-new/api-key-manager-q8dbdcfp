import { useState, useEffect, useCallback } from 'react'
import { blink } from './blink/client'
import { Header } from './components/Header'
import { ApiKeyGrid } from './components/ApiKeyGrid'
import { AddKeyDialog } from './components/AddKeyDialog'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'

export interface ApiKey {
  id: string
  userId: string
  name: string
  description?: string
  apiKey: string
  category: string
  serviceUrl?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
  isActive: boolean
  tags: string[]
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadApiKeys = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const keys = await blink.db.apiKeys.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      // Transform database records to match our interface
      const transformedKeys: ApiKey[] = keys.map(key => ({
        id: key.id,
        userId: key.userId,
        name: key.name,
        description: key.description || undefined,
        apiKey: key.apiKey,
        category: key.category,
        serviceUrl: key.serviceUrl || undefined,
        expiresAt: key.expiresAt || undefined,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        lastUsedAt: key.lastUsedAt || undefined,
        isActive: Number(key.isActive) > 0, // Convert SQLite boolean
        tags: JSON.parse(key.tags || '[]')
      }))
      
      setApiKeys(transformedKeys)
    } catch (error) {
      console.error('Failed to load API keys:', error)
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive'
      })
    }
  }, [user?.id, toast])

  // Load API keys when user is authenticated
  useEffect(() => {
    if (user?.id) {
      loadApiKeys()
    }
  }, [user?.id, loadApiKeys])

  const handleAddKey = async (keyData: Omit<ApiKey, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString()
      const newKey = {
        id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        name: keyData.name,
        description: keyData.description || null,
        apiKey: keyData.apiKey,
        category: keyData.category,
        serviceUrl: keyData.serviceUrl || null,
        expiresAt: keyData.expiresAt || null,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: keyData.lastUsedAt || null,
        isActive: keyData.isActive ? 1 : 0, // Convert boolean to SQLite integer
        tags: JSON.stringify(keyData.tags)
      }
      
      await blink.db.apiKeys.create(newKey)
      
      // Reload the keys to get the fresh data
      await loadApiKeys()
      setIsAddDialogOpen(false)
      
      toast({
        title: 'Success',
        description: 'API key added successfully'
      })
    } catch (error) {
      console.error('Failed to add API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to add API key',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    try {
      await blink.db.apiKeys.delete(keyId)
      
      // Reload the keys to get the fresh data
      await loadApiKeys()
      
      toast({
        title: 'Success',
        description: 'API key deleted successfully'
      })
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateKey = async (keyId: string, updates: Partial<ApiKey>) => {
    try {
      // Transform updates to match database schema
      const dbUpdates: any = {
        updatedAt: new Date().toISOString()
      }
      
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description || null
      if (updates.apiKey !== undefined) dbUpdates.apiKey = updates.apiKey
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.serviceUrl !== undefined) dbUpdates.serviceUrl = updates.serviceUrl || null
      if (updates.expiresAt !== undefined) dbUpdates.expiresAt = updates.expiresAt || null
      if (updates.lastUsedAt !== undefined) dbUpdates.lastUsedAt = updates.lastUsedAt || null
      if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive ? 1 : 0
      if (updates.tags !== undefined) dbUpdates.tags = JSON.stringify(updates.tags)
      
      await blink.db.apiKeys.update(keyId, dbUpdates)
      
      // Reload the keys to get the fresh data
      await loadApiKeys()
      
      toast({
        title: 'Success',
        description: 'API key updated successfully'
      })
    } catch (error) {
      console.error('Failed to update API key:', error)
      toast({
        title: 'Error',
        description: 'Failed to update API key',
        variant: 'destructive'
      })
    }
  }

  // Filter API keys based on search and category
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         key.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || key.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">API Key Manager</h1>
            <p className="text-muted-foreground mb-6">
              Securely store and manage your API keys with encryption and easy access control.
            </p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onAddKey={() => setIsAddDialogOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApiKeyGrid
          apiKeys={filteredKeys}
          onDeleteKey={handleDeleteKey}
          onUpdateKey={handleUpdateKey}
        />
      </main>

      <AddKeyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddKey={handleAddKey}
      />

      <Toaster />
    </div>
  )
}

export default App