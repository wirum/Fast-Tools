const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const now = new Date();

console.log("Fuso Horário:", timeZone);
console.log("Horário:", now.toLocaleTimeString());
console.log("Data atual:", now.toLocaleDateString());

document.getElementById("clock-time").innerText = now.toLocaleTimeString();
document.getElementById("date").innerText = now.toLocaleDateString();
document.getElementById("timezone").innerText = timeZone;
