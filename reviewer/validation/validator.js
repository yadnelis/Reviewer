exports.validate = (subject) => {
    const validators = subject?.getValidators();
    let result = { success: true , errors: []};

    if(Array.isArray(validators)) {
        return validators.reduce(
            (prev, curr) => {
                let failed = curr.run?.();
                if (failed){
                    prev.success = false;
                    prev.errors.push(`[${curr.field}]: ${curr.message}`)
                }

                return prev;
            }, 
        result);
    }
    else if (validators === false) {
        return result;
    }
    else {
        return { success: false , errors: [`Could not validate '${typeof(subject)}'`]}
    }
}

exports.validateArray = (collection) => collection.reduce((prev, curr, index) => {
    var result = this.validate(curr)
    if(!result.success) {
        prev.success = false;
        prev.errors[index] = result.errors;
    }
    return prev;
}, {success: true, errors: {}});

exports.validateUpdate = (object) => {
    const validators = object.getValidators();
    let result = { success: true , errors: []};

    if(validators?.length > 0) {
        return validators.reduce((prev, curr) => {
            if(object[curr.field] === undefined)
                return prev;
            
            let failed = curr.run?.();

            if (failed){
                prev.success = false;
                prev.errors.push(`[${curr.field}]: ${curr.message}`)
            }
            
            return prev;
        }, result);
    }
    else if (validators === false) {
        return result;
    }
    else {
        return { success: false , errors: [`Could not validate ${typeof(object)}`]}
    }
}