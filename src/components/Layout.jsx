import Header from './Header';
import { Footer } from './Footer';

export function Layout({ children, headerRightActions, customTopPadding }) {
    const topPadding = customTopPadding || 'pt-14';
    
    return (
        <div className="min-h-screen flex flex-col pb-16">
            <Header rightActions={headerRightActions} />
            <main className={`flex-grow ${topPadding}`}>
                <div className="max-w-[600px] mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
} 