import { Plus, Key } from 'lucide-react'
import { Button } from './ui/button'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Key className="w-12 h-12 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">No API keys found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        You haven't added any API keys yet. Start by adding your first API key to securely manage your integrations.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Your First API Key
        </Button>
        <Button variant="outline">
          Learn More
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="text-center p-6 bg-card rounded-lg border border-border">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 className="font-semibold text-foreground mb-2">Secure Storage</h4>
          <p className="text-sm text-muted-foreground">
            Your API keys are encrypted and stored securely with enterprise-grade security.
          </p>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border border-border">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h4 className="font-semibold text-foreground mb-2">Easy Organization</h4>
          <p className="text-sm text-muted-foreground">
            Organize your keys by categories, add descriptions, and tag them for quick access.
          </p>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border border-border">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-foreground mb-2">Access Control</h4>
          <p className="text-sm text-muted-foreground">
            Monitor usage, set expiration dates, and control access to your API keys.
          </p>
        </div>
      </div>
    </div>
  )
}