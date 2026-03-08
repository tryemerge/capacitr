"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useIdeas } from "@/lib/ideas-context"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
} from "lucide-react"
import Link from "next/link"

import {
  comparableSchema,
} from "./schemas"
import { useSaveBasics, useSaveContext, useSubmitIdea } from "./hooks"
import { setCoverImage } from "@/lib/cover-image-store"
import { useGenerateAllContext, useGenerateField } from "@/hooks/use-generate-context"
import { useMutation } from "@tanstack/react-query"

// ---------------------------------------------------------------------------
// Full-form schema (union of basics + context)
// ---------------------------------------------------------------------------

const submitIdeaSchema = z.object({
  // Step 1 – Basics
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must be 80 characters or fewer"),
  pitch: z
    .string()
    .min(1, "Pitch is required")
    .max(140, "Pitch must be 140 characters or fewer"),
  tokenTicker: z
    .string()
    .min(3, "Ticker must be 3–5 uppercase letters")
    .max(5, "Ticker must be 3–5 uppercase letters")
    .regex(/^[A-Z]+$/, "Only uppercase letters allowed"),
  tags: z
    .array(z.string())
    .min(1, "Select at least 1 category")
    .max(5, "Select up to 5 categories"),

  // Step 2 – Context (all optional)
  problemStatement: z.string().max(2000).optional().default(""),
  targetCustomers: z.string().max(2000).optional().default(""),
  comparables: z.array(comparableSchema).max(5).optional().default([]),
  businessModel: z.string().optional().default(""),
  marketSize: z.string().max(2000).optional().default(""),
  briefsAndMemos: z.string().optional().default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
})

type SubmitIdeaFormValues = z.infer<typeof submitIdeaSchema>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Step = "basics" | "context" | "review"

const AVAILABLE_TAGS = [
  "AI/ML", "Developer Tools", "B2B SaaS", "Web3", "DeFi", "NFTs",
  "Marketplace", "Fintech", "Consumer", "Enterprise", "Infrastructure",
  "Healthcare", "Climate", "Gaming", "Social", "Creator Economy",
  "Ecommerce", "Energy", "Music", "Investing",
] as const

const BUSINESS_MODELS = [
  "SaaS subscription",
  "Marketplace transaction fees",
  "Freemium + premium",
  "Ad-supported",
  "Token-native economics",
  "Enterprise licensing",
  "Ecommerce",
  "Professional Services",
  "Custom / Other",
] as const

const ALLOWED_FILE_TYPES = [
  "text/markdown", "text/plain", "application/pdf", "text/csv",
  "application/json", "image/png", "image/jpeg", "image/gif",
  "image/webp", "image/svg+xml",
]

