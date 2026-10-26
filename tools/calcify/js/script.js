  /*-----------------/
 /   GLOBAL STATE   /
/-----------------*/

let result = 0;
let click = 0
let input = 0;
let oddeven = 0;
let calchistory = [];
let howTo = [];
let historytext = "";
let cleanInput = [];
let isZero = false;
let parEval = "";
let evalUsed = false;
let parLength = 0;
let parPos = [];




  /*----------------------/
 /   CALCULATION START   /
/----------------------*/

function calculate() {
    resetEngine();
    clearHowTo();
    read();

    if (verify()) {
        let originalInput = input;

        tokenizer();
        if (!isZero) 
        {
            calcHistory(originalInput, result);

            document.getElementById("result").innerText = `Result: ${result}`;
            document.querySelector(".HowTo").style.display = "block";
            renderHowTo();
        }
        else
        {
            document.getElementById("result").innerText = "You can't divide by zero you dummy!";
        }
    }   
}


function read() {
    input = document.getElementById("Input").value;

    input = input.replaceAll("×", "*").replaceAll("÷", "/");
}


function verify() {

    let invalidChars = [];

    if (input.trim() == "" || isOperator(input[input.length - 1])) {
        document.getElementById("result").innerText = "You forgot an value..";
        return false;
    }

    for(let i = 0; i < input.length; i++)
    {
        const char = input[i];

        if(char.trim() === "") {
            continue;
        }

        if (
            !isNumber(char) &&
            !isOperator(char) &&
            !isDecimal(char) &&
            !isParenthesis(char)
        ) {
            invalidChars.push(char);
        }
    }

    if(invalidChars.length > 0) {
        alert(`These characters will be ingored: ${invalidChars.join(", ")}`);
    }

    for (let i = 0; i < input.length; i++) {
        if (isOperator(input[i]) && isOperator(input[i + 1])) {
            let op1 = input[i];
            let op2 = input[i + 1];
            if(op1 == op2)
            {
                let previousCharacter = input[i-1];

                let isNegative = false;
                if(op1 == "-" && op2 == "-")
                    if(isNumber(previousCharacter) || previousCharacter == ")") {
                        isNegative = true;
                    }
                if (!isNegative)
                {
                    document.getElementById("result").innerText = "You can't put two consectutive operators!"
                    return false;
                }
            }
            const invalidPairs = [
                ["+" , "*"], 
                ["+" , "/"],
                ["+" , "%"],

                ["*" , "/"],
                ["*" , "%"],

                ["/" , "*"],
                ["/" , "%"],

                ["^" , "*"],
                ["^" , "/"],
                ["^" , "%"],
            ];

            if (invalidPairs.some(pair =>
                pair[0] === op1 && pair[1] === op2 
                
                /*
                some = percorre procurando algum true
                pair => ... = condição que deve dar true
                
                achou pelo menos um?   -> true
                não achou nenhum?      -> false
                */

            )) {
                document.getElementById("result").innerText = "Your operators are in an invalid context!"

                return false;
            }

    }
}

    let parentheses = 0;
    for(let i = 0; i < input.length; i++)
    {
        if(input[i] === "(")
        {
            parentheses++;
        }
        else if (input[i] === ")")
        {
            parentheses--;

            if(parentheses < 0)
            {
                document.getElementById("result").innerText = "Unbalanced parentheses!";
            
                return false;
            }
        }
    }
    if(parentheses !== 0)
    {
        document.getElementById("result").innerText = "Unbalanced parentheses!";
        return false;   
    }

    return true;
}





  /*----------------------/
 /   INPUT PROCESSING    /
/----------------------*/


