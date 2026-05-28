import { Link } from 'react-router-dom';

export const NotFoundPage = (): JSX.Element => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-5xl font-bold text-brand">404</p>
    <h1 className="mt-2 text-xl font-semibold text-slate-900">Page not found</h1>
    <p className="mt-1 text-sm text-slate-500">The page you’re looking for doesn’t exist.</p>
    <Link to="/" className="mt-4 text-sm text-brand underline">Go home</Link>
  </div>
);
