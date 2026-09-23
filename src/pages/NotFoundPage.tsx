import { Link } from 'react-router-dom';
import Byte from '../components/Byte';

/** Any unknown URL. Previously these rendered a blank page. */
export default function NotFoundPage() {
  return (
    <main
      className="on-dark min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: 'linear-gradient(145deg, #1a0a3d 0%, #3d1278 50%, #1a2a6c 100%)' }}
    >
      <Byte mood="think" size={120} showSpeech={false} />
      <h1 className="text-3xl font-black text-white">Byte can&apos;t find that page.</h1>
      <p className="text-lg text-white/85 max-w-md">The link might be old or mistyped. Your progress is safe.</p>
      <Link
        to="/"
        className="rounded-2xl px-6 py-3 font-black text-lg text-white"
        style={{ background: '#B84A12' }}
      >
        Go to the home page
      </Link>
    </main>
  );
}
