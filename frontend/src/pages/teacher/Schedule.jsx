import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Schedule() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /schedules', 'POST /schedules', 'PATCH /schedules/:id', 'DELETE /schedules/:id']}
      todo={[
        'Weekly grid Sat to Thu with the teacher’s own sessions',
        'Move a session: new day and time, check for clashes, recalculate the course end date from level hours and schedule',
        'Add and delete a session; 409 on clash shows the message',
        'Finished classes appear but are read only',
      ]}
    />
  )
}
