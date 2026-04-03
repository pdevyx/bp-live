import StopsLayer from '@/features/stops'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stops/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <StopsLayer />
  )
}
