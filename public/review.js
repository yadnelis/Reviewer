let queue = [];
let current = null;
fetch("questions.json").then(r => r.json())
.then(data => {
    var cont = $("#questions-cont")
    queue = data.Questions.map(q => {
        cont.append(
            $("<div>")
            .append(
                $("<p>")
                .text(q.prompt)
            )
            .append(
                $("<p>")
                .text(q.answer)
            )
        )
    })
    const q = queue[0];
    current = q;
    queue.shift();
    setQuestionHtml(q);
})