function tokenizer() {
    clearInput();
    let used = false;
    let y = 0;
    let currentNumber = "";
    read();
    for (let i = 0; i < input.length; i++) {
        if (!used) {
            prepareInput(cleanInput, y);
        }
        currentNumber = input[i]
        if (isParenthesis(currentNumber)) {
            if (currentNumber == "(") {
                cleanInput[y] = currentNumber;
                y++;
                used = false;
            }
            else if (currentNumber == ")") {
                if(used)
                {
                    cleanInput[y] = parseFloat(cleanInput[y]);
                    y++;
                }
                cleanInput[y] = currentNumber;
                y++;
                used = false;
            }

        }
        else if (isNumber(currentNumber)) {
            cleanInput[y] += currentNumber;
            used = true;
        }
        else if (isOperator(currentNumber)) {
            if (used) {
                cleanInput[y] = parseFloat(cleanInput[y]);
                y++;
                prepareInput(cleanInput, y);
            }
            cleanInput[y] = currentNumber;
            y++;
            used = false;
        }
        else if (isDecimal(currentNumber)) {
            if (currentNumber == ",") {
                currentNumber = ".";
            }
            cleanInput[y] += currentNumber;
            used = true;
        }
    }
    if (used)
    {
        cleanInput[y] = parseFloat(cleanInput[y]);
    }

    /*Millennium Bug
    Born: 16/10/2026
    Killed: 17/10/2026


    he appeared again on  17/10 (:cry:)
    Cause of death: normalizeUnary()
    RAM consumed during lifetime: regrettable*/
    // -5 is now, remarkably, just -5.
    normalizeUnary(cleanInput);


    if(verifyExpression(cleanInput))
    {
        if (cleanInput.length === 1) 
        {
            result = cleanInput[0];
        }
        else 
        {
            while (cleanInput.length > 1) {
                let previousLength = cleanInput.length;

                evaluate();

                if (cleanInput.length >= previousLength)
                {
                    error("expression could not be evaluated");
                    break;
                    // dont be feisty -5 and your brothers -+5 & +-5 === the evil trio
                }
            }
        }
    }
}


function prepareInput(array, i) {
    array[i] = "";
}


function normalizeUnary(array)
{   
    let changed;
    let i = 0;
    while(i < array.length)
    {
        changed = false;
        if(isUnary(array, i))
        {
            if(array[i + 1] !== undefined)
            {
                if (array[i + 1] == "+" || array[i+1] == "-")
                {
                    array.splice(i, 2, opLogic(array, i, i + 1));
                    changed = true;
                }
                else if(isNumberToken(array[i + 1]))
                {
                    if(array[i + 2] !== "^")
                    {
                        if (array[i] == "-")
                        {
                            array.splice(i,2,Number(array[i + 1]) * -1); //inverte o sinal
                        }
                        else
                        {
                            array.splice(i , 2, Number(array[i+1]));
                        }
                        changed = true;
                    }
                }
            }
        }
        if(changed)
        {
            if (i > 0)
            {
                i--;
            }

        }
        else
        {
            i++;
        }
    }
}


function isUnary(array ,i)
{

    if (array[i] == "+" || array[i] == "-")
    {
        if(i == 0)
        {
            return true;
        }
        let previous = array[i - 1]
        if (isNumber(previous) || isParenthesisLog(previous) == ")")
        {
            return false;
        }
        if(isOperator(previous) || isParenthesisLog(previous) == "(")
        {
          return true;
        }
    }
    return false;
}


function opLogic(array,x,y)
{
    if(array[x] == array[y])
    {
        return "+";
    }
    else
    {
        return "-";
    }
}


function verifyExpression(array)
{
    for (let i = 0; i < array.length; i++)
    { 
        if (isNumberToken(array[i]))
        {
            continue;
        }
        else if (isOperator(array[i]))
        {
            if (isUnary(array, i))
            {
                continue;   
            }
            else
            {
                if (i + 1 >= array.length)
                {
                    error("Expression is incomplete!");
                    return false;
                }
            }
        }
        else if (isParenthesis(array[i]))
        {
            continue;
        }
        else 
        {   
            error("Something went wrong..");
            return false; // teoricamente se chegar um animal aqui, alguma coisa está MUITO errada. E THE TRIO vai ser chamado ao RH (medo)
        }
    }
    return true;
}




  /*----------------------/
 /   TOKEN HELPERS       /
/----------------------*/



