let queue = [];
let current = null;
fetch("questions").then(r => r.json())
.then(data => {
    var cont = $("#questions-cont")
    queue = data.Questions.map(q => {
        cont
        .append(
            $("<p>")
            .addClass("r-prompt")
            .text(q.prompt)
        )
        .append(
            $("<p>")
            .append(
                $("<span>")
                .addClass("tag rounded px-2 py1")
                .addClass(q.tag)
                .text(q.tag)
            )
        )
        .append(
            $("<p>")
            .append(
                $("<span>")
                .addClass("type rounded px-2 py1")
                .addClass(q.type)
                .text(q.type)
            )
        )
        .append(
            $("<p>")
            .addClass("r-answer")
            .text(q.answer)
        )
    })
    const q = queue[0];
    current = q;
    queue.shift();
    setQuestionHtml(q);
})
