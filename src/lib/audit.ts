import { getDB } from './firebase.js';
import { JwtPayload } from '../types/common.js';
import logger from './logger.js';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: string;
}

/**
 * Log an action for audit trail
 * Call this for sensitive operations (create, update, delete users, payments, etc.)
 */
export async function logAudit(
  user: JwtPayload | null,
  action: string,
  resource: string,
  resourceId: string,
  options?: {
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure';
    error?: string;
  }
): Promise<void> {
  try {
    const db = getDB();
    if (!db) {
      logger.warn('Audit: Database not available, logging to console only');
      return;
    }

    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.userId || 'anonymous',
      userEmail: user?.email || 'anonymous',
      action,
      resource,
      resourceId,
      oldValues: options?.oldValues,
      newValues: options?.newValues,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      status: options?.status || 'success',
      errorMessage: options?.error,
      timestamp: new Date().toISOString(),
    };

    // Store in Firestore
    await db.collection('audit_logs').doc(auditLog.id).set(auditLog);

    // Also log to application logger
    logger.info(`Audit: ${action} on ${resource} (${resourceId})`, {
      userId: auditLog.userId,
      status: auditLog.status,
      error: auditLog.errorMessage,
    });
  } catch (error) {
    logger.error('Failed to log audit trail:', error);
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getAuditLogs(
  resource: string,
  resourceId?: string,
  limit: number = 100
): Promise<AuditLog[]> {
  try {
    const db = getDB();
    if (!db) {
      return [];
    }

    let query = db.collection('audit_logs').where('resource', '==', resource);

    if (resourceId) {
      query = query.where('resourceId', '==', resourceId);
    }

    query = query.orderBy('timestamp', 'desc').limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get user activity logs
 */
export async function getUserActivityLogs(
  userId: string,
  limit: number = 100
): Promise<AuditLog[]> {
  try {
    const db = getDB();
    if (!db) {
      return [];
    }

    const query = db
      .collection('audit_logs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    logger.error('Failed to fetch user activity logs:', error);
    return [];
  }
}
