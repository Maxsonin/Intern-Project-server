export function feedToDate(
	date: string | null | undefined,
	fallback: Date = new Date(),
): Date {
	const d = new Date(date ?? "");
	return Number.isNaN(d.getTime()) ? fallback : d;
}
