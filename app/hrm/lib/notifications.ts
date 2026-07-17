import "client-only"

import { toast } from "sonner"

export type NotificationOptions = {
  id?: string | number
  description?: string
}

function notificationId(action: string, subject: string) {
  return `${action}:${subject.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
}

function successMessage(
  action: "created" | "saved" | "updated" | "deleted",
  subject: string,
  options: NotificationOptions,
) {
  return toast.success(`${subject} ${action}.`, {
    id: options.id ?? notificationId(action, subject),
    description: options.description,
  })
}

export function notifyCreated(subject: string, options: NotificationOptions = {}) {
  return successMessage("created", subject, options)
}

export function notifySaved(subject: string, options: NotificationOptions = {}) {
  return successMessage("saved", subject, options)
}

export function notifyUpdated(subject: string, options: NotificationOptions = {}) {
  return successMessage("updated", subject, options)
}

export function notifyDeleted(subject: string, options: NotificationOptions = {}) {
  return successMessage("deleted", subject, options)
}

export function notifyFailed(message: string, options: NotificationOptions = {}) {
  return toast.error(message, {
    id: options.id ?? notificationId("failed", message),
    description: options.description,
  })
}

export function notifyInfo(message: string, options: NotificationOptions = {}) {
  return toast.info(message, {
    id: options.id ?? notificationId("info", message),
    description: options.description,
  })
}
