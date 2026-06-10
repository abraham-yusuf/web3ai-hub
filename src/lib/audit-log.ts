/**
 * Lightweight audit logging for admin actions and security events.
 *
 * Development: outputs to console with structured formatting.
 * Production: writes to both console AND AdminActivity database table.
 */

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

type AuditLevel = "info" | "warn" | "error"

interface AuditEntry {
  timestamp: string
  level: AuditLevel
  action: string
  actor: string
  actorId?: string
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
  userAgent?: string
}

let isConsoleOnly = false

/**
 * Set to true to disable DB writes (useful in read-only migrations or tests).
 */
export function setAuditConsoleOnly(value: boolean): void {
  isConsoleOnly = value
}

/**
 * Log an audit event.
 *
 * @param action - Action descriptor (e.g. "post.create", "admin.login", "airdrop.delete")
 * @param actor - Who performed the action (email, username, or "anonymous")
 * @param resource - Resource type (e.g. "Post", "Airdrop", "AITool")
 * @param options - Additional context
 */
export async function auditLog(
  action: string,
  actor: string,
  resource: string,
  options?: {
    level?: AuditLevel
    actorId?: string
    resourceId?: string
    details?: Record<string, unknown>
    ip?: string
    userAgent?: string
  },
): Promise<void> {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    level: options?.level ?? "info",
    action,
    actor,
    actorId: options?.actorId,
    resource,
    resourceId: options?.resourceId,
    details: options?.details,
    ip: options?.ip,
    userAgent: options?.userAgent,
  }

  const prefix = entry.level === "error" ? "🔴" : entry.level === "warn" ? "🟡" : "🟢"

  if (entry.level === "error" || entry.level === "warn") {
    console.warn(`${prefix} [AUDIT] ${entry.action}`, {
      actor: entry.actor,
      resource: entry.resource,
      resourceId: entry.resourceId,
      ip: entry.ip,
      ...entry.details,
    })
  } else {
    console.info(`${prefix} [AUDIT] ${entry.action}`, {
      actor: entry.actor,
      resource: entry.resource,
      resourceId: entry.resourceId,
      ip: entry.ip,
    })
  }

  // Persist to DB in production (unless disabled)
  if (!isConsoleOnly && entry.actorId) {
    try {
      await prisma.adminActivity.create({
        data: {
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId ?? "",
          actorId: entry.actorId,
          actorEmail: entry.actor,
          ip: entry.ip ?? null,
          userAgent: entry.userAgent ?? null,
          metadata: (entry.details ?? {}) as Prisma.InputJsonValue,
        },
      })
    } catch (err) {
      // Non-fatal: don't break the request if DB write fails
      console.error("[AUDIT] Failed to write to DB:", err)
    }
  }
}

/**
 * Shorthand for logging admin security events.
 */
export function securityLog(
  action: string,
  actor: string,
  options?: {
    actorId?: string
    ip?: string
    userAgent?: string
    details?: Record<string, unknown>
  },
): void {
  const prefix = "🟡"
  console.warn(`${prefix} [SECURITY] ${action}`, {
    actor,
    ip: options?.ip,
    ...options?.details,
  })
}

/**
 * Get recent admin activity (for admin dashboard).
 */
export async function getRecentActivity(limit = 50, resource?: string) {
  return prisma.adminActivity.findMany({
    where: resource ? { resource } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}