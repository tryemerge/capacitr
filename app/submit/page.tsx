"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useIdeas } from '@/lib/ideas-context'
import { useAuth } from '@/lib/auth-context'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Target,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  Check,
  X,
  Plus,
  Sparkles,
  Upload,
  File,
  Loader2,
  Wand2,
  Coins,
} from 'lucide-react'
import Link from 'next/link'

type Step = 'basics' | 'context' | 'review'

interface UploadedFile {
  name: string
  size: number
  type: string
  content?: string
}

interface Comparable {
  name: string
  url: string
  description: string
}

interface FormData {
  title: string
  pitch: string
  tokenTicker: string
  problemStatement: string
  targetCustomers: string
  comparables: Comparable[]
  businessModel: string
  marketSize: string
  briefsAndMemos: string
  tags: string[]
  uploadedFiles: UploadedFile[]
}

const availableTags = [
  'AI/ML', 'Developer Tools', 'B2B SaaS', 'Web3', 'DeFi', 'NFTs',
  'Marketplace', 'Fintech', 'Consumer', 'Enterprise', 'Infrastructure',
  'Healthcare', 'Climate', 'Gaming', 'Social', 'Creator Economy',
  'Ecommerce', 'Energy', 'Music', 'Investing',
]

const businessModels = [
  'SaaS subscription',
  'Marketplace transaction fees',
  'Freemium + premium',
  'Ad-supported',
  'Token-native economics',
  'Enterprise licensing',
  'Ecommerce',
  'Professional Services',
  'Custom / Other',
]

