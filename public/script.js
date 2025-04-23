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
  
let queue = [];
let current = null;
fetch("questions.json").then(r => r.json())
.then(data => {
    queue = data.Questions.sort(() => 0.5 - Math.random());
    const q = queue[0];
    current = q;
    queue.shift();
    setQuestionHtml(q);
})

const markCorrect = () => {
    $(".correct").removeClass("d-none")
    $(".incorrect").addClass("d-none")
}

const markIncorrect = () => {
    $(".incorrect").removeClass("d-none")
    $(".correct").addClass("d-none")
}

const showMessage = (q) => {
    if(q.message) {
        console.log(q)
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
}

const createTextQuestion = (q) => {
    const onclick = (e) => {
        const val = $(`#${q.prompt.hashCode()}`).val()
        if(val === q.answer){
            markCorrect();
        }
        else {
            markIncorrect();
        }
        showMessage(q);
        Object.values($(`input`)).forEach(element => {
            $(element).attr("disabled", true) 
         });
    }

    let $temp = $("#text-template").find(".text-template").clone();
    $($temp).find(".prompt").text(q.prompt);
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
        if (e.target.value === q.answer) {
            markCorrect();
        }
        else {
            markIncorrect();
        }
        showMessage(q);
        Object.values($(`input`)).forEach(element => {
           $(element).attr("disabled", true) 
        });
    }

    let $temp = $("#radio-template").find(".radio-template").clone();
    $($temp).find(".prompt").text(q.prompt);
    if(q.shuffle){
        q.choises = q.choises.sort(() => 0.5 - Math.random())
    }
    q.choises.map(c => {

        $($temp).find(".input-cont").append(
            $("<div>")
            .addClass("radio-container")
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
    queue.push(current)
    const q = queue.shift()
    current = q;
    setQuestionHtml(q);
    $(".incorrect").addClass("d-none");
    $(".correct").addClass("d-none")
    $("#message").text("")
}


$("#skip-btn").click(next)

