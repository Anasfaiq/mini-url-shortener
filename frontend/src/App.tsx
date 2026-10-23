import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    setCopied(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_url: url }),
      });

      if (!response.ok) {
        throw new Error('Gagal memendekkan URL');
      }
      const data = await response.json();
      setShortUrl(data.short_url); // simpan hasil response dari API
    } catch (err) {
      setError('Terjadi kesalahan saat menghubungi server. Pastikan backend menyala')
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false) , 2000); // reset tulisan setelah 2 detik
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-8 shadow-xl border border-neutral-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium tracking-tight">Mini Shortener</h1>
          <p className="text-sm text-neutral-400 mt-2">Paste your long URL below to get a shortened version:</p>
        </div>

        {/* Form component */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input 
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='https://example.com/very-long-url'
            className='w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors'
          />
          <button 
            type='submit'
            disabled={loading}
            className='w-full bg-white text-black font-medium rounded-lg px-4 py-3 text-sm hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
              {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className='mt-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 duration-300'>
            <p className="text-xs text-neutral-400 mb-2">Your short URL is ready:</p>
            <div className='flex items-center justify-between gap-3'>
              <a 
                href={shortUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-blue-400 hover:text-blue-300 truncate font-medium'
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className='bg-neutral-700 hover:bg-neutral-600 text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap'
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;