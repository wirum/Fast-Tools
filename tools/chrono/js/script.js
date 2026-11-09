let isRunning = false;
let startTime = 0;
let elapsed = 0;
let intervalId = null;

let lapHistory = [];
let lapCount = 0;
let fastestLap = null;
let slowestLap = null;

let lapElapsed = 0;
let lapStartTime= 0;
let currentLapTime = 0;

const lapTimeDisplay = document.getElementById("lapTimeDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const startButton = document.getElementById("start");

const savedLaps = localStorage.getItem("chronoLapHistory");
const savedPomodoro = localStorage.getItem("chronoPomodoroState");

let timerInitial = 0;
let timerRemaining = 0;
let timerEndTime = 0;
let timerInterval = null;
let isTimerRunning = false;
const timerSet = document.getElementById("timerSet");

let pomodoroFocusTime = 25 * 60; //25m * 60 = 1500 segundos
let pomodoroBreakTime = 5 * 60; // 5m * 60 = 300s

let pomodoroRemaining = pomodoroFocusTime;
let pomodoroEndTime = 0;
let pomodoroInterval = null;

let pomodoroRunning = false;
let pomodoroFocus = true;

let currentTitle = null;
let activeModule = "stopwatch";

const setAlarm = document.getElementById("setAlarm");
const clearAlarmButton = document.getElementById("clearAlarm");

let alarmRunning = false;
let alarmTime = null;
let alarmTriggered = false;
let alarmInterval = null;

const alarmShortcuts = document.querySelectorAll(".alarmShortcuts button")

renderIcons();
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
if (savedPomodoro) //blitz SINISTRA (passa NADA mlk)
{
    try
    {
        const pomodoroState = JSON.parse(savedPomodoro);
        if (typeof pomodoroState !== "object" || pomodoroState === null || Array.isArray(pomodoroState))
        {
            throw new Error("Estado do pomodoro inválido")
        }
        if (typeof pomodoroState.focus === "boolean")
        {
            pomodoroFocus = pomodoroState.focus;
        }
        else
        {
            pomodoroFocus = true;
        }
        console.log(pomodoroState); 

        if (typeof pomodoroState.focusTime === "number" && pomodoroState.focusTime > 0)
        {
            pomodoroFocusTime = pomodoroState.focusTime;
        }

        if (typeof pomodoroState.breakTime === "number" && pomodoroState.breakTime > 0)
        {
            pomodoroBreakTime = pomodoroState.breakTime;
        }

        if (typeof pomodoroState.running === "boolean" && pomodoroState.running)
        {
            if (typeof pomodoroState.endTime !== "number" || pomodoroState.endTime <= 0)
            {
                throw new Error("endtime inválido");
            }
            const timeLeft = (pomodoroState.endTime - Date.now()) / 1000;
            if (timeLeft > 0)
            {
                pomodoroRemaining = timeLeft;
                pomodoroEndTime = pomodoroState.endTime;
                pomodoroRunning = true;
                pomodoroInterval = setInterval(updatePomodoro, 50);
                setButtonState(document.getElementById("pomodoroToggle"), "pause", "Pause pomodoro");
            }
            else
            {
                pomodoroRemaining = pomodoroFocus ? pomodoroFocusTime : pomodoroBreakTime; //Se pomodoroFocus for verdadeiro (true), a variável pomodoroRemaining recebe o valor de pomodoroFocusTime.
                pomodoroRunning = false;
            }
        }
        else
        {
            pomodoroRunning = false;
            if (typeof pomodoroState.remaining === "number" && Number.isFinite(pomodoroState.remaining) && pomodoroState.remaining >= 0)
            {
                pomodoroRemaining = pomodoroState.remaining;
            }
            else
            {
                if(pomodoroFocus)
                {
                    pomodoroRemaining = pomodoroFocusTime;
                }
                else
                {
                    pomodoroRemaining = pomodoroBreakTime;
                }
            }
        }
        updatePomodoroDisplay();
    }
    catch(error)
    {
        console.error("Erro ao recuperar pomodoro:", error);

        pomodoroFocus = true;
        pomodoroRunning = false;
        pomodoroRemaining = pomodoroFocusTime;
        pomodoroEndTime = 0;

        localStorage.removeItem("chronoPomodoroState");
    }
}

function toggleStopwatch() 
{
    const now = Date.now();
    activeModule = "stopwatch";

    if (isRunning) 
    {
        elapsed += now - startTime;
        lapElapsed += now - lapStartTime;
        isRunning = false;
        clearInterval(intervalId);
        updateStopwatch();
        setButtonState(startButton, "play", "Start stopwatch");

        if (currentTitle === "stopwatch") {
            refreshTabOwner();
        }
    }
    else    
    {
        startTime = now;
        lapStartTime = now;
        isRunning = true;
        intervalId = setInterval(updateStopwatch, 50);
        setButtonState(startButton, "pause", "Pause stopwatch");
        refreshTabOwner();
    }
}

function updateStopwatch()
{
    let total = 0;
    let lapTotal = lapElapsed;
    if (isRunning)
    {
        total = elapsed + (Date.now() - startTime);
        lapTotal += Date.now() - lapStartTime;

        const formatted = formatDuration(total, true);
        if (currentTitle === "stopwatch") 
        {
            document.title = `(${formatted.slice(0, -3)}) Stopwatch - Chrono`;
        }
    }
    else
    {
        total = elapsed;
    }
    timeDisplay.textContent = formatDuration(total, true);
    lapTimeDisplay.textContent = formatDuration(lapTotal, true);
}


function resetStopwatch()
{
    clearInterval(intervalId);
    isRunning = false;
    lapElapsed = 0;
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
    document.getElementById("laps").textContent = "";
    document.querySelector("#lapTimeDisplay").style.display = "none";
    document.querySelector(".lapDisplay").style.display = "none";
    setButtonState(startButton, "play", "Start stopwatch");        
    refreshTabOwner();
}

function markLap()
{
    if (!isRunning)
    {
        return;
    }

    const now = Date.now();
    let lap = lapElapsed + (now - lapStartTime);
    let lapTotal =  elapsed + (now - startTime); 

    resetLapTime(now);

    lapCount++;
    lapHistory.push({
        number: lapCount,
        time: lap,
        totalTime: lapTotal
    });
    localStorage.setItem("chronoLapHistory", JSON.stringify(lapHistory));
    checkLap(lap);
    checkSlowestLap(lap);
    console.log("Volta mais rápida: ", formatDuration(fastestLap, true));
    renderLapHistory();
    document.querySelector("#lapTimeDisplay").style.display = "flex";
    document.querySelector(".lapDisplay").style.display = "flex";
}

function resetLapTime(now)
{
    lapElapsed = 0;
    lapStartTime = now;
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
                    ${lapIcon}Lap ${lap.number}: ${formatDuration(lap.time, true)}
                    | Total: ${formatDuration(lap.totalTime, true)}
                </div>
            `;
        }).join("");
}

timerSet.addEventListener("click", () => {
    const input = document.getElementById("timerSecondaryInput").value;

    let seconds = universalInputParser(input);
    
    if (seconds === null)
    {
        return; //previne entradas vazias
    }

    activeModule = "timer";
    timerRemaining = seconds;
    timerInitial = seconds;

    if (isTimerRunning)
    {
        timerEndTime = Date.now() + timerRemaining * 1000;
    }
    updateTimerDisplay();
});

function updateTimerDisplay()
{
    const total = Math.round(timerRemaining * 1000);
    const formatted = formatDuration(total, true);

    document.getElementById("timerTime").textContent = formatted;

    if (isTimerRunning && currentTitle === "timer")
    {
        const titleTime = formatted.slice(0, -3);
        document.title = `(${titleTime}) Timer - Chrono`;
    }
}

const minuteButtons = document.querySelectorAll("[data-minutes]");

minuteButtons.forEach(button =>{
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

    if (currentTitle === "timer") {
        refreshTabOwner();
    }
    
    updateTimerDisplay();
}


function timerToggle()
{
    activeModule = "timer";
    if(isTimerRunning)
    {
        timerRemaining = Math.max(0, (timerEndTime - Date.now()) / 1000);
        stopTimer();

        if (currentTitle === "timer")
        {
            refreshTabOwner();
        }
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
        setButtonState(document.getElementById("timerToggle"), "pause", "Pause timer");
        refreshTabOwner();
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
    document.getElementById("timerSecondaryInput").value = '';
    if (currentTitle === "timer") {
        refreshTabOwner();
    }
    updateTimerDisplay();
}

function stopTimer()
{
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    setButtonState(document.getElementById("timerToggle"), "play", "Start timer");
}

function colonParser(value)
{
    const parts = value.trim().split(":");

    if (parts.length !== 3 || !isDigits(parts[0]) || !isDigits(parts[1]) || !isValidSeconds(parts[2]))
    {
        return null;
    }

    const secondParts = parts[2].split(".");
    const centiseconds = secondParts.length === 2 ? Number(secondParts[1].padEnd(2, "0")) : 0;
    const min = Number(parts[1]);
    const sec = Number(secondParts[0]);

    if (min >= 60 || sec >= 60)
    {
        return null; // pra previnir o 25:60:60
    }
    
    return Number(parts[0]) * 3600 + Number (parts[1]) * 60 + Number(secondParts[0]) + centiseconds / 100;  
}

function textParser(value)
{
    const text = value.trim().toLowerCase();

    if (text === "")
    {
        return null;
    }

    const parts = text.split(" ").filter(part => part !== "");

    let totalSeconds = 0;

    for(const part of parts)
    {
        const unit = part[part.length - 1];
        const valueStr = part.slice(0, -1);

        if (!isDigits(valueStr)) return null;

        const amount = Number(valueStr);

        if (isNaN(amount) || amount < 0)
        {
            return null;
        }

        if (unit === "h")
        {
            totalSeconds += amount * 3600;
        }
        else if (unit === "m")
        {
            totalSeconds += amount * 60;
        }
        else if (unit === "s")
        {
            totalSeconds += amount;
        }
        else if (unit === "c")
        {
            totalSeconds += amount / 100;
        }
        else
        {
            return null;
        }
    }
    return totalSeconds;
}

function updatePomodoroDisplay()
{
    let status;
    const formatted = formatDuration(pomodoroRemaining * 1000, false)
    document.getElementById("pomodoroTime").textContent = formatDuration(pomodoroRemaining * 1000, false);

    if (!pomodoroRunning)
    {
        document.querySelector(".pomodoroStatus").textContent = "Not Running..";
    }
    else
    {
        if (!pomodoroFocus)
        {
            document.querySelector(".pomodoroStatus").textContent = "BREAK";
            status = "Break";
        }
        else
        {
            document.querySelector(".pomodoroStatus").textContent = "FOCUS";
            status = "Focus";
        }
    }

    if (pomodoroRunning && currentTitle === "pomodoro")
    {
        document.title = `(${formatted}) Pomodoro (${status}) - Chrono`;
    }
}

document.getElementById("pomodoroToggle").addEventListener("click", togglePomodoro);

function togglePomodoro()
{
    activeModule = "pomodoro";
    if (pomodoroRunning)
    {
        pomodoroRemaining = (pomodoroEndTime - Date.now()) / 1000;
        stopPomodoroTimer();

        if (currentTitle === "pomodoro") {
            refreshTabOwner();
        }
    }
    else
    {
        pomodoroEndTime = Date.now() + pomodoroRemaining * 1000;
        pomodoroRunning = true;
        pomodoroInterval = setInterval(updatePomodoro, 50);
        setButtonState(document.getElementById("pomodoroToggle"), "pause", "Pause Pomodoro");
        refreshTabOwner();
    }
    savePomodoroState()
    updatePomodoroDisplay();
}

function stopPomodoroTimer()
{
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    pomodoroRunning = false;
    setButtonState(document.getElementById("pomodoroToggle"), "play", "Start Pomodoro");
}

function updatePomodoro()
{
    pomodoroRemaining = Math.max(0,(pomodoroEndTime - Date.now()) / 1000);

    if (pomodoroRemaining == 0)
    {
        playAlarm();
        pomodoroFocus = !pomodoroFocus;
        if (pomodoroFocus)
        {
            pomodoroRemaining = pomodoroFocusTime;
        }
        else
        {
            pomodoroRemaining = pomodoroBreakTime;
        }
        pomodoroEndTime = Date.now() + pomodoroRemaining * 1000;
        savePomodoroState();
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

    if (currentTitle === "pomodoro") 
    {
        refreshTabOwner();
    }
    updatePomodoroDisplay();
    savePomodoroState()
}

const alarmSound = new Audio("../../assets/Chrono/audio/bell.wav");

function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play().catch(error => console.error("Erro ao reproduzir alarme:", error)) //cria erro no console caso nao funcione
}

function renderIcons()
{
    if (window.lucide) lucide.createIcons();
}

function setButtonState(buttons, icon, label)
{
    buttons.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i>`;
    buttons.setAttribute("aria-label", label);
    renderIcons();
}

function updatePageTitle(timeString, moduleName, extraInfo = "")
{
    if (currentTitle === moduleName)
    {
        let base;

        if (extraInfo)
        {
            base = `${timeString} ${extraInfo}`;
            
        }
        else
        {
            base = timeString;
        }

        document.title = `(${base}) - Chrono`;
    }
}

function refreshTabOwner()
{
    if (isRunning)
    {
        currentTitle = "stopwatch";
    }
    else if (isTimerRunning)
    {
        currentTitle = "timer";
    }
    else if (pomodoroRunning)
    {
        currentTitle = "pomodoro";
    }
    else
    {
        currentTitle = null;
        document.title = "Chrono";
    }
}

document.addEventListener("keydown", (key) => {

    if(["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
    {
        return;
    }

    if(key.code === "Space")
    {
        key.preventDefault();
        
        if (activeModule === "stopwatch")
        {
            toggleStopwatch();
        }
        else if (activeModule === "timer")
        {
            timerToggle();
        }
        else if (activeModule === "pomodoro")
        {
            togglePomodoro();
        }
        else
        {
            toggleStopwatch();
        }
    }
    if(key.code === "KeyR")
    {
        if (activeModule === "stopwatch")
        {
            resetStopwatch();
        }
        else if (activeModule === "timer")
        {
            timerReset();
        }
        else if (activeModule === "pomodoro")
        {
            resetPomodoro();
        }
        else
        {
            resetStopwatch();
        }
    }
})

const pomodoroButtons = document.querySelectorAll("[data-pomodoro]");

pomodoroButtons.forEach(button =>{
    button.addEventListener("click", () => {
        if (pomodoroRunning)
        {
            return; // nao deve alterar se tiver rodando
        }

        const minutes = Number(button.dataset.pomodoro);
        
        if (minutes <= 0) 
        {
            return; //trava contra zeros raivosos
        }
        pomodoroFocusTime = minutes * 60;
        pomodoroBreakTime = pomodoroFocusTime * 0.2;

        if (pomodoroFocus)
        {
            pomodoroRemaining = pomodoroFocusTime;
        }

        activeModule = "pomodoro";
        savePomodoroState();
        updatePomodoroDisplay();
    });
});

document.getElementById("pomodoroSet").addEventListener("click", () =>{
    if (pomodoroRunning)
    {
        return;
    }

    const input = document.getElementById("pomodoroInput").value;
    let seconds = universalInputParser(input); //agora  com o nosso parser geral

    if (seconds === null || seconds <= 0) // checa por invalidos
    {
        return;
    }

    pomodoroFocusTime = seconds;
    pomodoroBreakTime = pomodoroFocusTime * 0.2;
    
    if (pomodoroFocus) //se tiver no focus atualiza
    {
        pomodoroRemaining = pomodoroFocusTime;
    }

    activeModule = "pomodoro"
    updatePomodoroDisplay();
    savePomodoroState();

    document.getElementById("pomodoroInput").value = "";
})

function formatDuration(ms, showCentiseconds = false)
{

    if (isNaN(ms) || ms < 0)
    {
        ms = 0;
    }
    const totalHours = Math.floor(ms / 3600000);
    const totalMinutes = Math.floor(ms / 60000);

    const formattedMinutes = String(totalMinutes % 60).padStart(2, "0");
    const formattedSeconds =  String(Math.floor(ms / 1000) % 60).padStart(2, "0");

    if (totalHours > 0 || showCentiseconds)
    {
        const formattedHours = String(totalHours).padStart(2, "0");
        let result = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

        if (showCentiseconds)
        {
            const formmatedCent = String(Math.floor(ms/10) % 100).padStart(2, "0");
            result += `.${formmatedCent}`;
        }
        return result;
    }
    return `${totalMinutes}:${formattedSeconds}`;
}

function universalInputParser(value)
{
    const input = value.trim().toLowerCase();

    if (input === "")
    {
        return null; //previne entrada vazia
    }

    if(isDigits(input))
    {
        return Number(input) * 60; //consideira minutos
    }

    if (input.includes(":")) //formato colon
    {
        const parts = input.split(":")

        //MM:SS (2 parte)
        if (parts.length === 2 && isDigits(parts[0]) && isDigits(parts[1]))
        {
            const minutes = Number(parts[0]);
            const seconds = Number(parts[1]);

            if (seconds >= 60)
            {
                return null;
            }

            return minutes * 60 + seconds;
        }

        //HH:MM:SS (3 parte)
        if (parts.length === 3)
        {
            return colonParser(input);
        }
    }
    return textParser(input);
}

function savePomodoroState()
{
    const state={
        remaining: pomodoroRemaining,
        focus: pomodoroFocus,
        running: pomodoroRunning,
        endTime: pomodoroEndTime,
        focusTime: pomodoroFocusTime,
        breakTime: pomodoroBreakTime
    };
    localStorage.setItem("chronoPomodoroState", JSON.stringify(state));
}

setAlarm.addEventListener("click", () => {
    const alarmInput = document.getElementById("alarmInput").value;
    console.log(alarmInput)

    if (!alarmInput)
    {
        return;
    }

    alarmTime = alarmInput;
    alarmTriggered = false;

    toggleAlarm();
    updateAlarmDisplay(alarmInput);
    });

function updateAlarmDisplay(value)
{
    document.getElementById("alarmTime").textContent = value;  
}

function toggleAlarm()
{
    console.log("Toggle:", alarmRunning);
    if(alarmRunning)
    {
        stopAlarm()
        setButtonState(setAlarm, "play", "Start alarm")
    }
    else
    {
        document.querySelector(".alarmStatus").textContent = "Alarm Set";
        alarmRunning = true;
        setButtonState(setAlarm, "pause", "Stop alarm")
        alarmInterval = setInterval(checkAlarm, 1000)
    }
}

clearAlarmButton.addEventListener("click", clearAlarm);

function clearAlarm()
{
    alarmRunning = false;
    setButtonState(setAlarm, "play", "Start alarm");
    alarmTriggered = false;
    alarmTime = null;
    clearInterval(alarmInterval)
    alarmInterval = null;
    document.getElementById("alarmTime").textContent = "00:00";
    document.getElementById("alarmInput").value = "";
    document.querySelector(".alarmStatus").textContent = "Not running.."
}

function getCurrentTime()
{
    const now = new Date();

    return now.toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });
}

function checkAlarm()
{
    console.log("Verificando alarme...");
    if (!alarmRunning || !alarmTime)
    {
        return; //previne virar um inferno auditivo
    }
    if(getCurrentTime() === alarmTime && !alarmTriggered)
    {
        playAlarm();
        alarmTriggered = true;
    }
}

function stopAlarm()
{
    alarmRunning = false;
    clearInterval(alarmInterval)
    alarmInterval = null;
    document.querySelector(".alarmStatus").textContent = "Alarm stopped"
}

alarmShortcuts.forEach(button => {
    button.addEventListener("click", () =>{
        const minuteOffset = Number(button.getAttribute("alarm-minutes"));

        const alarmInput = document.getElementById("alarmInput");
        if (!alarmInput.value)
        {
            return;
        }
        let [hours, minutes] = alarmInput.value.split(":").map(Number);

        let totalMinutes = hours * 60 + minutes;
        totalMinutes += minuteOffset;
        totalMinutes = (totalMinutes + 1440) % 1440;    

        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;

        const formattedTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;

        alarmInput.value = formattedTime;
        alarmTime = formattedTime;
        updateAlarmDisplay(formattedTime);
        alarmTriggered = false;
    }); 
});