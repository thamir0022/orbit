import * as React from 'react'

export function useCountdown(initialSeconds: number) {
  // We store the exact timestamp when the timer should end
  const [endTime, setEndTime] = React.useState<number | null>(null)

  // We strictly use this state for UI rendering
  const [timeLeft, setTimeLeft] = React.useState(0)

  const startTimer = React.useCallback((seconds: number) => {
    setEndTime(Date.now() + seconds * 1000)
    setTimeLeft(seconds)
  }, [])

  // 1. Auto-start the timer on initial mount
  React.useEffect(() => {
    startTimer(initialSeconds)
  }, [initialSeconds, startTimer])

  // 2. The tick effect
  React.useEffect(() => {
    if (!endTime) return

    const tick = () => {
      const now = Date.now()
      // Calculate exactly how many seconds are left between now and the target end time
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))

      setTimeLeft(remaining)

      if (remaining === 0) {
        setEndTime(null) // Stop the timer logic once it hits 0
      }
    }

    // Run tick immediately so we don't wait 1000ms for the first UI update
    tick()

    // Set up the interval
    const intervalId = setInterval(tick, 1000)

    // Cleanup on unmount or when endTime changes
    return () => clearInterval(intervalId)
  }, [endTime])

  // 3. Expose a stable reset function
  const resetTimer = React.useCallback(() => {
    startTimer(initialSeconds)
  }, [initialSeconds, startTimer])

  return {
    timeLeft,
    resetTimer,
    isActive: timeLeft > 0,
  }
}
