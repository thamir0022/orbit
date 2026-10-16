import * as React from 'react'

export function useCountdown(initialSeconds: number) {
  // Initialize the timer without a mount effect
  const [endTime, setEndTime] = React.useState<number | null>(() =>
    initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : null
  )

  const [timeLeft, setTimeLeft] = React.useState(() =>
    Math.max(0, initialSeconds)
  )

  const startTimer = React.useCallback((seconds: number) => {
    setEndTime(seconds > 0 ? Date.now() + seconds * 1000 : null)
    setTimeLeft(Math.max(0, seconds))
  }, [])

  // Update the countdown every second
  React.useEffect(() => {
    if (endTime === null) return

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))

      setTimeLeft(remaining)

      if (remaining === 0) {
        setEndTime(null)
      }
    }

    const intervalId = setInterval(tick, 1000)

    return () => clearInterval(intervalId)
  }, [endTime])

  // Reset the timer to the initial duration
  const resetTimer = React.useCallback(() => {
    startTimer(initialSeconds)
  }, [initialSeconds, startTimer])

  return {
    timeLeft,
    resetTimer,
    isActive: timeLeft > 0,
  }
}
