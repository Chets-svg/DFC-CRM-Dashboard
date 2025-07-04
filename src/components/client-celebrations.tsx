import { Heart, Cake } from "lucide-react"

type CelebrationType = 'birthday' | 'anniversary'

interface Client {
  id: string
  name: string
  dob?: string
  marriageAnniversary?: string
}

export default function ClientCelebrations({ clients }: { clients: Client[] }) {
  const today = new Date()
  const todayFormatted = `${today.getMonth() + 1}-${today.getDate()}`
  
  const todaysCelebrations = clients.reduce<{name: string, type: CelebrationType}[]>((acc, client) => {
    if (client.dob) {
      const dobDate = new Date(client.dob)
      const dobFormatted = `${dobDate.getMonth() + 1}-${dobDate.getDate()}`
      if (dobFormatted === todayFormatted) acc.push({name: client.name, type: 'birthday'})
    }
    if (client.marriageAnniversary) {
      const annivDate = new Date(client.marriageAnniversary)
      const annivFormatted = `${annivDate.getMonth() + 1}-${annivDate.getDate()}`
      if (annivFormatted === todayFormatted) acc.push({name: client.name, type: 'anniversary'})
    }
    return acc
  }, [])

  if (todaysCelebrations.length === 0) return null

  return (
    <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
        <span className="font-medium whitespace-nowrap">Today's Celebrations:</span>
        <div className="flex items-center gap-3">
          {todaysCelebrations.map((celebration, index) => (
            <span key={index} className="flex items-center gap-1 whitespace-nowrap">
              {celebration.type === 'birthday' ? (
                <Cake className="h-4 w-4 text-pink-500" />
              ) : (
                <Heart className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {celebration.name}'s {celebration.type}
              </span>
              {index < todaysCelebrations.length - 1 && (
                <span className="text-muted-foreground">•</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}