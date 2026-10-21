import { useParams } from 'react-router'
import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function ClassDetail() {
  const { id } = useParams()
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={[`GET /classes/${id}`, `GET /classes/${id}/students`, 'DELETE /students/:id']}
      todo={[
        'Header: level, shift pill, status pill, teacher, room, timetable, start date, calculated last-session date',
        'Course status stepper Open > Running > Finished, with automation after the grading window closes',
        'Students table with oral / midterm / final grades and a move or delete action',
        'Finished state: read only, shows who passed (level advanced) and who failed (same level); students become finished',
      ]}
    />
  )
}
