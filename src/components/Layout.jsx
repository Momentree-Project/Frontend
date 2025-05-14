import { Footer } from './Footer';

export function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col pb-16">
            <main className="flex-grow">
                <div className="max-w-[600px] mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
} 