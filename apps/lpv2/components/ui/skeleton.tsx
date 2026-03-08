import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden rounded-md bg-z200',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-z300/60 before:to-transparent',
        'before:animate-shimmer',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
