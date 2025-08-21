function Bar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="my-2">
      <div className="mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-[color:var(--text-dim)]">{value}</span>
      </div>
      <div className="h-2 w-full rounded-md bg-[color:var(--border)]">
        <div
          className="h-2 rounded-md"
          style={{ width: value, background: color }}
        />
      </div>
    </div>
  );
}

export default Bar;