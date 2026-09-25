export function generatePropertySlug(p: { title?: string; type?: string; locality?: string; city?: string }): string {
  const loc = [p.locality, p.city].filter(Boolean).join(' ');
  const text = [p.type, p.title, loc ? `in ${loc}` : ''].filter(Boolean).join(' ');
  return text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'property';
}
