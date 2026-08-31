import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { Plus, Calendar as CalendarIcon, AlertCircle, Loader2, Clock, Trash2 } from "lucide-react";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Generate 30-minute time slot options for user-friendly dropdowns
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    const formattedHours = String(hours).padStart(2, "0");
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return {
      value: `${formattedHours}:${minutes}`,
      label: `${displayHour}:${minutes} ${ampm}`,
    };
  });
  
  // Quick duration presets in minutes
  const DURATION_PRESETS = [
    { label: "30m", minutes: 30 },
    { label: "1h", minutes: 60 },
    { label: "1.5h", minutes: 90 },
    { label: "2h", minutes: 120 },
  ];
  
  // Helper functions for formatting local dates and times
  const formatDateForInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  
  const formatTimeForInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    // Round to nearest 30 minutes for smooth defaults
    const mins = d.getMinutes() >= 30 ? "30" : "00";
    return `${pad(d.getHours())}:${mins}`;
  };
  
  const combineDateAndTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>([
    {
        id: "1",
        title: "Sync with Design Team",
        start: new Date(2026, 7, 24, 10, 0),
        end: new Date(2026, 7, 24, 11, 30),
    },
    {
        id: "2",
        title: "Project Architecture Review",
        start: new Date(2026, 7, 26, 14, 0),
        end: new Date(2026, 7, 26, 16, 0),
    },
    ]);

    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date(2026, 7, 24));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Guard against duplicate clicks & network latency
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isBusy = isSubmitting || isDeleting;

    const [newEventTitle, setNewEventTitle] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const fetchEvents = async () => {
        setErrorMessage("");
        try {
            const res = await fetch("/api/get_events", {
                credentials: "include"
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data: { id: number; title: string; start: string; end: string }[] = await res.json();
            setEvents(
                data.map((evt) => ({
                    id: String(evt.id),
                    title: evt.title,
                    start: new Date(evt.start),
                    end: new Date(evt.end),
                }))
            );
        } catch (error) {
            console.error("Event retrieval failed:", error);
            setEvents([]);
            setErrorMessage("Failed to fetch events.");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const closeModal = () => {
        if (isBusy) return; // Prevent closing while network request is in-flight
        setIsModalOpen(false);
        setErrorMessage(null);
        setEditingEventId(null);
        setNewEventTitle("");
    };

    const populateFormWithDates = (start: Date, end: Date) => {
        setEventDate(formatDateForInput(start));
        setStartTime(formatTimeForInput(start));
        setEndTime(formatTimeForInput(end));
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setEditingEventId(null);
        setNewEventTitle("");
        setErrorMessage(null);
        populateFormWithDates(start, end);
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setEditingEventId(event.id);
        setNewEventTitle(event.title);
        setErrorMessage(null);
        populateFormWithDates(event.start, event.end);
        setIsModalOpen(true);
    };

    // Quick preset button handler
    const applyDurationPreset = (durationMinutes: number) => {
        const startObj = combineDateAndTime(eventDate, startTime);
        const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000);
        setEndTime(formatTimeForInput(endObj));
    };

    const handleSaveEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEventTitle.trim() || isSubmitting) return;

        const startObj = combineDateAndTime(eventDate, startTime);
        const endObj = combineDateAndTime(eventDate, endTime);

        if (endObj <= startObj) {
            setErrorMessage("End time must be after the start time.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        const previousEvents = [...events];

        if (editingEventId) {
            // 1. OPTIMISTIC UPDATE: Update calendar UI instantly
            setEvents((prev) =>
                prev.map((evt) =>
                    evt.id === editingEventId
                    ? { ...evt, title: newEventTitle, start: startObj, end: endObj }
                    : evt
                )
            );

            // 2. Perform API call in background
            try {
                const response = await fetch("/api/update_event", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                    id: editingEventId,
                    title: newEventTitle,
                    start: startObj,
                    end: endObj,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Failed to update event.");
                }

                setIsSubmitting(false);
                closeModal();
            } catch (err: any) {
                // Rollback state on error
                setEvents(previousEvents);
                setErrorMessage(err.message || "Network error occurred.");
                setIsSubmitting(false);
            }
        } else {
            // Create temporary ID for instant optimistic rendering
            const tempId = `temp-${Date.now()}`;
            const tempEvent: CalendarEvent = {
                id: tempId,
                title: newEventTitle,
                start: startObj,
                end: endObj,
            };

            // 1. OPTIMISTIC UPDATE: Add event to calendar UI instantly
            setEvents((prev) => [...prev, tempEvent]);

            // 2. Perform API call in background
            try {
                const response = await fetch("/api/create_event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                    title: newEventTitle,
                    start: startObj,
                    end: endObj,
                    }),
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || "Failed to create event.");
                }

                const data = await response.json();

                // Swap temporary ID with actual database primary key
                setEvents((prev) =>
                    prev.map((evt) => (evt.id === tempId ? { ...evt, id: String(data.id) } : evt))
                );

                setIsSubmitting(false);
                closeModal();
            } catch (err: any) {
                // Rollback state on error
                setEvents(previousEvents);
                setErrorMessage(err.message || "Network error occurred.");
                setIsSubmitting(false);
            }
        }
    };

    const handleDeleteEvent = async () => {
        if (!editingEventId || isBusy) return;

        setIsDeleting(true);
        setErrorMessage(null);
        const previousEvents = [...events];

        // OPTIMISTIC UPDATE: Remove event from calendar UI instantly
        setEvents((prev) => prev.filter((evt) => evt.id !== editingEventId));

        try {
            const response = await fetch(`/api/delete_event?id=${editingEventId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to delete event.");
            }

            setIsDeleting(false);
            closeModal();
        } catch (err: any) {
            // Rollback state on error
            setEvents(previousEvents);
            setErrorMessage(err.message || "Network error occurred.");
            setIsDeleting(false);
        }
    };

    return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-xl shadow-md border border-neutral-100 min-h-screen flex flex-col gap-4">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-neutral-700" />
            <h1 className="text-2xl font-bold text-neutral-800">Schedule Workspace</h1>
        </div>
        <button
            onClick={() => {
            setEditingEventId(null);
            setNewEventTitle("");
            setErrorMessage(null);
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            populateFormWithDates(now, oneHourLater);
            setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
            <Plus className="h-4 w-4" /> Create Event
        </button>
        </div>

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
            className:
                "!bg-blue-600 !text-white !rounded-md !px-2 !py-0.5 !text-xs !font-medium !border-none !shadow-sm",
            })}
        />
        </div>

        {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
                {editingEventId ? "Edit Event" : "Plan New Event"}
            </h3>

            {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSaveEventSubmit} className="flex flex-col gap-4">
                <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Event Title
                </label>
                <input
                    type="text"
                    required
                    disabled={isBusy}
                    placeholder="e.g. Design Sync / Code Deploy"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 disabled:bg-neutral-100"
                />
                </div>

                {/* Clean Date Picker */}
                <div>
                <label className="text-xs font-semibold text-neutral-500 block mb-1">
                    Date
                </label>
                <input
                    type="date"
                    required
                    disabled={isBusy}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 disabled:bg-neutral-100"
                />
                </div>

                {/* Time Selection with Dropdowns */}
                <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">
                        Start Time
                    </label>
                    <select
                    value={startTime}
                    disabled={isBusy}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-white disabled:bg-neutral-100"
                    >
                    {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                        {slot.label}
                        </option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-semibold text-neutral-500 block mb-1">
                        End Time
                    </label>
                    <select
                    value={endTime}
                    disabled={isBusy}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-white disabled:bg-neutral-100"
                    >
                    {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                        {slot.label}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                {/* Quick Duration Pills */}
                <div>
                <label className="text-xs font-semibold text-neutral-400 block mb-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Quick Duration
                </label>
                <div className="flex gap-2">
                    {DURATION_PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        type="button"
                        disabled={isBusy}
                        onClick={() => applyDurationPreset(preset.minutes)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 text-neutral-700 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
                    >
                        +{preset.label}
                    </button>
                    ))}
                </div>
                </div>

                <div className={`flex items-center pt-2 border-t mt-2 ${editingEventId ? "justify-between" : "justify-end"}`}>
                {editingEventId && (
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={handleDeleteEvent}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                        {isDeleting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Deleting...
                        </>
                        ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </>
                        )}
                    </button>
                )}
                <div className="flex gap-2">
                <button
                    type="button"
                    disabled={isBusy}
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isBusy}
                    className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                    ) : (
                    "Save Event"
                    )}
                </button>
                </div>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
    );
}