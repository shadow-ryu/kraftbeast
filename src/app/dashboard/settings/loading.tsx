import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-8" />
        
        <div className="space-y-8">
          {/* Repository Visibility Section */}
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </Card>

          {/* Integrations Section */}
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </Card>

          {/* Contact & Social Section */}
          <Card className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
