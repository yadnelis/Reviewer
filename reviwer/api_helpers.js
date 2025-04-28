exports.apiResult = class {
    constructor(status, content) {
        this.status = status;
        this.content = content;
    }
}

exports.status = {
    ok: "200",
    noContent: "203",
    clientError: "400",
    error: "500"
}

exports.handleRes = (res, result) => {
    if(result?.status === this.status.ok) {
        if(res)
            res.json(result.content);
        else 
            res.sendStatus(204);

    }
    else {
        res.sendStatus(result?.status??400);
    }
    
}