export default function SubmitIdeaPage() {
  const router = useRouter()
  const { submitIdea } = useIdeas()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('basics')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingField, setIsGeneratingField] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    pitch: '',
    tokenTicker: '',
    problemStatement: '',
    targetCustomers: '',
    comparables: [],
    businessModel: '',
    marketSize: '',
    briefsAndMemos: '',
    tags: [],
    uploadedFiles: [],
  })

  const [newComparable, setNewComparable] = useState<Comparable>({
    name: '',
    url: '',
    description: '',
  })

  const updateForm = (field: keyof FormData, value: string | string[] | Comparable[] | UploadedFile[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag].slice(0, 5),
    }))
  }

  const addComparable = () => {
    if (newComparable.name && formData.comparables.length < 5) {
      setFormData(prev => ({
        ...prev,
        comparables: [...prev.comparables, newComparable],
      }))
      setNewComparable({ name: '', url: '', description: '' })
    }
  }

  const removeComparable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      comparables: prev.comparables.filter((_, i) => i !== index),
    }))
  }

  // File upload handling
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    
    const newFiles: UploadedFile[] = []
    const allowedTypes = ['text/markdown', 'text/plain', 'application/pdf', 'text/csv', 'application/json', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
    const allowedExtensions = ['.md', '.txt', '.pdf', '.csv', '.json', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    
    Array.from(files).forEach(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (allowedTypes.includes(file.type) || allowedExtensions.includes(extension)) {
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || extension,
        })
      }
    })
    
    setFormData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles].slice(0, 10),
    }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // AI-powered analysis
  const analyzeAndAutoTag = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock AI-generated tags based on title and pitch
    const content = (formData.title + ' ' + formData.pitch).toLowerCase()
    const suggestedTags: string[] = []
    
    if (content.includes('ai') || content.includes('machine learning') || content.includes('llm')) {
      suggestedTags.push('AI/ML')
    }
    if (content.includes('developer') || content.includes('code') || content.includes('api')) {
      suggestedTags.push('Developer Tools')
    }
    if (content.includes('defi') || content.includes('blockchain') || content.includes('crypto') || content.includes('web3')) {
      suggestedTags.push('Web3', 'DeFi')
    }
    if (content.includes('saas') || content.includes('b2b') || content.includes('enterprise')) {
      suggestedTags.push('B2B SaaS')
    }
    if (content.includes('marketplace') || content.includes('platform')) {
      suggestedTags.push('Marketplace')
    }
    if (content.includes('fintech') || content.includes('payment') || content.includes('banking')) {
      suggestedTags.push('Fintech')
    }
    if (content.includes('health') || content.includes('medical')) {
      suggestedTags.push('Healthcare')
    }
    if (content.includes('climate') || content.includes('carbon') || content.includes('green')) {
      suggestedTags.push('Climate')
    }
    if (content.includes('game') || content.includes('gaming')) {
      suggestedTags.push('Gaming')
    }
    if (content.includes('social') || content.includes('community')) {
      suggestedTags.push('Social')
    }
    if (content.includes('creator') || content.includes('content')) {
      suggestedTags.push('Creator Economy')
    }
    if (content.includes('infrastructure') || content.includes('protocol')) {
      suggestedTags.push('Infrastructure')
    }
    
    // Default tags if none matched
    if (suggestedTags.length === 0) {
      suggestedTags.push('B2B SaaS', 'Infrastructure')
    }
    
    // Generate problem statement if empty
    let problemStatement = formData.problemStatement
    if (!problemStatement && formData.pitch) {
      problemStatement = `The market currently lacks an effective solution for ${formData.pitch.toLowerCase()}. Existing approaches are fragmented, expensive, or don't scale well. This creates friction for users and represents a significant opportunity for disruption.`
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...new Set(suggestedTags)].slice(0, 5),
      problemStatement,
    }))
    
    setIsAnalyzing(false)
  }

  // AI-powered field generation
  const generateFieldWithAI = async (field: string) => {
    setIsGeneratingField(field)
    
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const title = formData.title || 'this idea'
    const pitch = formData.pitch || ''
    
    switch (field) {
      case 'targetCustomers':
        updateForm('targetCustomers', `Primary target: Mid-market companies (100-1000 employees) in technology and finance sectors who are actively seeking solutions for ${pitch.toLowerCase() || 'innovation'}. Secondary: Early-stage startups looking to move fast and enterprise teams piloting new tools.`)
        break
      case 'businessModel':
        updateForm('businessModel', 'SaaS subscription')
        break
      case 'marketSize':
        updateForm('marketSize', `TAM: $15B+ based on adjacent market sizing. The ${formData.tags[0] || 'technology'} sector is growing at 25% CAGR. SAM: $2B addressable within 3 years. SOM: $200M realistic first market capture.`)
        break
      case 'problemStatement':
        updateForm('problemStatement', `The current landscape for ${title.toLowerCase()} is fragmented and inefficient. Users spend excessive time and resources on manual processes that could be automated. Existing solutions are either too expensive, too complex, or lack the integration capabilities needed for modern workflows. This creates a significant opportunity for a solution that is simple, powerful, and designed for the way teams actually work.`)
        break
      case 'comparables':
        const generatedComparables = [
          { name: 'Stripe', url: 'https://stripe.com', description: 'Market leader in payments infrastructure and developer tools' },
          { name: 'Plaid', url: 'https://plaid.com', description: 'Financial data connectivity platform' },
          { name: 'Figma', url: 'https://figma.com', description: 'Collaborative design tool that redefined the category' },
        ]
        const newComparables = [...formData.comparables, ...generatedComparables].slice(0, 5)
        setFormData(prev => ({ ...prev, comparables: newComparables }))
        break
      default:
        break
    }
    
    setIsGeneratingField(null)
  }

  // Generate ticker from title
  const generateTicker = () => {
    if (!formData.title) return
    
    const words = formData.title.split(' ')
      .filter(w => w.length > 2)
      .map(w => w.replace(/[^a-zA-Z]/g, '').toUpperCase())
    
    let ticker = ''
    if (words.length === 1) {
      ticker = words[0].slice(0, 4)
    } else if (words.length === 2) {
      ticker = words[0].slice(0, 2) + words[1].slice(0, 2)
    } else {
      ticker = words.slice(0, 4).map(w => w[0]).join('')
    }
    
    updateForm('tokenTicker', ticker.slice(0, 5))
  }

  const isBasicsComplete = formData.title && formData.pitch && formData.tokenTicker && formData.tags.length >= 1
  const isContextComplete = formData.targetCustomers || formData.businessModel || formData.problemStatement

  const handleSubmit = async () => {
    if (!user) return
    
    setIsSubmitting(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newId = submitIdea({
      title: formData.title,
      pitch: formData.pitch,
      problemStatement: formData.problemStatement,
      context: {
        targetCustomers: formData.targetCustomers,
        comparables: formData.comparables.length > 0 ? formData.comparables : undefined,
        businessModel: formData.businessModel,
        marketSize: formData.marketSize,
        briefsAndMemos: formData.briefsAndMemos,
      },
      status: 'draft',
      creatorId: user.id,
      creatorName: user.displayName || 'Anonymous',
      creatorAvatar: user.avatar,
      tokenSymbol: formData.tokenTicker,
      tags: formData.tags,
    })
    
    router.push(`/ideas/${newId}`)
  }

  const steps = [
    { id: 'basics', label: 'Basics', icon: Lightbulb, complete: isBasicsComplete },
    { id: 'context', label: 'Context', icon: Target, complete: isContextComplete },
    { id: 'review', label: 'Review', icon: Check, complete: false },
  ]

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-z500 hover:text-z700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-2">
            SUBMIT AN IDEA
          </h1>
          <p className="text-z600">
            Share your idea and let AI help you refine it. Upload docs, set your token ticker, and launch.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as Step)}
              className="flex items-center gap-2 flex-1"
              disabled={step.id === 'review' && !isBasicsComplete}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === step.id
                    ? 'bg-brand-green text-white'
                    : step.complete
                    ? 'bg-brand-green/20 text-brand-green'
                    : 'bg-z200 text-z500'
                }`}
              >
                {step.complete && currentStep !== step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  currentStep === step.id ? 'text-z800' : 'text-z500'
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-z300 ml-2" />
              )}
            </button>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 'basics' && (
          <Card className="bg-brand-canvas border-z200">
            <CardHeader>
              <CardTitle className="text-lg text-z800 normal-case flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-brand-orange" />
                The Basics
              </CardTitle>
              <CardDescription className="text-z500">
                Start with your idea title, pitch, and any supporting documents. AI will help with the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-z700">
                  Idea Title <span className="text-brand-orange">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., AI-Powered Code Review"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  maxLength={80}
                  className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400"
                />
                <p className="text-xs text-z400">{formData.title.length}/80 characters</p>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <Label htmlFor="pitch" className="text-z700">
                  One-Line Pitch <span className="text-brand-orange">*</span>
                </Label>
                <Input
                  id="pitch"
                  placeholder="e.g., Automated code review that learns from your team's patterns"
                  value={formData.pitch}
                  onChange={(e) => updateForm('pitch', e.target.value)}
                  maxLength={140}
                  className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400"
                />
                <p className="text-xs text-z400">{formData.pitch.length}/140 characters</p>
              </div>

              {/* Token Ticker */}
              <div className="space-y-2">
                <Label htmlFor="ticker" className="text-z700 flex items-center gap-2">
                  <Coins className="h-4 w-4 text-z500" />
                  Token Ticker <span className="text-brand-orange">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-z500 font-mono">$</span>
                    <Input
                      id="ticker"
                      placeholder="TICKER"
                      value={formData.tokenTicker}
                      onChange={(e) => updateForm('tokenTicker', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5))}
                      maxLength={5}
                      className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 font-mono uppercase pl-7"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateTicker}
                    disabled={!formData.title}
                    className="border-z300 text-z600 gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-z400">3-5 uppercase letters for your project token</p>
              </div>

              {/* AI Analysis Button */}
              {(formData.title || formData.pitch) && (
                <div className="p-4 bg-gradient-to-r from-brand-green/10 to-brand-orange/10 rounded-lg border border-z200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-z700 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-orange" />
                        AI-Powered Analysis
                      </p>
                      <p className="text-xs text-z500 mt-0.5">
                        Auto-generate tags and problem statement based on your idea
                      </p>
                    </div>
                    <Button
                      onClick={analyzeAndAutoTag}
                      disabled={isAnalyzing || (!formData.title && !formData.pitch)}
                      className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tags (shown after analysis or manually selectable) */}
              <div className="space-y-2">
                <Label className="text-z700 flex items-center gap-2">
                  Categories <span className="text-brand-orange">*</span>
                  {formData.tags.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-brand-green/10 text-brand-green border-brand-green/30">
                      {formData.tags.length} selected
                    </Badge>
                  )}
                </Label>
                <p className="text-xs text-z400">
                  Select at least 1 category (up to 5) <span className={formData.tags.length === 0 ? 'text-brand-orange' : 'text-brand-green'}>{formData.tags.length === 0 ? '- required' : ''}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-brand-green text-white'
                          : 'bg-z100 text-z600 hover:bg-z200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setCurrentStep('context')}
                  disabled={!isBasicsComplete}
                  className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                >
                  Continue to Context
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'context' && (
          <div className="space-y-6">
            <Card className="bg-brand-canvas border-z200">
              <CardHeader>
                <CardTitle className="text-lg text-z800 normal-case flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-orange" />
                  Add Context
                </CardTitle>
                <CardDescription className="text-z500">
                  Help contributors and investors understand your idea better. Use AI to help fill in fields.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Supporting Context Documents */}
                <div className="space-y-2">
                  <Label className="text-z700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-z500" />
                    Supporting Context Documents (optional)
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-brand-green bg-brand-green/5'
                        : 'border-z300 hover:border-z400'
                    }`}
                  >
                    <Upload className={`h-8 w-8 mx-auto mb-3 ${isDragging ? 'text-brand-green' : 'text-z400'}`} />
                    <p className="text-sm text-z600 mb-1">
                      Drag and drop files here, or{' '}
                      <label className="text-brand-green cursor-pointer hover:underline">
                        browse
                        <input
                          type="file"
                          multiple
                          accept=".md,.txt,.pdf,.csv,.json,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.svg"
                          onChange={(e) => handleFiles(e.target.files)}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-z400">
                      Supports documents (.md, .txt, .pdf, .doc) and images (.png, .jpg, .gif, .webp) - max 10 files
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {formData.uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {formData.uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg border border-z200">
                          <File className="h-4 w-4 text-z500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-z700 truncate">{file.name}</p>
                            <p className="text-xs text-z400">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="text-z400 hover:text-destructive p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="problem" className="text-z700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-z500" />
                      Problem Statement
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateFieldWithAI('problemStatement')}
                      disabled={isGeneratingField === 'problemStatement'}
                      className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                    >
                      {isGeneratingField === 'problemStatement' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="problem"
                    placeholder="Describe the problem you're solving. Who has this problem? Why is it important?"
                    value={formData.problemStatement}
                    onChange={(e) => updateForm('problemStatement', e.target.value)}
                    rows={5}
                    className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                  />
                </div>

                {/* Target Customers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customers" className="text-z700 flex items-center gap-2">
                      <Target className="h-4 w-4 text-z500" />
                      Target Customers
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateFieldWithAI('targetCustomers')}
                      disabled={isGeneratingField === 'targetCustomers'}
                      className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                    >
                      {isGeneratingField === 'targetCustomers' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="customers"
                    placeholder="Who has this problem? Describe your ideal user or customer segment."
                    value={formData.targetCustomers}
                    onChange={(e) => updateForm('targetCustomers', e.target.value)}
                    rows={3}
                    className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                  />
                </div>

                {/* Comparables */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-z700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-z500" />
                      Comparable Companies (up to 5)
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateFieldWithAI('comparables')}
                      disabled={isGeneratingField === 'comparables' || formData.comparables.length >= 5}
                      className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                    >
                      {isGeneratingField === 'comparables' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  
                  {formData.comparables.map((comp, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-brand-cream rounded-lg border border-z200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-z700">{comp.name}</p>
                        <p className="text-xs text-z500">{comp.description}</p>
                      </div>
                      <button
                        onClick={() => removeComparable(i)}
                        className="text-z400 hover:text-destructive p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {formData.comparables.length < 5 && (
                    <div className="space-y-2 p-3 bg-brand-cream rounded-lg border border-z200 border-dashed">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Company name"
                          value={newComparable.name}
                          onChange={(e) => setNewComparable(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white border-z300 text-z700 placeholder:text-z400"
                        />
                        <Input
                          placeholder="URL (optional)"
                          value={newComparable.url}
                          onChange={(e) => setNewComparable(prev => ({ ...prev, url: e.target.value }))}
                          className="bg-white border-z300 text-z700 placeholder:text-z400"
                        />
                      </div>
                      <Input
                        placeholder="Brief description"
                        value={newComparable.description}
                        onChange={(e) => setNewComparable(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white border-z300 text-z700 placeholder:text-z400"
                      />
                      <Button
                        onClick={addComparable}
                        disabled={!newComparable.name}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-z300 text-z600"
                      >
                        <Plus className="h-4 w-4" />
                        Add Comparable
                      </Button>
                    </div>
                  )}
                </div>

                {/* Business Model */}
                <div className="space-y-2">
                  <Label className="text-z700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-z500" />
                    Business Model
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {businessModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => updateForm('businessModel', formData.businessModel === model ? '' : model)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          formData.businessModel === model
                            ? 'bg-brand-green text-white'
                            : 'bg-brand-cream text-z600 hover:bg-z100 border border-z300'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Market Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="market" className="text-z700 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-z500" />
                      Market Size
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => generateFieldWithAI('marketSize')}
                      disabled={isGeneratingField === 'marketSize'}
                      className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                    >
                      {isGeneratingField === 'marketSize' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="market"
                    placeholder="e.g., TAM: $2.5B developer tools market, SAM: $500M, SOM: $50M"
                    value={formData.marketSize}
                    onChange={(e) => updateForm('marketSize', e.target.value)}
                    rows={2}
                    className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button
                    onClick={() => setCurrentStep('basics')}
                    variant="outline"
                    className="border-z300 text-z600 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('review')}
                    className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                  >
                    Review Submission
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <Card className="bg-brand-canvas border-z200">
              <CardHeader>
                <CardTitle className="text-lg text-z800 normal-case flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-orange" />
                  Review Your Idea
                </CardTitle>
                <CardDescription className="text-z500">
                  Make sure everything looks good before submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Card */}
                <div className="p-4 bg-brand-cream rounded-lg border border-z200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono bg-z300 text-z700 border-z400">
                      Draft
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono bg-brand-orange/10 text-brand-orange border-brand-orange/30">
                      ${formData.tokenTicker || 'TKN'}
                    </Badge>
                    {formData.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-base font-bold text-z800 mb-2 normal-case">
                    {formData.title || 'Untitled Idea'}
                  </h3>
                  <p className="text-sm text-z600 mb-4">
                    {formData.pitch || 'No pitch provided'}
                  </p>
                  
                  {formData.problemStatement && (
                    <div className="mt-4 pt-4 border-t border-z200">
                      <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2">Problem</p>
                      <p className="text-sm text-z600">{formData.problemStatement}</p>
                    </div>
                  )}

                  {formData.uploadedFiles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-z200">
                      <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2">
                        Attached Files ({formData.uploadedFiles.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.uploadedFiles.map((file, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-z100 text-z600 px-2 py-1 rounded">
                            <File className="h-3 w-3" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Context Summary */}
                {(formData.targetCustomers || formData.businessModel || formData.marketSize) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.targetCustomers && (
                      <div className="p-3 bg-brand-cream rounded-lg border border-z200">
                        <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Target Customers
                        </p>
                        <p className="text-sm text-z600 line-clamp-3">{formData.targetCustomers}</p>
                      </div>
                    )}
                    {formData.businessModel && (
                      <div className="p-3 bg-brand-cream rounded-lg border border-z200">
                        <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Business Model
                        </p>
                        <p className="text-sm text-z600">{formData.businessModel}</p>
                      </div>
                    )}
                    {formData.marketSize && (
                      <div className="p-3 bg-brand-cream rounded-lg border border-z200 md:col-span-2">
                        <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Market Size
                        </p>
                        <p className="text-sm text-z600">{formData.marketSize}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Comparables */}
                {formData.comparables.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Comparable Companies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.comparables.map((comp, i) => (
                        <span key={i} className="text-sm bg-z100 text-z600 px-3 py-1 rounded-lg">
                          {comp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex justify-between pt-4 border-t border-z200">
                  <Button
                    onClick={() => setCurrentStep('context')}
                    variant="outline"
                    className="border-z300 text-z600 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isBasicsComplete}
                    className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Submit Idea
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