const ALLOWED_FILE_EXTENSIONS = [
  ".md", ".txt", ".pdf", ".csv", ".json", ".doc", ".docx",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchGeneratedTicker(
  title: string,
  pitch: string
): Promise<{ ticker: string; alternatives: string[] }> {
  const res = await fetch("/api/ai/generate-ticker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, pitch }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? "Failed to generate ticker")
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubmitIdeaPage() {
  const router = useRouter()
  const { submitIdea } = useIdeas()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState<Step>("basics")
  const [draftId, setDraftId] = useState<string | null>(null)
  const [onChainIdeaId, setOnChainIdeaId] = useState<string | null>(null)
  const [launchTxHash, setLaunchTxHash] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI generation hooks
  const generateAllContext = useGenerateAllContext()
  const generateField = useGenerateField()

  // Comparable inline form (not part of main schema until added)
  const [newComparable, setNewComparable] = useState<z.infer<typeof comparableSchema>>({
    name: "",
    url: "",
    description: "",
  })

  // ---- Mutation hooks (rule: mutation-callback-separation) ----
  const saveBasicsMutation = useSaveBasics()
  const saveContextMutation = useSaveContext()
  const submitIdeaMutation = useSubmitIdea()

  // ---- React Hook Form setup ----
  const form = useForm<SubmitIdeaFormValues>({
    resolver: zodResolver(submitIdeaSchema),
    defaultValues: {
      title: "",
      pitch: "",
      tokenTicker: "",
      tags: [],
      problemStatement: "",
      targetCustomers: "",
      comparables: [],
      businessModel: "",
      marketSize: "",
      briefsAndMemos: "",
      coverImageUrl: "",
    },
    mode: "onTouched",
  })

  const { control, setValue, getValues, trigger } = form

  // Watched values for reactive UI
  const title = useWatch({ control, name: "title" })
  const pitch = useWatch({ control, name: "pitch" })
  const tokenTicker = useWatch({ control, name: "tokenTicker" })
  const tags = useWatch({ control, name: "tags" })
  const comparables = useWatch({ control, name: "comparables" })

  const problemStatement = useWatch({ control, name: "problemStatement" })
  const targetCustomers = useWatch({ control, name: "targetCustomers" })
  const businessModel = useWatch({ control, name: "businessModel" })
  const marketSize = useWatch({ control, name: "marketSize" })

  // ---- Derived state ----
  const isBasicsComplete = Boolean(
    title && pitch && tokenTicker && (tags?.length ?? 0) >= 1,
  )
  const isContextComplete = Boolean(
    targetCustomers || businessModel || problemStatement,
  )

  // True when any step mutation is in-flight
  const isSaving =
    saveBasicsMutation.isPending ||
    saveContextMutation.isPending ||
    submitIdeaMutation.isPending

  // ---- Tag toggling ----
  const toggleTag = (tag: string) => {
    const current = getValues("tags")
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag].slice(0, 5)
    setValue("tags", next, { shouldValidate: true })
  }

  // ---- Comparables ----
  const addComparable = () => {
    const current = getValues("comparables") ?? []
    if (newComparable.name && current.length < 5) {
      setValue("comparables", [...current, newComparable])
      setNewComparable({ name: "", url: "", description: "" })
    }
  }

  const removeComparable = (index: number) => {
    const current = getValues("comparables") ?? []
    setValue(
      "comparables",
      current.filter((_, i) => i !== index),
    )
  }

  // ---- File staging (single image, uploaded to Vercel Blob on final submit) ----
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (!file.type.startsWith("image/")) return

      setPendingFiles([file])
    },
    [],
  )

  // Upload all pending files to Vercel Blob and return metadata with URLs
  const uploadPendingFiles = useCallback(async (): Promise<
    { name: string; size: number; type: string; url: string }[]
  > => {
    if (pendingFiles.length === 0) return []

    setIsUploading(true)
    try {
      const results = await Promise.all(
        pendingFiles.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error ?? `Failed to upload ${file.name}`)
          }

          const data = await res.json()
          return {
            name: data.name as string,
            size: data.size as number,
            type: data.type as string,
            url: data.url as string,
          }
        }),
      )
      return results
    } finally {
      setIsUploading(false)
    }
  }, [pendingFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // ---- AI analysis (Gemini) ----
  const analyzeAndAutoTag = () => {
    generateAllContext.mutate(
      { title, pitch },
      {
        onSuccess: (data) => {
          if (data.tags?.length) {
            setValue("tags", data.tags.slice(0, 5), { shouldValidate: true })
          }
          if (data.problemStatement && !getValues("problemStatement")) {
            setValue("problemStatement", data.problemStatement)
          }
          if (data.targetCustomers && !getValues("targetCustomers")) {
            setValue("targetCustomers", data.targetCustomers)
          }
          if (data.businessModel && !getValues("businessModel")) {
            setValue("businessModel", data.businessModel)
          }
          if (data.marketSize && !getValues("marketSize")) {
            setValue("marketSize", data.marketSize)
          }
          if (data.comparables?.length && !getValues("comparables")?.length) {
            setValue("comparables", data.comparables.slice(0, 5))
          }
        },
      }
    )
  }

  const isAnalyzing = generateAllContext.isPending

  // ---- AI field generation (Gemini) ----
  const isGeneratingField = generateField.isPending ? generateField.variables?.field ?? null : null

  const generateFieldWithAI = (field: string) => {
    const validFields = ["tags", "problemStatement", "targetCustomers", "comparables", "businessModel", "marketSize"] as const
    type ValidField = (typeof validFields)[number]
    if (!validFields.includes(field as ValidField)) return

    const currentTitle = getValues("title")
    const currentPitch = getValues("pitch")
    if (!currentTitle || !currentPitch) return

    generateField.mutate(
      {
        title: currentTitle,
        pitch: currentPitch,
        field: field as ValidField,
      },
      {
        onSuccess: (data) => {
          if (field === "tags" && data.tags?.length) {
            setValue("tags", data.tags.slice(0, 5), { shouldValidate: true })
          }
          if (field === "problemStatement" && data.problemStatement) {
            setValue("problemStatement", data.problemStatement)
          }
          if (field === "targetCustomers" && data.targetCustomers) {
            setValue("targetCustomers", data.targetCustomers)
          }
          if (field === "businessModel" && data.businessModel) {
            setValue("businessModel", data.businessModel)
          }
          if (field === "marketSize" && data.marketSize) {
            setValue("marketSize", data.marketSize)
          }
          if (field === "comparables" && data.comparables?.length) {
            const existing = getValues("comparables") ?? []
            setValue("comparables", [...existing, ...data.comparables].slice(0, 5))
          }
        },
      }
    )
  }

  // ---- Ticker generation (AI) ----
  const tickerMutation = useMutation({
    mutationFn: () => fetchGeneratedTicker(getValues("title"), getValues("pitch")),
  })

  const handleGenerateTicker = () => {
    const t = getValues("title")
    if (!t) return

    tickerMutation.mutate(undefined, {
      onSuccess: (data) => {
        setValue("tokenTicker", data.ticker, { shouldValidate: true })
      },
    })
  }

  // ---- Step navigation: validate → save via mutation → advance ----
  // Rule: mutation-prefer-mutate — use mutate() with callbacks, not mutateAsync()

  const handleBasicsNext = async () => {
    const valid = await trigger(["title", "pitch", "tokenTicker", "tags"])
    if (!valid) return

    const values = getValues()
    saveBasicsMutation.mutate(
      {
        draftId: draftId ?? undefined,
        title: values.title,
        pitch: values.pitch,
        tokenTicker: values.tokenTicker,
        tags: values.tags,
      },
      {
        onSuccess: (result) => {
          setDraftId(result.draftId)
          if (result.onChainIdeaId) setOnChainIdeaId(result.onChainIdeaId)
          if (result.txHash) setLaunchTxHash(result.txHash)
          setCurrentStep("context")
        },
      },
    )
  }

  const handleContextNext = () => {
    if (!draftId) return

    const values = getValues()
    saveContextMutation.mutate(
      {
        draftId,
        onChainIdeaId: onChainIdeaId ?? undefined,
        problemStatement: values.problemStatement,
        targetCustomers: values.targetCustomers,
        comparables: values.comparables,
        businessModel: values.businessModel,
        marketSize: values.marketSize,
        briefsAndMemos: values.briefsAndMemos,
        coverImageUrl: values.coverImageUrl,
      },
      {
        onSuccess: () => {
          setCurrentStep("review")
        },
      },
    )
  }

  const handleFinalSubmit = async () => {
    if (!user || !draftId) return

    const values = getValues()

    // Upload pending cover image to Vercel Blob
    let coverImageUrl = values.coverImageUrl ?? ""
    if (pendingFiles.length > 0) {
      try {
        const results = await uploadPendingFiles()
        if (results.length > 0) {
          coverImageUrl = results[0].url
        }
      } catch (err) {
        console.error("Image upload failed:", err)
        return // Don't submit if upload fails
      }
    }

    submitIdeaMutation.mutate(
      {
        draftId,
        title: values.title,
        pitch: values.pitch,
        tokenTicker: values.tokenTicker,
        tags: values.tags,
        problemStatement: values.problemStatement,
        targetCustomers: values.targetCustomers,
        comparables: values.comparables,
        businessModel: values.businessModel,
        marketSize: values.marketSize,
        briefsAndMemos: values.briefsAndMemos,
        coverImageUrl,
        txHash: launchTxHash ?? undefined,
      },
      {
        onSuccess: (result) => {
          // Also store in the local context (backward-compat with prototype)
          submitIdea({
            title: values.title,
            pitch: values.pitch,
            problemStatement: values.problemStatement ?? "",
            context: {
              targetCustomers: values.targetCustomers || undefined,
              comparables:
                (values.comparables?.length ?? 0) > 0
                  ? values.comparables
                  : undefined,
              businessModel: values.businessModel || undefined,
              marketSize: values.marketSize || undefined,
              briefsAndMemos: values.briefsAndMemos || undefined,
            },
            status: "draft",
            creatorId: user.id,
            creatorName: user.displayName || "Anonymous",
            creatorAvatar: user.avatar,
            tokenSymbol: values.tokenTicker,
            tags: values.tags,
          })

          // Store cover image URL keyed by on-chain idea ID
          const finalIdeaId = onChainIdeaId ?? result.ideaId
          if (coverImageUrl) {
            setCoverImage(finalIdeaId, coverImageUrl)
          }

          setPendingFiles([])
          router.push(`/ideas/${finalIdeaId}`)
        },
      },
    )
  }

  // Allow clicking step pills to navigate (validate first for forward steps)
  const goToStep = async (step: Step) => {
    if (step === "basics") {
      setCurrentStep("basics")
      return
    }
    if (step === "context" || step === "review") {
      const valid = await trigger(["title", "pitch", "tokenTicker", "tags"])
      if (!valid) return
      // If we haven't saved basics yet, persist them first
      if (!draftId) {
        handleBasicsNext()
        if (step === "review") {
          // will land on context; user has to click through
        }
        return
      }
      setCurrentStep(step)
    }
  }

  // ---- Step indicator data ----
  const steps = [
    {
      id: "basics" as const,
      label: "Basics",
      icon: Lightbulb,
      complete: isBasicsComplete,
    },
    {
      id: "context" as const,
      label: "Context",
      icon: Target,
      complete: isContextComplete,
    },
    { id: "review" as const, label: "Review", icon: Check, complete: false },
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
            Share your idea and let AI help you refine it. Upload docs, set your
            token ticker, and launch.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className="flex items-center gap-2 flex-1"
              type="button"
              disabled={step.id === "review" && !isBasicsComplete}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === step.id
                    ? "bg-brand-green text-white"
                    : step.complete
                      ? "bg-brand-green/20 text-brand-green"
                      : "bg-z200 text-z500"
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
                  currentStep === step.id ? "text-z800" : "text-z500"
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

        {/* --- Form wrapper (single form instance across all steps) --- */}
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* ======================== STEP 1: BASICS ======================== */}
            {currentStep === "basics" && (
              <Card className="bg-brand-canvas border-z200">
                <CardHeader>
                  <CardTitle className="text-lg text-z800 normal-case flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-brand-orange" />
                    The Basics
                  </CardTitle>
                  <CardDescription className="text-z500">
                    Start with your idea title, pitch, and any supporting
                    documents. AI will help with the rest.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-z700">
                          Idea Title{" "}
                          <span className="text-brand-orange">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., AI-Powered Code Review"
                            maxLength={80}
                            className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-z400">
                          {title.length}/80 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pitch */}
                  <FormField
                    control={control}
                    name="pitch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-z700">
                          One-Line Pitch{" "}
                          <span className="text-brand-orange">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Automated code review that learns from your team's patterns"
                            maxLength={140}
                            className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-z400">
                          {pitch.length}/140 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Token Ticker */}
                  <FormField
                    control={control}
                    name="tokenTicker"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-z700 flex items-center gap-2">
                          <Coins className="h-4 w-4 text-z500" />
                          Token Ticker{" "}
                          <span className="text-brand-orange">*</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-z500 font-mono">
                              $
                            </span>
                            <FormControl>
                              <Input
                                placeholder="TICKER"
                                maxLength={5}
                                className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 font-mono uppercase pl-7"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      .toUpperCase()
                                      .replace(/[^A-Z]/g, "")
                                      .slice(0, 5),
                                  )
                                }
                              />
                            </FormControl>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateTicker}
                            disabled={!title || tickerMutation.isPending}
                            className="border-z300 text-z600 gap-2"
                          >
                            {tickerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                            {tickerMutation.isPending ? "Generating…" : "Generate"}
                          </Button>
                        </div>
                        <FormDescription className="text-xs text-z400">
                          3-5 uppercase letters for your project token
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* AI Analysis Button */}
                  {(title || pitch) && (
                    <div className="p-4 bg-gradient-to-r from-brand-green/10 to-brand-orange/10 rounded-lg border border-z200">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-z700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-brand-orange" />
                            AI-Powered Analysis
                          </p>
                          <p className="text-xs text-z500 mt-0.5">
                            Auto-generate tags and problem statement based on
                            your idea
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={analyzeAndAutoTag}
                          disabled={isAnalyzing || !title || !pitch}
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

                  {/* Tags */}
                  <FormField
                    control={control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-z700 flex items-center gap-2">
                          Categories{" "}
                          <span className="text-brand-orange">*</span>
                          {(tags?.length ?? 0) > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-brand-green/10 text-brand-green border-brand-green/30"
                            >
                              {tags?.length ?? 0} selected
                            </Badge>
                          )}
                        </FormLabel>
                        <FormDescription className="text-xs text-z400">
                          Select at least 1 category (up to 5)
                        </FormDescription>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_TAGS.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                tags?.includes(tag)
                                  ? "bg-brand-green text-white"
                                  : "bg-z100 text-z600 hover:bg-z200"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mutation error */}
                  {saveBasicsMutation.isError && (
                    <p className="text-sm text-destructive">
                      Failed to save basics —{" "}
                      {saveBasicsMutation.error?.message ?? "please try again."}
                    </p>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={handleBasicsNext}
                      disabled={!isBasicsComplete || saveBasicsMutation.isPending}
                      className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                    >
                      {saveBasicsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          Continue to Context
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ======================== STEP 2: CONTEXT ======================== */}
            {currentStep === "context" && (
              <div className="space-y-6">
                <Card className="bg-brand-canvas border-z200">
                  <CardHeader>
                    <CardTitle className="text-lg text-z800 normal-case flex items-center gap-2">
                      <Target className="h-5 w-5 text-brand-orange" />
                      Add Context
                    </CardTitle>
                    <CardDescription className="text-z500">
                      Help contributors and investors understand your idea
                      better. Use AI to help fill in fields.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Supporting Context Documents */}
                    <div className="space-y-2">
                      <FormLabel className="text-z700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-z500" />
                        Cover Image (optional)
                      </FormLabel>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                        onChange={(e) => {
                          handleFiles(e.target.files)
                          e.target.value = ""
                        }}
                        className="hidden"
                      />

                      {pendingFiles.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`w-full border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                            isDragging
                              ? "border-brand-green bg-brand-green/5"
                              : "border-z300 hover:border-brand-green/50 hover:bg-brand-green/5"
                          }`}
                        >
                          <Upload
                            className={`h-8 w-8 mx-auto mb-3 ${isDragging ? "text-brand-green" : "text-z400"}`}
                          />
                          <p className="text-sm text-z600 mb-1">
                            Drag and drop an image here, or{" "}
                            <span className="text-brand-green font-medium hover:underline">
                              browse
                            </span>
                          </p>
                          <p className="text-xs text-z400">
                            Supports .png, .jpg, .gif, .webp, .svg
                          </p>
                        </button>
                      ) : (
                        <div className="relative border-2 border-dashed border-z200 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={URL.createObjectURL(pendingFiles[0])}
                              alt={pendingFiles[0].name}
                              className="h-16 w-16 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-z700 truncate">
                                {pendingFiles[0].name}
                              </p>
                              <p className="text-xs text-z400">
                                {formatFileSize(pendingFiles[0].size)}
                              </p>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-brand-green hover:underline mt-1"
                              >
                                Replace image
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(0)}
                              className="text-z400 hover:text-destructive p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Problem Statement */}
                    <FormField
                      control={control}
                      name="problemStatement"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-z700 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-z500" />
                              Problem Statement
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                generateFieldWithAI("problemStatement")
                              }
                              disabled={
                                isGeneratingField === "problemStatement"
                              }
                              className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                            >
                              {isGeneratingField === "problemStatement" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Generate with AI
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the problem you're solving. Who has this problem? Why is it important?"
                              rows={5}
                              className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Target Customers */}
                    <FormField
                      control={control}
                      name="targetCustomers"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-z700 flex items-center gap-2">
                              <Target className="h-4 w-4 text-z500" />
                              Target Customers
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                generateFieldWithAI("targetCustomers")
                              }
                              disabled={
                                isGeneratingField === "targetCustomers"
                              }
                              className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                            >
                              {isGeneratingField === "targetCustomers" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Generate with AI
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Who has this problem? Describe your ideal user or customer segment."
                              rows={3}
                              className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Comparables */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-z700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-z500" />
                          Comparable Companies (up to 5)
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => generateFieldWithAI("comparables")}
                          disabled={
                            isGeneratingField === "comparables" ||
                            (comparables?.length ?? 0) >= 5
                          }
                          className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                        >
                          {isGeneratingField === "comparables" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Generate with AI
                        </Button>
                      </div>

                      {comparables?.map((comp, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-3 bg-brand-cream rounded-lg border border-z200"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-z700">
                              {comp.name}
                            </p>
                            <p className="text-xs text-z500">
                              {comp.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeComparable(i)}
                            className="text-z400 hover:text-destructive p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {(comparables?.length ?? 0) < 5 && (
                        <div className="space-y-2 p-3 bg-brand-cream rounded-lg border border-z200 border-dashed">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Company name"
                              value={newComparable.name}
                              onChange={(e) =>
                                setNewComparable((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="bg-white border-z300 text-z700 placeholder:text-z400"
                            />
                            <Input
                              placeholder="URL (optional)"
                              value={newComparable.url}
                              onChange={(e) =>
                                setNewComparable((prev) => ({
                                  ...prev,
                                  url: e.target.value,
                                }))
                              }
                              className="bg-white border-z300 text-z700 placeholder:text-z400"
                            />
                          </div>
                          <Input
                            placeholder="Brief description"
                            value={newComparable.description}
                            onChange={(e) =>
                              setNewComparable((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="bg-white border-z300 text-z700 placeholder:text-z400"
                          />
                          <Button
                            type="button"
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
                    <FormField
                      control={control}
                      name="businessModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-z700 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-z500" />
                            Business Model
                          </FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {BUSINESS_MODELS.map((model) => (
                              <button
                                key={model}
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    field.value === model ? "" : model,
                                  )
                                }
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  field.value === model
                                    ? "bg-brand-green text-white"
                                    : "bg-brand-cream text-z600 hover:bg-z100 border border-z300"
                                }`}
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Market Size */}
                    <FormField
                      control={control}
                      name="marketSize"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-z700 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-z500" />
                              Market Size
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => generateFieldWithAI("marketSize")}
                              disabled={isGeneratingField === "marketSize"}
                              className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10 gap-1 h-7 text-xs"
                            >
                              {isGeneratingField === "marketSize" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              Generate with AI
                            </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., TAM: $2.5B developer tools market, SAM: $500M, SOM: $50M"
                              rows={2}
                              className="bg-brand-cream border-z300 focus:border-brand-green text-z700 placeholder:text-z400 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mutation error */}
                    {saveContextMutation.isError && (
                      <p className="text-sm text-destructive">
                        Failed to save context —{" "}
                        {saveContextMutation.error?.message ??
                          "please try again."}
                      </p>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep("basics")}
                        variant="outline"
                        className="border-z300 text-z600 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleContextNext}
                        disabled={saveContextMutation.isPending}
                        className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                      >
                        {saveContextMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            Review Submission
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ======================== STEP 3: REVIEW ======================== */}
            {currentStep === "review" && (
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
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider font-mono bg-z300 text-z700 border-z400"
                        >
                          Draft
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider font-mono bg-brand-orange/10 text-brand-orange border-brand-orange/30"
                        >
                          ${tokenTicker || "TKN"}
                        </Badge>
                        {tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-base font-bold text-z800 mb-2 normal-case">
                        {title || "Untitled Idea"}
                      </h3>
                      <p className="text-sm text-z600 mb-4">
                        {pitch || "No pitch provided"}
                      </p>

                      {problemStatement && (
                        <div className="mt-4 pt-4 border-t border-z200">
                          <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2">
                            Problem
                          </p>
                          <p className="text-sm text-z600">
                            {problemStatement}
                          </p>
                        </div>
                      )}

                      {pendingFiles.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-z200">
                          <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2">
                            Cover Image
                          </p>
                          <img
                            src={URL.createObjectURL(pendingFiles[0])}
                            alt={pendingFiles[0].name}
                            className="h-20 w-20 rounded-lg object-cover border border-z200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Context Summary */}
                    {(targetCustomers || businessModel || marketSize) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {targetCustomers && (
                          <div className="p-3 bg-brand-cream rounded-lg border border-z200">
                            <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Target Customers
                            </p>
                            <p className="text-sm text-z600 line-clamp-3">
                              {targetCustomers}
                            </p>
                          </div>
                        )}
                        {businessModel && (
                          <div className="p-3 bg-brand-cream rounded-lg border border-z200">
                            <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              Business Model
                            </p>
                            <p className="text-sm text-z600">
                              {businessModel}
                            </p>
                          </div>
                        )}
                        {marketSize && (
                          <div className="p-3 bg-brand-cream rounded-lg border border-z200 md:col-span-2">
                            <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Market Size
                            </p>
                            <p className="text-sm text-z600">{marketSize}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comparables */}
                    {(comparables?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-medium text-z500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Comparable Companies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {comparables?.map((comp, i) => (
                            <span
                              key={i}
                              className="text-sm bg-z100 text-z600 px-3 py-1 rounded-lg"
                            >
                              {comp.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mutation error */}
                    {submitIdeaMutation.isError && (
                      <p className="text-sm text-destructive">
                        Submission failed —{" "}
                        {submitIdeaMutation.error?.message ??
                          "please try again."}
                      </p>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-between pt-4 border-t border-z200">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep("context")}
                        variant="outline"
                        className="border-z300 text-z600 gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={handleFinalSubmit}
                        disabled={
                          submitIdeaMutation.isPending || isUploading || !isBasicsComplete
                        }
                        className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading files…
                          </>
                        ) : submitIdeaMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting…
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
          </form>
        </Form>
      </main>
    </div>
  )
}