function isNumberToken(isNum)
{
    if(typeof isNum === "number")
    {
        return true;
    }
    else
    {
        return false;
    }
}


function isNumber(isNum) {
    return ["0" , "1" , "2" , "3" , "4" , "5" , "6" , "7" , "8" , "9"].includes(String(isNum));
}


function isOperator(isOpp) {
    return ["+" , "-" , "*" , "/" , "^" , "%"].includes(String(isOpp));
}


function isDecimal(isDec) {
    return ["," , "."].includes(String(isDec));
}


function isParenthesis(char) {
    if (char == "(" || char == ")") {
        return true;
    }
    return false;
}


function isParenthesisLog(char) {
    if (char == "(" || char == ")") {
        return [char];
    }
    return false;
}



  /*----------------------/
 /   EXPRESSION ENGINE   /
/----------------------*/


  function scan(array) {
    let i
    for (i = 0; i < array.length; i++) {
        if (array[i] == "(") {
            return [0, joinEm(array), i];
        }
    }
    for(i = array.length-1; i>= 0; i--)
    {
        if(array[i] == "^") 
        {
            return [1, findEm(array,i), i];
        }
    }
    for (i = 0; i < array.length; i++) {
        if (["*","/","%"].includes(array[i])) {
            return [2, findEm(array, i), i];
        }
    }
    for (i = 0; i < array.length; i++) {
        if (["+", "-"].includes(array[i])) {
            return [3, findEm(array, i), i];
        }
    }
}


function joinEm(array) {
    let open = 0;
    let close = 0;

    for (let i = 0; array.length > i; i++) {
        if (array[i] == "(") {
            open = i;
        }
        else if (array[i] == ")") {
            close = i;
            return [open, close];
        }
    }
}


// ⚠⚠⚠⚠STRUCTURAL COMPONENT - DO NOT MODIFY⚠⚠⚠⚠
// lilbro, middlebro and bigbro are critical to the structural integrity
// of the Calcify expression engine.
// Removing or "improving" them may result in total building collapse.
// ISO 2000:2026 - THE BROS Certified
// "i dont know how it works, just works, and its simply so good astra 6 on ultra couldn't break it." - lucas

function findEm(array, opPos) {
    let lilbro = opPos; // load-bearing variable
    let middlebro = opPos;
    let bigbro = opPos;
    lilbro--; //lil
    bigbro++; //not lil  
    lilbro = array[lilbro];
    middlebro = array[middlebro];
    bigbro = array[bigbro];
    return [lilbro, middlebro, bigbro]; //the trio
}


