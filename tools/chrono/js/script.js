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

let lapHistory = [];
let lapCount = 0;

let lapElapsed = 0;
let lapStartTime= 0;
let currentLapTime = 0;

const lapTimeDisplay = document.getElementById("lapTimeDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const startButton = document.getElementById("start");

function toggleStopwatch() 
{
    if (isRunning) 
    {
        elapsed += Date.now() - startTime;
        lapElapsed += Date.now() - lapStartTime;
        isRunning = false;
        clearInterval(intervalId);
        startButton.innerHTML = '<i data-lucide="play"></i>';        
        lucide.createIcons();
    }
    else    
    {
        startTime = Date.now();
        lapStartTime = Date.now();
        isRunning = true;
        intervalId = setInterval(updateStopwatch, 50);
        startButton.innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    }
}

function updateStopwatch()
{
    let total =0 ;
    let lapTotal = lapElapsed;
    if (isRunning)
    {
        total = elapsed + (Date.now() - startTime);
        lapTotal += Date.now() - lapStartTime;
    }
    else
    {
        total = elapsed;
    }
    currentLapTime = lapTotal;
    timeDisplay.textContent = formatTime(total);
    lapTimeDisplay.textContent = formatTime(lapTotal);
}

function formatTime(ms)
{
    const formattedHours = String(Math.floor(ms/3600000)).padStart(2,"0"); //calcula a hora formata colocando zero onde falta e guarda (esse tá sem módulo pq deixei passar de 24 horas)
    const formattedMinutes = String((Math.floor(ms/60000)) % 60).padStart(2,"0"); //mesmo pra minutos e segundos
    const formattedSeconds = String((Math.floor(ms/1000)) % 60).padStart(2, "0"); //segundos
    const formattedCent = String(Math.floor(ms / 10) % 100).padStart(2, "0"); //centesimo

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedCent}`;
}

function resetStopwatch()
{
    if (isRunning)
    {
        clearInterval(intervalId);
    }
    isRunning = false;
    lapElapsed = 0;
    currentLapTime = 0;
    lapStartTime = 0;
    lapHistory = [];
    lapCount = 0;   
    timeDisplay.textContent = '00:00:00.00';
    lapTimeDisplay.textContent = '00:00:00.00';
    elapsed = 0;
    startTime = 0;
    intervalId = null;
    startButton.innerHTML = '<i data-lucide="play"></i>';        
    document.getElementById("laps").innerText = "";
    document.querySelector("#lapTimeDisplay").style.display = "none";
    document.querySelector(".lapDisplay").style.display = "none";
    lucide.createIcons();
}

function markLap()
{
    if (!isRunning)
    {
        return;
    }
    let lap = currentLapTime;
    let lapTotal =  elapsed + (Date.now() - startTime); 
    console.log(lapTotal);
    resetLapTime();
    console.log(lap);
    lapCount++;
    lapHistory.push({
        number: lapCount,
        time: lap,
        totalTime: lapTotal
    });
    let historytext = lapHistory.map(lap => `Lap ${lap.number}: ${formatTime(lap.time)} | Total: ${formatTime(lap.totalTime)}`).join("\n");
    document.getElementById("laps").innerText = historytext;
    document.querySelector("#lapTimeDisplay").style.display = "flex";
    document.querySelector(".lapDisplay").style.display = "flex";
}

function resetLapTime()
{
    lapElapsed = 0;
    currentLapTime = 0;
    lapStartTime = Date.now();
    lapTimeDisplay.textContent = '00:00:00.00';
}