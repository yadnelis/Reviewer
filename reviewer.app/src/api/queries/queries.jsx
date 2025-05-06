import { useEffect, useState } from "react";
import { get } from "../../inf/httpClient";

const useBaseQueryHandler = (path) => {
    const [data, setData] = useState([]);
    const [isPending, setIsPending] = useState(true);
    const [isError, setIsError] = useState(true);
    const getFn = async (resolve) => {
        const res = await get(path);
        if(res.ok) 
            setData(res.data)
        else
            setIsError(true);
        setIsPending(false)
    }
    useEffect(() => {
        getFn();
    }, [])
    return {data, isPending, isError, refetch: getFn}
}

export const useCourses = () => {
    return useBaseQueryHandler('/courses')
}

export const useCourse = (number) => {
    return useBaseQueryHandler(`/courses/${number}`)
}

export const useQuestions = (course) => {
    return useBaseQueryHandler(`${course}/questions`)
}

export const useQuestion = (course, id) => {
    return useBaseQueryHandler(`${course}/questions/${id}`)
}

