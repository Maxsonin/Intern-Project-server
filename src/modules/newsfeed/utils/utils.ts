export function feedToDate(date: string | null): Date | null {
	// Some additional logic can be added
	return date ? new Date(date) : null;
}
