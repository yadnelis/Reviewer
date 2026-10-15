/**************** QUERY *************************/
const { Courses } = require("../handlers/course_handlers")
const { apiResult, handleRes, status } = require("../api_helpers");
const { getToken } = require("../helpers/jwtHelpers");

exports.initCoursesHandler = (app, ctx) => {
    app.get('/courses', async (req, res) => {
        handleRes(res, await getAllCourses(ctx, req.params.course))
    });

    app.get('/courses/:number', async (req, res) => {
        handleRes(res, await getCourse(ctx, req.params.number))
    });

    app.delete('/courses/:number', async (req, res) => {
        handleRes(res, await deleteCourse(ctx, req.params.number))
    });

    app.put('/courses/:number/name', async (req, res) => {
        handleRes(res, await updateCourse(ctx, req.params.number, "name", req.body.name))
    });

    app.put('/courses/:number/institution', async (req, res) => {
        handleRes(res, await updateCourse(ctx, req.params.number, "institution", req.body.institution))
    });

    app.put('/courses/:number/profesor', async (req, res) => {
        handleRes(res, await updateCourse(ctx, req.params.number, "details.profesor", req.body.profesor))
    });

    app.post('/courses/:institution', async (req, res) => {
        var creds = getToken(req)
        handleRes(res, await postCourse(ctx, req.body, req.params.institution, creds));
    });
}




async function getAllCourses (ctx) {
    const { getCourses } = new Courses({db: ctx});
    const courses = await getCourses({});
    return new apiResult(status.ok, courses);
}

async function getCourse (ctx, number) {
    const { getCourseByNumber } = new Courses({db: ctx});
    const courses = await getCourseByNumber(number);
    return new apiResult(status.ok, courses);
}

async function postCourse (ctx, body, institution, creds) {
    const { postCourse, postCourses } = new Courses({db: ctx});
    let courses = [];
    if(Array.isArray(body)) 
        courses = await postCourses({courses:body, createdBy: creds.username, institution: institution});
    else 
        courses = await postCourse({...body, institution: institution, createdBy: creds.username});

    return new apiResult(null, courses);
}

async function updateCourse (ctx, number, fieldName, fieldValue) {
    const { updateCourse } = new Courses({db: ctx});
    const course = updateCourse({number, fieldName, fieldValue});
    return new apiResult(status.ok, course);
}

async function deleteCourse (ctx, number) {
    const { deleteCourse } = new Courses({db: ctx});
    const course = deleteCourse({number});
    return new apiResult(status.ok, course);
}