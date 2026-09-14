import { useTranslation } from 'react-i18next';

function Home() {
    const { t } = useTranslation();
    return (
        <div>
            <section className="hero-section bg-slate-100 py-100 text-center">
                <h1 className="text-4x1 font-bold mb-4">
                    {t('home.title')}
                </h1>
                <p className="text-gray-600">
                    {t('home.subtitle')}
                </p>
            </section>
        </div>
    );
}

export default Home;