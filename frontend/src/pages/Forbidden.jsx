import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function Forbidden() {
  return (
    <div className="flex flex-col items-start gap-4 p-10">
      <h2 className="text-2xl">You do not have access to this page</h2>
      <p className="text-muted-foreground">Your role cannot open it. Go back to your own area.</p>
      <Button asChild>
        <Link to="/">Back to my area</Link>
      </Button>
    </div>
  )
}
