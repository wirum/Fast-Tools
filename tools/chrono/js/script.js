updateTime();
setInterval(updateTime, 1000);

function updateTime()
{
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const now = new Date();
    const locale = navigator.language;

    console.log("Fuso Horário:", timeZone);
    console.log("Horário:", now.toLocaleTimeString(locale, {hourCycle: "h23"}));
    console.log("Data atual:", now.toLocaleDateString());

    const formatter = new Intl.DateTimeFormat(locale, {timeZone: timeZone, timeZoneName: "longGeneric"});

    const parts = formatter.formatToParts(now);

    const zonePart = parts.find(part => part.type === "timeZoneName");

    const timeZoneLabel = zonePart ? zonePart.value : timeZone;

    document.getElementById("clock-time").innerText = now.toLocaleTimeString(locale, {hourCycle: "h23"});
    document.getElementById("date").innerText = now.toLocaleDateString(locale);
    document.getElementById("timezone").innerText = timeZoneLabel;
}

lucide.createIcons();

let isRunning = false;
let startTime = 0;
let elapsed = 0;
let intervalId = null;

const timeDisplay = document.getElementById("timeDisplay");

function toggleStopwatch() 
{
    if (isRunning) 
    {
        elapsed += Date.now() - startTime;
        isRunning = false;
        clearInterval(intervalId);
    }
    else
    {
        startTime = Date.now();
        isRunning = true;
        intervalId = setInterval(updateStopwatch, 50);
    }
}

function updateStopwatch()
{
    let total = 0;
    if (isRunning)
    {
        total = elapsed + (Date.now() - startTime);
    }
    else
    {
        total = elapsed;
    }
    timeDisplay.textContent = formatTime(total);
}

function formatTime(ms)
{
    const formattedHours = String(Math.floor(ms/3600000)).padStart(2,"0"); //calcula a hora formata colocando zero onde falta e guarda (esse tá sem módulo pq deixei passar de 24 horas)
    const formattedMinutes = String((Math.floor(ms/60000)) % 60).padStart(2,"0"); //mesmo pra minutos e segundos
    const formattedSeconds = String((Math.floor(ms/1000)) % 60).padStart(2, "0"); //segundos

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}