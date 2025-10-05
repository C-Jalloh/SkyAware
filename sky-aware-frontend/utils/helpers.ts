export const getInitials = (name: string) => {
  const names = name.split(' ');
  const initials = names.map((n: string) => n.charAt(0).toUpperCase()).join('');
  return initials;
};

export const coordsAreEqual = (
  c1: { latitude: number; longitude: number },
  c2: { latitude: number; longitude: number },
  tolerance = 1e-6,
) => {
  return (
    Math.abs(c1.latitude - c2.latitude) < tolerance &&
    Math.abs(c1.longitude - c2.longitude) < tolerance
  );
};

export function formatTime12h(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // convert 0 => 12 for 12 AM/PM

  const hh = String(hours);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return `${hh}:${mm}:${ss} ${ampm}`;
}

export function getCategoryDescription(category: string): string {
  switch (category) {
    case 'Good':
      return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    case 'Moderate':
      return 'Air quality is acceptable for most people. Unusually sensitive people should consider limiting prolonged outdoor exertion.';
    case 'Unhealthy for Sensitive Groups':
      return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    case 'Unhealthy':
      return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
    case 'Very Unhealthy':
      return 'Health alert: everyone may experience more serious health effects. Avoid all outdoor physical activity.';
    case 'Hazardous':
      return 'Health warning of emergency conditions. The entire population is more likely to be affected. Stay indoors.';
    default:
      return 'No description available for this category.';
  }
}
