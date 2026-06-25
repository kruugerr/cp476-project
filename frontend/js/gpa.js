function changeScale() {
    let scale = document.getElementById("scale-select").value;

    if (scale === "12") {
        document.getElementById("current-gpa").innerHTML = "11.2";
        document.getElementById("projected-gpa").innerHTML = "11.3";
        document.getElementById("cumulative-gpa").innerHTML = "10.8";
    } else {
        document.getElementById("current-gpa").innerHTML = "3.72";
        document.getElementById("projected-gpa").innerHTML = "3.74";
        document.getElementById("cumulative-gpa").innerHTML = "3.61";
    }
}

function calculateNeeded() {
    let current = Number(document.getElementById("current-score").value);
    let done = Number(document.getElementById("completed-weight").value);
    let target = Number(document.getElementById("target-grade").value);
    let result = document.getElementById("result");

    if (done < 0 || done > 100 || current < 0 || target < 0) {
        result.className = "result-box bad";
        result.innerHTML = "Please enter valid numbers (0-100).";
        return;
    }

    let remaining = 100 - done;

    if (remaining === 0) {
        result.className = "result-box";
        result.innerHTML = "All work is done. Your final grade is " + current + "%.";
        return;
    }

    let pointsSoFar = current * (done / 100);
    let needed = (target - pointsSoFar) / (remaining / 100);
    needed = Math.round(needed * 10) / 10;

    if (needed > 100) {
        result.className = "result-box bad";
        result.innerHTML = "You would need " + needed + "% on the remaining " + remaining + "% of work. That is not reachable.";
    } else if (needed < 0) {
        result.className = "result-box good";
        result.innerHTML = "You have already reached your target. Even a 0% on the rest keeps you above " + target + "%.";
    } else {
        result.className = "result-box good";
        result.innerHTML = "You need " + needed + "% on the remaining " + remaining + "% of work to hit " + target + "%.";
    }
}
