/**************** QUERY *************************/
const { useQuestions } = require("../handlers/questions_handlers")
const { apiResult, handleRes, status } = require("../api_helpers");
const { getToken } = require("../helpers/jwtHelpers");

exports.initQuestionsHandler = (app, ctx) => {
    app.get('/:course/questions', async (req, res) => {
        handleRes(res, await getAllQuestions(ctx, req.params.course))
    });

    app.get('/:course/questions/:id', async (req, res) => {
        handleRes(res, await getQuestion(ctx, req.params.course, req.params.id))
    });

    app.post('/:course/questions', async (req, res) => {
        let creds = getToken(req)
        handleRes(res, await postQuestions(ctx, req.params.course, req.body, creds));
    });

    app.delete('/:course/questions/:id', async (req, res) => {
        handleRes(res, await deleteQuestion(ctx, req.params.id));
    });

    app.put('/:course/questions/:id', async (req, res) => {
        handleRes(res, await updateQuestion(ctx, req.params.id, req.body));
    });

    app.put('/:course/questions/:id/tags', async (req, res) => {
        handleRes(res, await updateQuestionPropery(ctx, req.params.id, "tags", req.body?.tags));
    });

    app.put('/:course/questions/:id/answer', async (req, res) => {
        handleRes(res, await updateQuestionPropery(ctx, req.params.id, "answer", req.body?.answer));
    });

    app.put('/:course/questions/:id/choices', async (req, res) => {
        handleRes(res, await updateQuestionPropery(ctx, req.params.id, "choices", req.body?.choices));
    });

    app.put('/:course/questions/:id/type', async (req, res) => {
        handleRes(res, await updateQuestionPropery(ctx, req.params.id, "type", req.body?.type));
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

async function postQuestions (ctx, course, body, creds) {
    const { postQuestions } = useQuestions({db: ctx});
    const questions = await postQuestions({questions: body.map(q => ({...q, createdBy: creds.username})), courseNumber: course, createdBy: creds.username});
    return new apiResult(null, questions);
}

async function deleteQuestion (ctx, id) {
    const { deleteQuestion } = useQuestions({db: ctx});
    const questions = await deleteQuestion({_id: id});
    return new apiResult(null, questions);
}

async function updateQuestionPropery (ctx, id, fieldName, fieldValue) {
    const { updateQuestionProperty } = useQuestions({db: ctx});
    const questions = await updateQuestion({_id: id, fieldName, fieldValue});
    return new apiResult(null, questions);
}

async function updateQuestion (ctx, id, question) {
    const { updateQuestion } = useQuestions({db: ctx});
    const questions = await updateQuestion({_id: id, question});
    return new apiResult(null, questions);
}

