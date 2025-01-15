import { format } from 'date-fns';

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d yyyy, HH:mm:ss');
}

export function formatDateSimple(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
