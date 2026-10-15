import { meta } from "@eslint/js";
import { useEffect, useState } from "react"
import { Link } from "react-router";
import { useCourses } from "../api/queries/queries";



function CourseListPage() {
  const {data: courses, isPending} = useCourses();

  return (
    <>
      <div className="d-flex flex-row gap-3 justify-content-center align-items-center flex-wrap m-auto" style={{width:"90vw"}}>
        {courses && courses?.map?.(x => <CourseListItem key={x.number} {...x}/>)}
        {isPending ? (<div>loading</div>) : (!(courses?.length > 0) && <div>Oye y los cursos?....</div>)}
      </div>
    </>
  )
}

const CourseListItem = ({number, name, details, ...rest}) => {
  return (
    <Link to={`/app/course/${number}`}>
      <div className="yr-course-list-item yr-bg-dark-gray p-4 rounded">
        <div className="yr-item-number">{number}</div>
        <div className="yr-item-name">{name}</div>
        { details?.profesor && <div className="yr-item-profesor">Profrsor: {details?.profesor}</div>}
      </div>
    </Link>
  )
}

export default CourseListPage
