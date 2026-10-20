import { useParams } from 'react-router'
import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function ClassDetail() {
  const { id } = useParams()
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={[`GET /classes/${id}`, `GET /classes/${id}/students`, 'DELETE /students/:id']}
      todo={[
        'Header: level, shift pill, status pill, teacher, room, timetable, start date',
        'Course status stepper Open > Running > Finished, sessions so far n/total, last session date',
        'Students table with oral / midterm / final grades and a move or delete action',
        'Finished state: read only, shows who passed (now waiting at next level) and who failed',
      ]}
    />
  )
}
