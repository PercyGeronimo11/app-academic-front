export function getPeruTime() {
    const now = new Date();
    const peruTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Lima" }));
    const hours = peruTime.getHours().toString().padStart(2, "0");
    const minutes = peruTime.getMinutes().toString().padStart(2, "0");
    const seconds = peruTime.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }