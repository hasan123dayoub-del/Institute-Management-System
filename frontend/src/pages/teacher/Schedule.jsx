import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Schedule() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /schedules', 'POST /schedules', 'PATCH /schedules/:id', 'DELETE /schedules/:id']}
      todo={[
        'Weekly grid Sat to Thu with the teacher’s own sessions',
        'Move a session: new day and time, checks (inside the shift, no clash), new course end date',
        'Add and delete a session; 409 on clash shows the message',
        'Finished classes appear but are read only',
      ]}
    />
  )
}
