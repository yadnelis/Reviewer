String.prototype.hashCode = function() {
    var hash = 0,
      i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

let questions = null;
let queue = sessionStorage.queue ? JSON.parse(sessionStorage.queue) : null;
let current = sessionStorage.current ? JSON.parse(sessionStorage.current) : null;
let answered = sessionStorage.answered ? JSON.parse(sessionStorage.answered) : 0;
let correctCount = sessionStorage.correctCount ? JSON.parse(sessionStorage.correctCount) : 0;
let wrongCount = sessionStorage.wrongCount ? JSON.parse(sessionStorage.wrongCount) : 0;
let isCorrect = sessionStorage.answered ? JSON.parse(sessionStorage.answered) : null;
let correctList = sessionStorage.correctList ? JSON.parse(sessionStorage.correctList) : [];
let wrongList = sessionStorage.wrongList ? JSON.parse(sessionStorage.wrongList) : [];
let total = sessionStorage.total ? JSON.parse(sessionStorage.total) : 0;
let tags = sessionStorage.tags ? JSON.parse(sessionStorage.tags) : {};


const setCounts = () => {
    $("#right-count").text(correctCount);
    $("#wrong-count").text(wrongCount);
    $("#questions-total-count").text(total);
    $("#questions-answered-count").text(answered);
    $(".incorrect").addClass("d-none");
    $(".correct").addClass("d-none");
}

setCounts();

const markCorrect = () => {
    isCorrect = true
    $(".correct").removeClass("d-none");
    $(".incorrect").addClass("d-none");
}

const markIncorrect = () => {
    isCorrect = false
    $(".incorrect").removeClass("d-none");
    $(".correct").addClass("d-none");
}

const onAnswer = (correct, q) => {
    if(correct){
        markCorrect();
    }
    else {
        markIncorrect();
    }
    showMessage(q);
    Object.values($(`input`)).forEach(element => {
        $(element).prop("disabled", true);
     });
}

const showMessage = (q) => {
    if(q.answer) {
        $("#answer").text("Answer: " + q.answer)
    }
    if(q.message) {
        $("#message").text(q.message)
    }
}

const setQuestionHtml = (q) => {
    const $cont = $("#questions-cont")


    if(q.type == "radio") 
        $cont.html(createRadioQuestion(q));

    else if(q.type == "torf") 
        $cont.html(createTrueOrFalseQuestion(q));
    
    else {
        $cont.html(createTextQuestion(q));
    }
    $($cont).find(".prompt").html(
        $("<span>")
        .append(
            $("<span>")
            .addClass("tag")
            .addClass(q.tag)
            .text(q.tag)
        )
        .append($("<span>").text(q.prompt))
    );
    if(q.img) {
        $cont.prepend(
            $("<img>")
            .addClass("w-70vw")
            .addClass("mb-2")
            .attr("src", q.img)
            .attr("alt", "image :)")
        )
    }
    if(q.wrong) {
        $($cont).find(".prompt").append(
            $("<span>")
            .addClass("wrong")
            .text(" (Repeated Question)")
        )
    }
}

const createTextQuestion = (q) => {
    const onclick = (e) => {
        let val = $(`#${q.prompt.hashCode()}`).val()
        if(q.discardFormatting) {
            val = val.toLowerCase().replaceAll(" ", "");
            q.answer = q.answer.toLowerCase().replaceAll(" ", "");
        }
        if(q.lowerCase) {
            val = val.toLowerCase();
            q.answer = q.answer.toLowerCase();
        }
        val = val.trim();
        onAnswer(val === q.answer, q);
    }

    let $temp = $("#text-template").find(".text-template").clone();
    $($temp).find(".input-cont").append(
        $("<div>")
        .append(
            $("<input>")
            .attr("type", "text")
            .attr("name", q.prompt.hashCode())
            .attr("id", q.prompt.hashCode())
            .change()
        )
        .append(
            $("<button>")
            .text("Enter")
            .click(onclick)
        )
    )
    return $temp
}

const createRadioQuestion = (q) => {
    let getOnClick = (e) => {
        onAnswer(e.target.value === q.answer, q)
    }

    let $temp = $("#radio-template").find(".radio-template").clone();
    if(q.scramble){
        q.choises = q.choises.sort(() => 0.5 - Math.random())
    }
    q.choises.map(c => {

        $($temp).find(".input-cont").append(
            $("<div>")
            .addClass("radio-container")
            .addClass("d-flex")
            .addClass("flex-nowrap")
            .append(
                $("<input>")
                .attr("type", "radio")
                .attr("name", q.prompt.hashCode())
                .attr("id", q.prompt.hashCode()+c.hashCode())
                .attr("value", c)
                .change(getOnClick)
            )
            .append(
                $("<label>")
                .attr("for", q.prompt.hashCode()+c.hashCode())
                .text(c)
            )
        )
    })
    return $temp
}

const createTrueOrFalseQuestion = (q) => {
    q.choises = ["true", "false"]
    q.answer = q.answer.toString();
    return createRadioQuestion(q)
}

const next = () => {
    if(isCorrect === true) {
        correctCount++;
        isCorrect = true;
        correctList.push(current);
        answered++;
    }
    else if(isCorrect === false) {
        answered++;
        isCorrect = false;
        wrongCount++;
        wrongList.push(current);
    }
    else {
        queue.push(current)
    }
    
    setCounts();

    let q;
    if(queue?.length > 0) {
        q = queue.shift();
    }
    else if (wrongList?.length > 0) {
        q = wrongList.shift();
        q.wrong = true;
    }

    if (q) {
        current = q;
        setQuestionHtml(q);
        $(".incorrect").addClass("d-none");
        $(".correct").addClass("d-none")
        $("#message").text("")
        $("#answer").text("")
        isCorrect = null;
    }
    else {
        if(confirm("No questions left over, reset?")) {
            getQuestions();
        }
    }
}

const filter = (tag) => {
    if(confirm("This operation will reset your current progress. Proceed?")) {
        queue = questions.filter(q => !tag || q.tag.includes(tag)).sort(() => 0.5 - Math.random());
        answered = 0;
        correctCount = 0;
        wrongCount = 0;
        total = queue.length;
        const q = queue.shift();
        isCorrect = null;
        correctList = [];
        wrongList = [];
        current = q;
        setCounts();
        setQuestionHtml(q);
    }
}

const getQuestions = (rewrite) => {
    fetch("questions").then(r => r.json())
    .then(data => {
        questions = data.Questions;
        if(!queue || rewrite) {
            queue = data.Questions.sort(() => 0.5 - Math.random());
            total = data.Questions.length;
            ;
            answered = 0;
            correctCount = 0;
            wrongCount = 0;
            isCorrect = null;
            correctList = [];
            wrongList = [];
            const q = queue.shift();
            current = q;
            setCounts();
            setQuestionHtml(q);
        }
        else if(current) {
            $("#questions-total-count").text(total);
            setQuestionHtml(current);
        }
        else {
            $("#questions-total-count").text(total);
            next();
        }
        setTags();
    })
}

getQuestions();

const setTags = () => {
    tags = questions.reduce((prev, curr) => {
        prev[curr.tag] = prev[curr.tag] != undefined ? prev[curr.tag]+1 : 1;
        return prev;
    }, {});

    $("#tag-cont").html( $("<button>")
    .addClass("tag-btn")
    .html(
        $("<span>")
        .text(`All (${total})`)
    )
    .click(() => filter()));

    Object.entries(tags).forEach(([tag, count]) => {
        $("#tag-cont").append(
            $("<button>")
            .addClass("tag-btn")
            .html(
                $("<span>")
                .text(`${tag} (${count})`)
            )
            .click(() => filter(tag))
        )
    }) 
}


$("#skip-btn").click(next);
$("#reset-btn").click(() => {
    getQuestions(true)
    alert("reset done");
});

window.addEventListener('beforeunload', function(event) {
    sessionStorage.isCorrect = JSON.stringify(isCorrect);
    sessionStorage.wrongCount = JSON.stringify(wrongCount);
    sessionStorage.current = JSON.stringify(current);
    sessionStorage.correctCount = JSON.stringify(correctCount);
    sessionStorage.correctList = JSON.stringify(correctList);
    sessionStorage.wrongList = JSON.stringify(wrongList);
    sessionStorage.answered = JSON.stringify(answered);
    sessionStorage.queue = JSON.stringify(queue);
    sessionStorage.total = JSON.stringify(total);
    sessionStorage.questions = JSON.stringify(questions);
    sessionStorage.tags = JSON.stringify(tags);
});

