const marks: Record<string, string> = {
  uber: "logos/uber.png",
  ey: "logos/ey.png",
  lvmh: "logos/lvmh.png",
  meadjohnson: "logos/mead-johnson.png",
  ecloudvalley: "logos/ecloudvalley.png",
};

export function Logo({ id }: { id: string }) {
  const src = marks[id];
  if (!src) return null;
  return <img className={`logo logo-${id}`} src={`${import.meta.env.BASE_URL}${src}`} alt="" />;
}
