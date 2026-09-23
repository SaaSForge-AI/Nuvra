export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-surface2 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface2 rounded-xl border border-border" />)}
      </div>
      <div className="h-[300px] bg-surface2 rounded-xl border border-border" />
    </div>
  );
}
