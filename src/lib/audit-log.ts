/**
 * Lightweight audit logging for admin actions and security events.
 *
 * In development: outputs to console with structured formatting.
 * In production: replace console calls with a proper logging service
 * (Sentry, Datadog, LogDrain, etc.) or write to an AuditLog database table.
 */

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

/**
 * Log an audit event.
 *
 * @param action - Action descriptor (e.g., "post.create", "admin.login", "airdrop.delete")
 * @param actor - Who performed the action (email, username, or "anonymous")
 * @param resource - Resource type (e.g., "Post", "Airdrop", "AITool")
 * @param options - Additional context
 */
export function auditLog(
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
): void {
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
  auditLog(action, actor, "Security", {
    level: "warn",
    ...options,
  })
}
