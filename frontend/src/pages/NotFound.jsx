import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 p-10">
      <h2 className="text-2xl">Page not found</h2>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </div>
  )
}
