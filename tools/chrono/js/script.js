updateTime();
setInterval(updateTime, 1000);

function updateTime()
{
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const now = new Date();
    const locale = navigator.language;

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
let fastestLap = null;
let slowestLap = null;

let lapIcon = "";

let lapElapsed = 0;
let lapStartTime= 0;
let currentLapTime = 0;

const lapTimeDisplay = document.getElementById("lapTimeDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const startButton = document.getElementById("start");

const savedLaps = localStorage.getItem("chronoLapHistory");

if (savedLaps)
{
    try
    {
        const parsed = JSON.parse(savedLaps);

        if (Array.isArray(parsed) && parsed.length > 0)
        {
            lapHistory = parsed;
            lapCount = lapHistory.length;
            fastestLap = Math.min(...lapHistory.map(lap => lap.time));
            slowestLap = Math.max(...lapHistory.map(lap => lap.time));
            renderLapHistory();

            document.querySelector(".lapDisplay").style.display = "flex";
            document.querySelector(".lapDisplay").classList.add("collapsed");
            document.getElementById("toggleLaps").setAttribute("aria-expanded", "false");
        }
    }
    catch
    {
        console.error("savedLaps inválido");
    }

}

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
    fastestLap = null;
    slowestLap = null;
    timeDisplay.textContent = '00:00:00.00';
    lapTimeDisplay.textContent = '00:00:00.00';
    localStorage.removeItem("chronoLapHistory");
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
    localStorage.setItem("chronoLapHistory", JSON.stringify(lapHistory));
    checkLap(lap);
    checkSlowestLap(lap);
    console.log("Volta mais rápida: ", formatTime(fastestLap));
    renderLapHistory();
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

function checkLap(lap)
{
    if (fastestLap == null)
    {
        fastestLap = lap;
    }
    else
    {
        if( lap < fastestLap )
        {
            fastestLap = lap;
        }
    }
}

function checkSlowestLap(lap)
{
    if (slowestLap == null || lap > slowestLap)
    {
        slowestLap = lap;
    }
}

function toggleLapHistory()
{
    document.querySelector(".lapDisplay").classList.toggle("collapsed");

    document.getElementById("toggleLaps").setAttribute("aria-expanded", !document.querySelector(".lapDisplay").classList.contains("collapsed"));
}

function renderLapHistory()
{
    document.getElementById("laps").innerHTML = lapHistory.map(
        lap => {
            let lapClass = "";
            let lapIcon = "";

            if(lap.time === fastestLap)
            {
                lapClass = "fastest-lap";
                lapIcon = "↑ | ";
            }
            else if (lap.time === slowestLap)
            {
                lapClass = "slowest-lap";
                lapIcon = "↓ | ";
            }

            return `
                <div class="lap-row ${lapClass}">
                    ${lapIcon}Lap ${lap.number}: ${formatTime(lap.time)}
                    | Total: ${formatTime(lap.totalTime)}
                </div>
            `;
        }).join("");
}

let timerInitial = 0;
let timerRemaining = 0;
let timerEndTime = 0;
let timerInterval = null;
let isTimerRunning = false;
const timerSet = document.getElementById("timerSet");

timerSet.addEventListener("click", () => {
    const timerParts = document.getElementById("timerSecondaryInput").value.split(":");
    
    if(timerParts.length === 3 && isDigits(timerParts[0]) && isDigits(timerParts[1]) && isValidSeconds(timerParts[2]))
    {
        const secondParts = timerParts[2].split(".");

        let centiseconds = 0;

        if (secondParts.length === 2)
        {
            centiseconds = Number(secondParts[1].padEnd(2, "0"));
        }

        timerRemaining = Number(timerParts[0]) * 3600 + Number(timerParts[1] * 60) + Number(secondParts[0]) + centiseconds / 100;

        timerInitial = timerRemaining;
        if (isTimerRunning)
        {
            timerEndTime = Date.now() + timerRemaining * 1000;
        }
        updateTimerDisplay();
    }
});

function updateTimerDisplay()
{
    document.getElementById("timerTime").textContent = formatTime(timerRemaining * 1000);
}

const buttons = document.querySelectorAll("[data-minutes]");

buttons.forEach(button =>{
    button.addEventListener("click", () =>{
        timerRemaining = Math.max(0 ,timerRemaining + Number(button.dataset.minutes) * 60);
        timerInitial = Math.max(0, timerInitial + Number(button.dataset.minutes) * 60);
        if (isTimerRunning)
        {
            timerEndTime = Date.now() + timerRemaining * 1000;
        }
        updateTimerDisplay();
    })
})

function isNumber(isNum) {
    return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(String(isNum)); //calcify calling back lol (reused it)
}

function isValidSeconds(value)
{
    const parts  = value.split(".");

    if (parts.length > 2 || !isDigits(parts[0])) 
    {
        return false;
    }

    if (parts.length === 1 ) 
    {
        return true;
    }

    if (parts[1].length >= 1 && parts[1].length <= 2 && isDigits(parts[1]))
    {
        return true;
    }

    return false;
}

function isDigits(value)
{
    return value.length > 0 && value.split("").every(isNumber);
}

document.getElementById("timerToggle").addEventListener("click", timerToggle);

document.getElementById("timerReset").addEventListener("click", timerReset);

function timerReset()
{
    if (isTimerRunning)
    {
        stopTimer();
    }

    timerRemaining = timerInitial;
    updateTimerDisplay();
}


function timerToggle()
{
    if(isTimerRunning)
    {
        timerRemaining = Math.max(0, (timerEndTime - Date.now()) / 1000);
        stopTimer();
    }
    else
    {
        if (timerRemaining <= 0)
        {
            return;
        }
        timerEndTime = Date.now() + timerRemaining * 1000;
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 50);
        document.getElementById("timerToggle").innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    }
    updateTimerDisplay();
}

function updateTimer()
{
    const timeLeft = timerEndTime - Date.now();

    timerRemaining = Math.max(0, timeLeft / 1000);
    updateTimerDisplay();

    if (timeLeft <= 0)
    {
        playAlarm();
        stopTimer();
    }
}

document.getElementById("timerClear").addEventListener("click", timerClear);

function timerClear()
{
    stopTimer();
    timerInitial = 0;
    timerRemaining = 0;
    timerEndTime = 0;
    document.getElementById("timerSecondaryInput").value = ''
    updateTimerDisplay();
}

function stopTimer()
{
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    document.getElementById("timerToggle").innerHTML = '<i data-lucide="play"></i>';
    lucide.createIcons();
}

lucide.createIcons();

function parseTimerInput(value) //future add
{
    const parts = value.trim().split(" ").filter(part => part !== "");
    
    let totalSeconds = 0;

    for(const part of parts)
    {
        const unit = part[part.length - 1].toLowerCase();
        const amount  = Number(part.slice(0,-1));
        if(unit == "h")
        {
            totalSeconds += amount * 3600;
        }
        else if (unit == "m")
        {
            totalSeconds += amount * 60;
        }
        else if (unit == "s")
        {
            totalSeconds += amount;
        }
        else if (unit == "c")
        {
            totalSeconds += amount / 100;
        }
    }
    return totalSeconds;
}

let pomodoroFocusTime = 25 * 60; //25m * 60 = 1500 segundos
let pomodoroBreakTime = 5 * 60; // 5m * 60 = 300s

let pomodoroRemaining = pomodoroFocusTime;
let pomodoroEndTime = 0;
let pomodoroInterval = null;

let pomodoroRunning = false;
let pomodoroFocus = true;

function updatePomodoroDisplay()
{
    document.getElementById("pomodoroTime").textContent = pomodoroFormatTime(pomodoroRemaining * 1000);

    if (!pomodoroFocus)
    {
        document.querySelector(".pomodoroStatus").textContent = "BREAK";
    }
    else
    {
        document.querySelector(".pomodoroStatus").textContent = "FOCUS";
    }
}

function pomodoroFormatTime(ms)
{
    const formattedMinutes = String((Math.floor(ms/60000)) % 60).padStart(2,"0"); //mesmo pra minutos e segundos
    const formattedSeconds = String((Math.floor(ms/1000)) % 60).padStart(2, "0"); //segundos

    return `${formattedMinutes}:${formattedSeconds}`;
}

document.getElementById("pomodoroToggle").addEventListener("click", togglePomodoro);

function togglePomodoro()
{
    if (pomodoroRunning)
    {
        pomodoroRemaining = (pomodoroEndTime - Date.now()) / 1000;
        stopPomodoroTimer();
    }
    else
    {
        pomodoroEndTime = Date.now() + pomodoroRemaining * 1000;
        pomodoroRunning = true;
        pomodoroInterval = setInterval(updatePomodoro, 50);
        document.getElementById("pomodoroToggle").innerHTML = '<i data-lucide="pause"></i>';
        lucide.createIcons();
    }
    updatePomodoroDisplay();
}

function stopPomodoroTimer()
{
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroRunning = false;
    document.getElementById("pomodoroToggle").innerHTML = '<i data-lucide="play"></i>';
    lucide.createIcons();
}

function updatePomodoro()
{
    pomodoroRemaining = Math.max(0,(pomodoroEndTime - Date.now()) / 1000);

    if (pomodoroRemaining == 0)
    {
        pomodoroFocus = !pomodoroFocus
        if (pomodoroFocus)
        {
            playAlarm();
            pomodoroRemaining = pomodoroFocusTime;
        }
        else
        {
            pomodoroRemaining = pomodoroBreakTime;
        }
        pomodoroEndTime = Date.now() + pomodoroRemaining * 1000;
    } 
    updatePomodoroDisplay();
}

document.getElementById("pomodoroReset").addEventListener("click", resetPomodoro)

function resetPomodoro()
{
    stopPomodoroTimer();

    pomodoroFocus = true;
    pomodoroRemaining = pomodoroFocusTime;
    pomodoroEndTime = 0;

    updatePomodoroDisplay();
}

const alarmSound = new Audio("../../assets/Chrono/audio/bell.wav");

function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play();
}