import { defineStore } from 'pinia'
import { Notify } from 'quasar'

export const useAlertStore = defineStore('alerts', () => {
  function addAlert({ color, message, icon, timeout, position, progress, onDismiss }) {
    const notifyOptions = {
      color,
      message,
      icon,
      position,
      timeout,
      progress,
    }

    // Adiciona onDismiss apenas se estiver definido
    if (onDismiss) {
      notifyOptions.onDismiss = onDismiss
    }

    Notify.create(notifyOptions)
  }

  return {
    addAlert,
  }
})
