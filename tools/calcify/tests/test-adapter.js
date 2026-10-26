window.CalcifyTest = {
    run(expression){
        resetEngine();
        clearHowTo();
        clearHistory();

        inputField.value = expression;

        read();

        if(verify()) {
            tokenizer();
            if (isZero){
                return "division-by-zero";
            }
            console.log("Resultado da engine:", result);
            return result;
        }
    }
};