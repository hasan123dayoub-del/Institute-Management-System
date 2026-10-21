import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Grades() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /classes (own)', 'GET /grades/class/:id', 'PUT /grades/class/:id']}
      todo={[
        'Class picker (own classes only) and an exam switch: oral /20, midterm /30, final /50',
        'Table of students with editable inputs and a Save button',
        'Final is locked until the computed last session, and grades close after the three-day grading window',
        'Show the course start date and calculated last session date',
      ]}
    />
  )
}
