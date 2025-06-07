import Header from './Header';
import { Footer } from './Footer';

export function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col pb-16">
            <Header />
            <main className="flex-grow pt-16">
                <div className="max-w-[600px] mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
} 