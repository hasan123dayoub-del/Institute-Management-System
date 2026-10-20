import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Teachers() {
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={['GET /teachers', 'POST /teachers', 'POST /teachers/:id/pay']}
      todo={[
        'Table: teacher, their classes, salary, salary status pill, actions',
        '"Mark as paid" is disabled once paid (API returns 409)',
        'Add teacher form: name, email, password, phone, qualification, hire date, monthly salary',
      ]}
    />
  )
}
