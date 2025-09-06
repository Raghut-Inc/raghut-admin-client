export function timeAgo(dateString) {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}m ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}
