import { useState } from 'react'
import { Copy, Eye, EyeOff, MoreVertical, Edit, Trash2, ExternalLink, Calendar, Clock } from 'lucide-react'
import { ApiKey } from '../App'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useToast } from '../hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface ApiKeyCardProps {
  apiKey: ApiKey
  onDelete: (keyId: string) => void
  onUpdate: (keyId: string, updates: Partial<ApiKey>) => void
}

const categoryColors = {
  ai: 'bg-purple-100 text-purple-800 border-purple-200',
  payment: 'bg-green-100 text-green-800 border-green-200',
  email: 'bg-blue-100 text-blue-800 border-blue-200',
  database: 'bg-orange-100 text-orange-800 border-orange-200',
  analytics: 'bg-pink-100 text-pink-800 border-pink-200',
  social: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200'
}

export function ApiKeyCard({ apiKey, onDelete, onUpdate }: ApiKeyCardProps) {
  const [isKeyVisible, setIsKeyVisible] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      })
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const getExpiryStatus = () => {
    if (!apiKey.expiresAt) return null
    
    const expiryDate = new Date(apiKey.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', text: 'Expired' }
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'text-red-600', text: `Expires in ${daysUntilExpiry} days` }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'text-amber-600', text: `Expires in ${daysUntilExpiry} days` }
    }
    
    return { status: 'good', color: 'text-green-600', text: `Expires in ${daysUntilExpiry} days` }
  }

  const expiryStatus = getExpiryStatus()

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{apiKey.name}</h3>
              <Badge 
                variant="outline" 
                className={`text-xs ${categoryColors[apiKey.category as keyof typeof categoryColors] || categoryColors.general}`}
              >
                {apiKey.category}
              </Badge>
            </div>
            {apiKey.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{apiKey.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate(apiKey.id, { isActive: !apiKey.isActive })}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${apiKey.isActive ? 'bg-red-500' : 'bg-green-500'}`} />
                  {apiKey.isActive ? 'Deactivate' : 'Activate'}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(apiKey.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* API Key Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">API Key</span>
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                    >
                      {isKeyVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isKeyVisible ? 'Hide key' : 'Show key'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(apiKey.apiKey)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Copy to clipboard
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="bg-muted rounded-md p-2 font-mono text-sm break-all overflow-hidden">
            <div className="break-words overflow-wrap-anywhere">
              {isKeyVisible ? apiKey.apiKey : maskApiKey(apiKey.apiKey)}
            </div>
          </div>
        </div>

        {/* Service URL */}
        {apiKey.serviceUrl && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service URL</span>
            <a 
              href={apiKey.serviceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <span className="truncate max-w-[120px]">{new URL(apiKey.serviceUrl).hostname}</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}

        {/* Status and Expiry */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-muted-foreground">
              {apiKey.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {expiryStatus && (
            <div className={`flex items-center space-x-1 ${expiryStatus.color}`}>
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{expiryStatus.text}</span>
            </div>
          )}
        </div>

        {/* Last Used */}
        {apiKey.lastUsedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last used</span>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {apiKey.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {apiKey.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}