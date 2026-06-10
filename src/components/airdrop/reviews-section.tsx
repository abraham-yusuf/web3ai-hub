"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, ThumbsUp, Loader2 } from "lucide-react"

interface ReviewUser {
  id: string
  name: string | null
  image: string | null
  username: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  helpful: number
  createdAt: string
  user: ReviewUser | null
}

interface ReviewsResponse {
  reviews: Review[]
  summary: {
    total: number
    average: number
    distribution: Record<number, number>
  }
}

interface ReviewsSectionProps {
  airdropId: string
  isLoggedIn?: boolean
  userId?: string
}

function StarRating({
  rating,
  onChange,
  interactive = false,
}: {
  rating: number
  onChange?: (rating: number) => void
  interactive?: boolean
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({
  airdropId,
  onSubmit,
  onCancel,
}: {
  airdropId: string
  onSubmit: () => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, using a mock userId
  // In production, this should come from the session
  const userId = "demo-user"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/airdrop/${airdropId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit review")
      }

      setRating(0)
      setComment("")
      onSubmit()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Rating</label>
        <StarRating rating={rating} onChange={setRating} interactive />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this airdrop..."
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function ReviewsSection({ airdropId, isLoggedIn = false, userId }: ReviewsSectionProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/airdrop/${airdropId}/reviews`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [airdropId])

  async function voteHelpful(reviewId: string) {
    setVotingId(reviewId)
    try {
      const res = await fetch(`/api/airdrop/${airdropId}/reviews/${reviewId}/helpful`, {
        method: "POST",
      })
      if (res.ok) {
        // Refresh reviews to show updated count
        fetchReviews()
      }
    } catch (err) {
      console.error("Failed to vote:", err)
    } finally {
      setVotingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const { reviews, summary } = data || { reviews: [], summary: { total: 0, average: 0, distribution: {} } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reviews ({summary.total})</h2>
        {isLoggedIn && !showForm && (
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            Write Review
          </Button>
        )}
      </div>

      {summary.total > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{summary.average}</p>
            <StarRating rating={Math.round(summary.average)} />
            <p className="text-sm text-muted-foreground">{summary.total} reviews</p>
          </div>
          <div className="flex gap-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{star}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${summary.total > 0 ? (summary.distribution[star] / summary.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {summary.distribution[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ReviewForm
          airdropId={airdropId}
          onSubmit={() => {
            setShowForm(false)
            fetchReviews()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {reviews.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No reviews yet</p>
          {isLoggedIn && (
            <Button
              variant="link"
              onClick={() => setShowForm(true)}
              className="mt-2"
            >
              Be the first to write a review
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {review.user?.name?.[0] || review.user?.username?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium">
                    {review.user?.name || review.user?.username || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => voteHelpful(review.id)}
                disabled={votingId === review.id}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                {votingId === review.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>Helpful ({review.helpful})</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}