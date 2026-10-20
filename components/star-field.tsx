const stars = [
  [9, 18, 2], [18, 69, 1], [27, 31, 1], [34, 82, 2], [42, 14, 1],
  [49, 58, 1], [57, 88, 1], [65, 23, 2], [73, 72, 1], [82, 37, 1],
  [91, 11, 2], [14, 43, 1], [38, 49, 1], [61, 47, 1], [87, 61, 1],
];

export function StarField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {stars.map(([left, top, size], index) => (
        <span
          key={`${left}-${top}`}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size + 1,
            height: size + 1,
            animationDelay: `${(index % 5) * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}
