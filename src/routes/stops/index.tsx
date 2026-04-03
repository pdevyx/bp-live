import StopsLayer from '@/components/stops'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stops/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
      <StopsLayer />
  )
}
