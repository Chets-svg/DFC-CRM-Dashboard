import { Heart, Cake, CalendarHeart, Gift } from "lucide-react"
import { Card, CardContent } from "/components/ui/card"

type CelebrationType = 'birthday' | 'anniversary'

interface CelebrationReminderProps {
  name: string
  type: CelebrationType
  date: string
}

export function CelebrationReminder({ 
  name, 
  type = 'birthday', 
  date 
}: CelebrationReminderProps) {
  const getIcon = () => {
    switch(type) {
      case 'birthday': 
        return <Cake className="h-6 w-6 text-pink-500" />
      case 'anniversary':
        return <Heart className="h-6 w-6 text-red-500" />
      default:
        return <CalendarHeart className="h-6 w-6 text-blue-500" />
    }
  }

  const getTitle = () => {
    return type === 'birthday' 
      ? "Birthday Today!" 
      : "Anniversary Today!"
  }

  return (
    <Card className="h-full border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight">
              {getTitle()}
            </h3>
            <p className="text-sm text-muted-foreground">
              Wish <span className="font-medium text-primary">{name}</span> a wonderful {type}!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {date}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Example usage component with side-by-side layout
export default function CelebrationRemindersGrid() {
  const reminders = [
    { name: "John Doe", type: "birthday", date: "May 15, 2023" },
    { name: "Acme Corp", type: "anniversary", date: "May 18, 2023" },
    { name: "Sarah Johnson", type: "birthday", date: "May 20, 2023" },
    { name: "Tech Solutions LLC", type: "anniversary", date: "May 22, 2023" },
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Today's Celebrations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reminders.map((reminder, index) => (
          <CelebrationReminder
            key={index}
            name={reminder.name}
            type={reminder.type as CelebrationType}
            date={reminder.date}
          />
        ))}
      </div>
    </div>
  )
}