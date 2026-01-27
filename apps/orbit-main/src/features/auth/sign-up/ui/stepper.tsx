import React, {
  useState,
  Children,
  useRef,
  useEffect,
  HTMLAttributes,
  ReactNode,
  useLayoutEffect,
} from 'react'
import { motion, AnimatePresence, Variants } from 'motion/react'
import { cn } from '@orbit/lib/utils'

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  currentStep: number
  stepContainerClassName?: string
}

export default function Stepper({
  children,
  currentStep,
  stepContainerClassName = '',
  className,
  ...rest
}: StepperProps) {
  const prevStepRef = useRef(currentStep)
  const direction =
    currentStep > prevStepRef.current
      ? 1
      : currentStep < prevStepRef.current
        ? -1
        : 0

  useEffect(() => {
    prevStepRef.current = currentStep
  }, [currentStep])

  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = currentStep > totalSteps

  return (
    <div
      className={cn(
        'flex min-h-full flex-1 flex-col items-center justify-center sm:aspect-4/3 md:aspect-2/1',
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-md rounded-4xl',
          stepContainerClassName
        )}
      >
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>
      </div>
    </div>
  )
}

interface StepContentWrapperProps {
  isCompleted: boolean
  currentStep: number
  direction: number
  children: ReactNode
  className?: string
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = '',
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0)

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface SlideTransitionProps {
  children: ReactNode
  direction: number
  onHeightReady: (height: number) => void
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    // 1. Measure immediately on mount/update
    onHeightReady(element.offsetHeight)

    // 2. Create a ResizeObserver to watch for dynamic changes (like error messages)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        onHeightReady(entry.contentRect.height)
      }
    })

    // 3. Start observing
    resizeObserver.observe(element)

    // 4. Cleanup
    return () => resizeObserver.disconnect()
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  )
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-50%' : '50%',
    opacity: 0,
  }),
}

export function Step({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('w-full px-8 py-4', className)}>{children}</div>
}
