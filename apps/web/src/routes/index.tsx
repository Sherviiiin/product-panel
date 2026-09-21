import { createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main>
      <h1 className='text-4xl'>Welcome to TanStack Start</h1>
      <p>
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>

      <Button>Hello World</Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Card Header</CardTitle>
        </CardHeader>

        <CardContent>
          <p>
            This is the content of this card...
          </p>

          <p>
            this card looks good so far
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
