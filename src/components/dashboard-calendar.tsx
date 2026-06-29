import { useState } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

// Make sure this interface matches the one in your types file,
// or import it from there if you already have it defined.
interface Event {
  date: Date;
  title: string;
  time: string;
  description?: string;
}

interface DashboardCalendarProps {
  theme: string;
}

export function DashboardCalendar({ theme }: DashboardCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [activeDate, setActiveDate] = useState<Date | null>(new Date());

  // Assuming `themes`, `isNeon`, and `getButtonClasses` are available in your scope
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const neon = isNeon(theme);

  // Sample events data
  const events: Event[] = [
    { 
      date: new Date(2023, 5, 15), 
      title: 'Client Meeting', 
      time: '10:00 AM',
      description: 'Quarterly portfolio review with John Doe from Acme Inc.' 
    },
    { 
      date: new Date(2023, 5, 20), 
      title: 'SIP Due', 
      time: 'All Day',
      description: 'Monthly SIP payment for Robert Johnson' 
    },
    { 
      date: new Date(2023, 5, 25), 
      title: 'Portfolio Review', 
      time: '2:30 PM',
      description: 'Discuss investment strategy with Jane Smith' 
    },
    { 
      date: new Date(), 
      title: "Today's Event", 
      time: '3:00 PM',
      description: 'Demo meeting with potential client' 
    },
  ];

  // Custom class for days with events — neon dot glows cyan
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvents = events.some(
        event => event.date.toDateString() === date.toDateString()
      );
      return hasEvents ? (
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          neon 
            ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.6)]' 
            : 'bg-blue-500'
        }`}></div>
      ) : null;
    }
    return null;
  };

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  return (
    <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor} h-full ${
      neon ? 'shadow-[0_0_20px_rgba(0,255,255,0.08)] border-cyan-500/20' : ''
    }`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className={neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''}>
            Upcoming Events
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className={getButtonClasses(theme, 'outline')}
          >
            {showCalendar ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide Calendar
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show Calendar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCalendar && (
          <div className="flex flex-col">
            {/* Calendar Component */}
            <div className="mb-4">
              <ReactCalendar
                onChange={(value) => {
                  setDate(value as Date);
                  setActiveDate(value as Date);
                }}
                value={date}
                className={`
                  react-calendar
                  bg-inherit
                  text-inherit
                  border-inherit
                  rounded-md
                  [&_.react-calendar__navigation]:bg-inherit
                  [&_.react-calendar__navigation__label]:text-inherit
                  [&_.react-calendar__navigation__arrow]:text-inherit
                  [&_.react-calendar__month-view]:bg-inherit
                  [&_.react-calendar__month-view__days]:bg-inherit
                  [&_.react-calendar__month-view__days__day]:bg-inherit
                  [&_.react-calendar__year-view]:bg-inherit
                  [&_.react-calendar__year-view__months]:bg-inherit
                  [&_.react-calendar__year-view__months__month]:bg-inherit
                  [&_.react-calendar__decade-view]:bg-inherit
                  [&_.react-calendar__decade-view__years]:bg-inherit
                  [&_.react-calendar__decade-view__years__year]:bg-inherit
                  [&_.react-calendar__century-view]:bg-inherit
                  [&_.react-calendar__century-view__decades]:bg-inherit
                  [&_.react-calendar__century-view__decades__decade]:bg-inherit
                  ${neon ? `
                    [&_.react-calendar__navigation]:border-b
                    [&_.react-calendar__navigation]:border-cyan-500/20
                    [&_.react-calendar__navigation__arrow]:text-cyan-400
                    [&_.react-calendar__navigation__arrow:hover]:bg-cyan-500/10
                    [&_.react-calendar__navigation__label]:text-cyan-300
                    [&_.react-calendar__month-view__weekdays]:bg-inherit
                    [&_.react-calendar__month-view__weekdays__weekday]:text-cyan-400/70
                    [&_.react-calendar__month-view__weekdays__weekday]:bg-inherit
                    [&_.react-calendar__month-view__days__day]:text-slate-300
                    [&_.react-calendar__month-view__days__day:hover]:bg-cyan-500/10
                    [&_.react-calendar__tile]:text-slate-300
                    [&_.react-calendar__tile:hover]:bg-cyan-500/10
                    [&_.react-calendar__tile--active]:bg-cyan-500/20
                    [&_.react-calendar__tile--active]:text-cyan-300
                    [&_.react-calendar__tile--active]:shadow-[0_0_10px_rgba(0,255,255,0.2)]
                    [&_.react-calendar__tile--now]:bg-fuchsia-500/15
                    [&_.react-calendar__tile--now]:text-fuchsia-400
                    border-cyan-500/20
                    shadow-[0_0_15px_rgba(0,255,255,0.05)]
                  ` : ''}
                `}
                tileContent={tileContent}
                tileClassName={({ date, view }) => `
                  ${view === 'month' ? 'h-12' : ''}
                  ${date.toDateString() === new Date().toDateString() ? 
                    'react-calendar__tile--now' : ''}
                  hover:bg-opacity-10
                `}
                navigationLabel={({ label }) => (
                  <span className={`font-medium ${
                    neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : 'text-inherit'
                  }`}>
                    {label}
                  </span>
                )}
                formatMonthYear={(locale, date) =>
                  new Intl.DateTimeFormat(locale, {
                    month: 'long',
                    year: 'numeric',
                  }).format(date)
                }
                minDetail="month"
                prev2Label={null}
                next2Label={null}
              />
            </div>

            {/* Events for selected date */}
            <div className="mt-4">
              <h3 className={`font-medium mb-3 ${
                neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.15)]' : ''
              }`}>
                {activeDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(activeDate || new Date()).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(activeDate || new Date()).map((event, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        neon 
                          ? 'bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.08)]' 
                          : currentTheme.highlightBg
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          neon 
                            ? 'bg-cyan-500/15 shadow-[0_0_8px_rgba(0,255,255,0.15)]' 
                            : currentTheme.selectedBg
                        }`}>
                          <Clock className={`h-5 w-5 ${
                            neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.4)]' : 'text-blue-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-semibold ${neon ? 'text-slate-200' : ''}`}>
                              {event.title}
                            </h4>
                            <span className={`text-sm font-medium ${
                              neon ? 'text-cyan-400/80' : ''
                            }`}>
                              {event.time}
                            </span>
                          </div>
                          {event.description && (
                            <p className={`mt-2 text-sm ${neon ? 'text-slate-400' : ''}`}>
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 text-center rounded-lg ${
                  neon 
                    ? 'bg-cyan-500/5 border border-cyan-500/10' 
                    : currentTheme.highlightBg
                }`}>
                  <p className={`text-sm ${
                    neon ? 'text-cyan-400/50' : currentTheme.mutedText
                  }`}>
                    No events scheduled for this day
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Events (when not viewing today) */}
            {activeDate?.toDateString() !== new Date().toDateString() && (
              <div className="mt-6">
                <h3 className={`font-medium mb-3 ${
                  neon ? 'text-fuchsia-400 drop-shadow-[0_0_4px_rgba(232,121,249,0.15)]' : ''
                }`}>
                  Today's Events
                </h3>
                {getEventsForDate(new Date()).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(new Date()).map((event, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg transition-all duration-200 ${
                          neon 
                            ? 'bg-fuchsia-500/5 border border-fuchsia-500/10 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/20' 
                            : currentTheme.highlightBg
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${
                            neon ? 'text-fuchsia-400 drop-shadow-[0_0_4px_rgba(232,121,249,0.4)]' : 'text-blue-500'
                          }`} />
                          <span className={`font-medium ${
                            neon ? 'text-fuchsia-400' : ''
                          }`}>{event.time}</span>
                        </div>
                        <p className={`mt-1 text-sm ${neon ? 'text-slate-300' : ''}`}>
                          {event.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    neon ? 'text-cyan-400/50' : currentTheme.mutedText
                  }`}>
                    No events today
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compact view when calendar is hidden */}
        {!showCalendar && (
          <div className="space-y-4">
            <h3 className={`font-medium ${
              neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.15)]' : ''
            }`}>
              Upcoming Events
            </h3>
            {events
              .filter(e => e.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    neon 
                      ? 'bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 hover:border-cyan-500/20 hover:shadow-[0_0_12px_rgba(0,255,255,0.08)]' 
                      : currentTheme.highlightBg
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${neon ? 'text-slate-200' : ''}`}>
                      {event.title}
                    </span>
                    <span className={`text-xs ${
                      neon ? 'text-cyan-400/60' : currentTheme.mutedText
                    }`}>
                      {event.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className={`h-3 w-3 ${
                      neon ? 'text-cyan-400 drop-shadow-[0_0_3px_rgba(0,255,255,0.3)]' : 'text-blue-500'
                    }`} />
                    <span className={`text-xs ${neon ? 'text-cyan-400/70' : ''}`}>
                      {event.time}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}