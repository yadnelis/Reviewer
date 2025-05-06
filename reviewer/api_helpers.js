exports.apiResult = class {
    constructor(status, content) {
        this.status = status;
        this.content = content;
    }
}

exports.status = {
    ok: 200,
    noContent: 203,
    clientError: 400,
    error: 500
}

exports.handleRes = (res, result) => {
    if(result.content?.errors || result.content?.error || result.status >= 400) {
        if(result.content) {
            res.status(result?.status??400);
            res.json(result.content);
        }
        else {
            res.sendStatus(result?.status??400);
        }
    }
    else {
        if(res)
            res.json(result.content);
        else 
            res.sendStatus(204);

    }
}