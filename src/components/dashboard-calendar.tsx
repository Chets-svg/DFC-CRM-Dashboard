"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock 
} from "lucide-react";
import { ThemeName, themes } from '@/lib/theme';

interface Event {
  date: Date;
  title: string;
  time: string;
  description?: string;
}

interface DashboardCalendarProps {
  theme: ThemeName;
}

export function DashboardCalendar({ theme }: DashboardCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [activeDate, setActiveDate] = useState<Date | null>(new Date());

  const currentTheme = themes[theme] || themes['blue-smoke'];

  // Sample events data - replace with your actual data
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
      title: 'Today\'s Event', 
      time: '3:00 PM',
      description: 'Demo meeting with potential client' 
    },
  ];

  // Custom class for days with events
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvents = events.some(
        event => event.date.toDateString() === date.toDateString()
      );
      return hasEvents ? (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></div>
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
    <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Upcoming Events</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className={`${currentTheme.buttonBg} ${currentTheme.buttonHover} ${currentTheme.textColor} border ${currentTheme.borderColor}`}
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
                `}
                tileContent={tileContent}
                tileClassName={({ date, view }) => `
                  ${view === 'month' ? 'h-12' : ''}
                  ${date.toDateString() === new Date().toDateString() ? 
                    'react-calendar__tile--now' : ''}
                  hover:bg-opacity-10
                `}
                navigationLabel={({ label }) => (
                  <span className="text-inherit font-medium">{label}</span>
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
              <h3 className="font-medium mb-3">
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
                      className={`p-4 rounded-lg ${currentTheme.highlightBg}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${currentTheme.selectedBg}`}>
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{event.title}</h4>
                            <span className="text-sm font-medium">
                              {event.time}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 text-center rounded-lg ${currentTheme.highlightBg}`}>
                  <p className={`text-sm ${currentTheme.mutedText}`}>
                    No events scheduled for this day
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Events (when not viewing today) */}
            {activeDate?.toDateString() !== new Date().toDateString() && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Today's Events</h3>
                {getEventsForDate(new Date()).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(new Date()).map((event, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <p className="mt-1 text-sm">{event.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${currentTheme.mutedText}`}>
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
            <h3 className="font-medium">Upcoming Events</h3>
            {events
              .filter(e => e.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{event.title}</span>
                    <span className={`text-xs ${currentTheme.mutedText}`}>
                      {event.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{event.time}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}