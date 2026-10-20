import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Classes() {
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={['GET /classes', 'POST /classes', 'POST /classes/:id/start']}
      todo={[
        'Six levels, each with a morning and an evening class card',
        'Card: teacher, room, students n/20, status pill, sessions progress and end date',
        '"Start course" only on open classes; click a card to open the class page',
        'New class form: level, shift, teacher, room, start date',
      ]}
    />
  )
}
