import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from './apiConfig';

const UPCOMING_LIMIT = 5;

interface UpcomingEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
}

function Home() {
    const { t, i18n } = useTranslation();
    const [upcoming, setUpcoming] = useState<UpcomingEvent[] | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/get_events`, {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data: { id: number; title: string; start: string; end: string }[] = await res.json();
                const now = new Date();
                setUpcoming(
                    data
                        .map((evt) => ({ ...evt, start: new Date(evt.start), end: new Date(evt.end) }))
                        // Keep appointments that are still in progress, not just future ones
                        .filter((evt) => evt.end >= now)
                        .sort((a, b) => a.start.getTime() - b.start.getTime())
                        .slice(0, UPCOMING_LIMIT)
                );
            } catch (error) {
                console.error('Upcoming events retrieval failed:', error);
                setLoadFailed(true);
            }
        };
        fetchUpcoming();
    }, []);

    const formatWhen = (date: Date) =>
        date.toLocaleString(i18n.resolvedLanguage, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });

    return (
        <div>
            <section className="hero-section bg-slate-100 py-16 md:py-100 px-4 text-center">
                <h1 className="text-4x1 font-bold mb-4">
                    {t('home.title')}
                </h1>
                <p className="text-gray-600">
                    {t('home.subtitle')}
                </p>
            </section>

            <section className="max-w-2xl w-full mx-auto my-8 px-4 text-left">
                <div className="bg-white rounded-xl border shadow-sm">
                    <div className="flex justify-between items-center border-b px-5 py-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            {t('home.upcoming')}
                        </h2>
                        <Link to="/appointments" className="text-sm text-sky-600 hover:underline">
                            {t('home.viewCalendar')}
                        </Link>
                    </div>

                    {loadFailed ? (
                        <p className="px-5 py-4 text-sm text-red-600">{t('home.loadFailed')}</p>
                    ) : upcoming === null ? (
                        <p className="px-5 py-4 text-sm text-slate-400">{t('home.loading')}</p>
                    ) : upcoming.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-slate-400">{t('home.noUpcoming')}</p>
                    ) : (
                        <ul className="divide-y">
                            {upcoming.map((evt) => (
                                <li key={evt.id} className="flex justify-between items-center gap-4 px-5 py-3">
                                    <span className="text-sm font-medium text-slate-800 truncate">{evt.title}</span>
                                    <span className="text-xs text-slate-500 shrink-0">{formatWhen(evt.start)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;
