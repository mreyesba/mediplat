function Home() {
    return (   
        <div>
            <section className="hero-section bg-slate-100 py-100 text-center">
                <h1 className="text-4x1 font-bold mb-4">
                    Welcome to our clinic!
                </h1>
                <p className="text-gray-600">
                    With take care of your health!
                </p>
            </section>

            {/* Other sections of the landing page (Services, Reviews, etc) */}
            <section className="py-12 text-center">
                <h2 className="text-2x1 font-semibold">
                    Our Services
                </h2>
            </section>
        </div>
    );
}

export default Home;