export function timeAgo(dateString) {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return `${seconds}초`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}달`;

    const years = Math.floor(months / 12);
    return `${years}년`;
}

export function calcAge(birthday) {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const now = new Date();

    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