function evaluate() {
    let operation
    if (parEval == "") {
        parEval = scan(cleanInput);
    }
    operation = parEval;

    let pos = operation[2];
    pos--;
    if (operation[0] == 0 && !evalUsed) {
        parPos = [operation[1][0], operation[1][1]];
        operation = cleanInput.slice(operation[1][0] + 1, operation[1][1]);
        parLength = operation.length;

        if(parLength == 1)
        {
            result = cleanFloat(operation[0]);
            getRidOfTs(cleanInput, parPos[0], 3);
            parEval = "";
            evalUsed = false;
            parPos = [];

            return;
        }

        parEval = scan(operation);
        evalUsed = true;
        evaluate();
        return;
    }
    else if (operation[0] == 1 && operation[1][1] == "^")
    {
        result = cleanFloat(operation[1][0] ** operation [1][2])
    }
    else if (operation[0] == 2) {
        if (operation[1][1] == "/") {
            if (operation[1][2] == 0) {
                isZero = true;
                return;
            }
            else {
                result = cleanFloat(operation[1][0] / operation[1][2]);
            }
        }
        else if (operation[1][1] == "*") {
            result = cleanFloat(operation[1][0] * operation[1][2]);
        }
        else if (operation[1][1] == "%")
        {
            result = cleanFloat(operation[1][0] % operation[1][2]);
        }
        else {
            error("Something went wrong..");
        }
    }
    else if (operation[0] == 3) {
        if (operation[1][1] == "+") {
            result = cleanFloat(operation[1][0] + operation[1][2]);
        }
        else if (operation[1][1] == "-") {
            result = cleanFloat(operation[1][0] - operation[1][2]);        }
        else {
            error("Something went wrong..");
        }
    }
    if (evalUsed) {
        if (parLength == 3) {
            parEval = ""
            steps([...cleanInput], parPos[0], parPos[1], result) ; //📸 click (antes do get rid assassinar)
            getRidOfTs(cleanInput, parPos[0], 5);//esse mano aqui desce a rapa 🔪
            normalizeUnary(cleanInput)

            if (cleanInput.length === 1) {
                result = cleanInput[0];
            }

            evalUsed = false;
            parPos = [];

        }
        else {
            let realPos = parPos[0] + operation[2];
            steps([...cleanInput], realPos, realPos + 2, result); // 📸 click
            getRidOfTs(cleanInput, realPos, 3); // 🔪 *som dramático de faca*
            parPos[1] -= 2;

            let newPar = cleanInput.slice(parPos[0]+1,parPos[1]);
            parLength = newPar.length;

            parEval = scan(newPar);

        }
    }
    else {
        steps([...cleanInput], operation[2]-1, operation[2] + 1, result); // 📸 click
        getRidOfTs(cleanInput, pos, 3); // 🔪 *jack estripador intensifies*
        
        let beforeUnary = [...cleanInput];

        normalizeUnary(cleanInput);

        if(cleanInput.length === 1)
        {
            result = cleanInput[0];

            if(beforeUnary.length !== cleanInput.length)
            {
                steps(beforeUnary, 0 , beforeUnary.length -1, result);
            }
        }
        parEval = "";
    }
}


function getRidOfTs(array, start, quantity) {
    // arremessa fora os 3 já calculados, chamados no evaluate depois do scan (ninguém gosta deles)
    // nosso assasino de aluguel
    let notaproblem = "";
    let problemtofix = array;
    let problem = problemtofix.splice(start, quantity, result);
    notaproblem = problemtofix;
    return notaproblem;//anymore
}


function cleanFloat(value)
{
    if (!Number.isFinite(value))
    {
        return value;
    }

    return Number.parseFloat(value.toPrecision(15));
}




  /*----------------------/
 /   HOW TO / OUTPUT     /
/----------------------*/


function steps(expression, start, end, res) {

    let frame = 
    {
        expression,
        start,
        end,
        result: res
    }

    howTo.push(frame);
    
}


function renderHowTo()
{
    let howToElement = document.getElementById("howTo");
    howToElement.innerHTML = "";
    for(let frame of howTo)
    {
        let line = document.createElement("div");
        for (let i = 0; i < frame.expression.length; i++)
        {
            let tokenElement = document.createElement("span");
            tokenElement.innerText = frame.expression[i];
            if(i >= frame.start && i <= frame.end)
            {
                tokenElement.classList.add("active-step");
                
            }
            line.appendChild(tokenElement);
        }howToElement.appendChild(line);
        
    }
    if(howTo.length > 0)
    {
        let finalLine = document.createElement("div");
        finalLine.innerText = howTo[howTo.length - 1].result;
        howToElement.appendChild(finalLine);
    }
}


function showMe() {
    if (click == 0) {
        document.getElementById("howTo").style.display = "block";
        click++;
    }
    else {
        document.getElementById("howTo").style.display = "none";
        click = 0;
    }
}


function error(message) {
    alert(message);
}

  /*----------------------/
 /   HISTORY / STORAGE   /
/----------------------*/

window.addEventListener("load", loadHistory);


function loadHistory() {
    if (JSON.parse(localStorage.getItem("history")) != null) {
        calchistory = JSON.parse(localStorage.getItem("history"));
        historytext = calchistory.join("\n");
        document.getElementById("calcHistory").innerText = historytext;
    }
    else {
        return;
    }

}


