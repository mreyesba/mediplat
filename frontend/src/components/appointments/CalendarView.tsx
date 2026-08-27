import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

// 1. Set up Date-Fns Localization engine configurations
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define data structural layout fields
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export function CalendarView() {
    // 2. Main Event State Matrix
    const [events, setEvents] = useState<CalendarEvent[]>([
    {
        id: "1",
        title: "Sync with Design Team",
        start: new Date(2026, 7, 24, 10, 0), // August 24, 2026 at 10:00 AM
        end: new Date(2026, 7, 24, 11, 30),
    },
    {
        id: "2",
        title: "Project Architecture Review",
        start: new Date(2026, 7, 26, 14, 0), // August 26, 2026 at 2:00 PM
        end: new Date(2026, 7, 26, 16, 0),
    },
    ]);

    // View & UI Navigation States
    const [view, setView] = useState<any>(Views.WEEK);
    const [date, setDate] = useState(new Date(2026, 7, 24)); // Focus on the mock dates
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Form Entry Cache
    const [newEventTitle, setNewEventTitle] = useState("");
    const [selectedStart, setSelectedStart] = useState("");
    const [selectedEnd, setSelectedEnd] = useState("");
    // Track if we are editing an existing event ID (null means creating new)
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Triggered when an empty box or row slice on the schedule is clicked
    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setEditingEventId(null);
        setNewEventTitle("");
        // Format JavaScript dates directly to feed local raw HTML datetime inputs
        const formatForInput = (d: Date) => {
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setSelectedStart(formatForInput(start));
        setSelectedEnd(formatForInput(end));
        setIsModalOpen(true);
    };

    const handleSaveEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;
    
        if (editingEventId) {
            const response = await fetch("/api/update_event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: editingEventId,
                    title: newEventTitle,
                    start: new Date(selectedStart),
                    end: new Date(selectedEnd)
                }),
            });

            if (response.ok) {
                // Update existing event
                setEvents((prev) =>
                    prev.map((evt) =>
                        evt.id === editingEventId
                            ? {
                                ...evt,
                                title: newEventTitle,
                                start: new Date(selectedStart),
                                end: new Date(selectedEnd),
                            }
                            : evt
                    )
                );
            } else {
            const err = await response.json();
                // setError(err.detail || "Failed to add entry.");
            }
        } else {

            // Create new event

            const response = await fetch("/api/create_event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: newEventTitle,
                    start: new Date(selectedStart),
                    end: new Date(selectedEnd)
                }),
            });

            if (response.ok) {
                // Update existing event
                const newEvent: CalendarEvent = {
                    id: String(Date.now()),
                    title: newEventTitle,
                    start: new Date(selectedStart),
                    end: new Date(selectedEnd),
                };

                setEvents((prev) => [...prev, newEvent]);
            } else {
            const err = await response.json();
                // setError(err.detail || "Failed to add entry.");
            }
        
            
        }
    
        // Reset state & close modal
        setEditingEventId(null);
        setNewEventTitle("");
        setIsModalOpen(false);
    };

    // Triggered when an existing event card on the calendar is clicked
    const handleSelectEvent = (event: CalendarEvent) => {
        const formatForInput = (d: Date) => {
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setEditingEventId(event.id);
        setNewEventTitle(event.title);
        setSelectedStart(formatForInput(event.start));
        setSelectedEnd(formatForInput(event.end));
        setIsModalOpen(true);
    };

    return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md border border-neutral-100 min-h-screen flex flex-col gap-4">
        
        {/* Top Action Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-neutral-700" />
            <h1 className="text-2xl font-bold text-neutral-800">Schedule Workspace</h1>
        </div>
        <button
            onClick={() => {
                setEditingEventId(null);
                setNewEventTitle("");
                const now = new Date();
                setSelectedStart(now.toISOString().slice(0, 16));
                setSelectedEnd(now.toISOString().slice(0, 16));
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Plus className="h-4 w-4" /> Create Event
        </button>
        </div>

        {/* React Big Calendar Grid Engine */}
        <div className="flex-1 min-h-[70vh]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={(newView) => setView(newView)}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                style={{ height: "75vh" }}
                eventPropGetter={() => ({
                    className: "!bg-blue-600 !text-white !rounded-md !px-2 !py-0.5 !text-xs !font-medium !border-none !shadow-sm",
                })}
            />
        </div>

        {/* Creation Modal View Setup */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Plan New Event</h3>
            <form onSubmit={handleSaveEventSubmit} className="flex flex-col gap-4">
                <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">Event Title</label>
                <input
                    type="text"
                    required
                    placeholder="e.g. Design Sync / Code Deploy"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">Start Time</label>
                    <input
                    type="datetime-local"
                    required
                    value={selectedStart}
                    onChange={(e) => setSelectedStart(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-neutral-900" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">End Time</label>
                    <input
                    type="datetime-local"
                    required
                    value={selectedEnd}
                    onChange={(e) => setSelectedEnd(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-neutral-900" />
                </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
                    Save Event
                </button>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
    );
}
