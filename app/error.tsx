"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h1 style={{ color: 'red', fontSize: 32 }}>Something went wrong</h1>
      <p style={{ margin: '16px 0' }}>{error.message || 'An unexpected error occurred.'}</p>
      <button
        style={{ padding: '8px 16px', fontSize: 16, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        onClick={() => reset()}
      >
        Try Again
      </button>
    </div>
  );
} 