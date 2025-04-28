/**************** QUERY *************************/
const { useQuestions } = require("../handlers/questions_handlers")
const { apiResult, handleRes, status } = require("../apiHelpers.js")

exports.initQuestionsHandler = (app, ctx) => {
    app.get('/:course/questions', async (req, res) => {
        handleRes(res, await getAllQuestions(ctx, req.params.course))
    });

    app.get('/:course/questions/:id', async (req, res) => {
        handleRes(res, await getQuestion(ctx, req.params.course, req.params.id))
    });

    app.post('/:course/questions', async (req, res) => {
        handleRes(res, await postQuestion(ctx, req.params.course, req.body));
    });
}




async function getAllQuestions (ctx, course) {
    const { getQuestionsByCourse } = useQuestions({db: ctx});
    const questions = await getQuestionsByCourse(course);
    return new apiResult(status.ok, questions);
}

async function getQuestion (ctx, course, id) {
    const { getQuestion } = useQuestions({db: ctx});
    const questions = await getQuestion({_id: id, course: course});
    return new apiResult(status.ok, questions);
}

async function postQuestion (course, body) {
    const { postQuestion } = useQuestions({db: ctx});
    const questions = await postQuestion({question: body, courseNumber: course});
    return new apiResult(status.ok, questions);
}