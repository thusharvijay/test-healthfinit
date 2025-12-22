import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router';
import { useEffect, useState, type ReactNode, type FC, Component } from 'react';
import './global.css';
import { Toaster } from 'sonner';

// -------------------- Error Boundary --------------------
function SharedErrorBoundary({ isOpen, children }: { isOpen: boolean; children?: ReactNode }) {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center">
              <span className="text-black text-[1.125rem] leading-none">⚠</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <p className="font-light text-[#F2F2F2] text-sm">App Error Detected</p>
              <p className="text-[#959697] text-sm font-light">
                It looks like an error occurred while trying to use your app.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function InternalErrorBoundary({ error }: { error?: unknown }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return <SharedErrorBoundary isOpen={isOpen} />;
}

class ErrorBoundaryWrapper extends Component<
  { children: ReactNode },
  { hasError: boolean; error: unknown | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <InternalErrorBoundary error={this.state.error} />;
    }
    return this.props.children;
  }
}

const ClientOnly: FC<{ loader: () => ReactNode }> = ({ loader }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;
  return <ErrorBoundaryWrapper>{loader()}</ErrorBoundaryWrapper>;
};

// -------------------- Layout --------------------
export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:navigation') {
        navigate(event.data.pathname);
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'sandbox:web:ready' }, '*');
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  useEffect(() => {
    if (pathname) {
      window.parent.postMessage({ type: 'sandbox:web:navigation', pathname }, '*');
    }
  }, [pathname]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <ClientOnly loader={() => children} />
        <Toaster position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// -------------------- App --------------------
export default function App() {
  return <Outlet />;
}
