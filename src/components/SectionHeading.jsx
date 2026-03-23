export default function SectionHeading({ title, description, rightSlot }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="sky-title text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-slate-600">{description}</p> : null}
      </div>
      {rightSlot}
    </div>
  );
}