function calcHistory(nums, res) {
    calchistory.push(`${nums} = ${res}`);
    historytext = calchistory.join("\n");
    document.getElementById("calcHistory").innerText = historytext;
    localStorage.setItem("history", JSON.stringify(calchistory));
}


function copyResult() {
    navigator.clipboard.writeText(result);
    document.getElementById("copyResult").innerText = "Copied!";
}


function copyHistory() {
    let historytext = calchistory.join("\n");
    navigator.clipboard.writeText(historytext);
    document.getElementById("copyHistory").innerText = "Copied!";
}


function clearHistory() {
    document.getElementById("calcHistory").innerText = "";
    calchistory = [];
    localStorage.removeItem("history");
}






  /*----------------------/
 /   RESET / CLEAR       /
/----------------------*/



function clearHowTo() {
    howTo = [];
    document.getElementById("howTo").innerText = "";
}


function clearAll() {
    document.getElementById("result").innerText = "Result: 0";
    document.getElementById("Input").value = "";
    document.getElementById("howTo").innerText = "";

    resetEngine();

    input = 0;
    calchistory = [];
    howTo = [];
    historytext = [""];
}


function  resetEngine()
{
    clearInput();

    isZero = false;
    parEval = "";
    evalUsed = false;
    parLength = 0;
    parPos = [];
}


function clearInput() {
    cleanInput = [];
    result = 0;
}



   /*----------------------/
  /   ODD OR EVEN         /
 /----------------------*/

function readOdd() {
    oddeven = document.getElementById("OddOrEven").value;
    oddeven = Number.parseFloat(oddeven);
}


function verifyOdd() {
    if (isNaN(oddeven)) {
        document.getElementById("result2").innerText = "You forgot the value..";
        return false;
    }
    else {
        return true;
    }
}


function oddOreven() {
    readOdd();
    if (verifyOdd()) {
        if (oddeven % 2 === 0) {
            document.getElementById("result2").innerText = "Even Number!";
        }
        else {
            document.getElementById("result2").innerText = "Odd Number!";
        }
    }
    else {
        return;
    }

}



  /*----------------------/
 /   MOBILE KEYPAD       /
/----------------------*/

const inputField = document.getElementById("Input");
const deleteKey = document.querySelector(".delete-key");

if (inputField && deleteKey) {
    document.querySelectorAll(".key[data-value]").forEach(button => {
        button.addEventListener("click", () => {
            const start = inputField.selectionStart;
            const end = inputField.selectionEnd;

            const before = inputField.value.slice(0,start);
            const after = inputField.value.slice(end);

            const value = button.dataset.value;

            inputField.value = before + value + after;

            const newPosition = start + value.length;

            inputField.setSelectionRange(newPosition, newPosition);
            inputField.focus(); //devolve o foco pro input
        });
    });

    deleteKey.addEventListener("click", () => {
        const cursorStart= inputField.selectionStart;
        const cursorEnd = inputField.selectionEnd;
        // se tiver algum texto selecionado
        if (cursorStart !== cursorEnd) {
            
            const beforeSelection = inputField.value.slice(0, cursorStart);
            const afterSelection = inputField.value.slice(cursorEnd);

            inputField.value = beforeSelection + afterSelection;

            inputField.setSelectionRange(cursorStart, cursorStart);
        }
        // se não tiver seleção apaga o caractere anterior ao cursor
        else if (cursorStart > 0) {

            const beforeCursor = inputField.value.slice(0, cursorStart -1);
            const afterCursor = inputField.value.slice(cursorStart);

            inputField.value = beforeCursor + afterCursor;

            const newCursorPosition = cursorStart - 1;

            inputField.setSelectionRange(
                newCursorPosition,
                newCursorPosition
            );

        }
        inputField.focus(); //devolve o foco pro input
    });

    inputField.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            calculate();
        }
    });
}