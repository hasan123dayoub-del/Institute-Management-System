import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function RegisterStudent() {
  return (
    <PagePlaceholder
      owner="Hasan (F1)"
      api={['POST /students', 'GET /levels', 'GET /classes?status=open']}
      todo={[
        'Student and account form: name, phone, email, password (PasswordField), birth date, gender, guardian phone, address',
        'Placement score and level chips A1 to C2',
        'Class options for the chosen level with seats left (n/20), or "waiting list"',
        'On success go back to the students list and show a toast',
      ]}
    />
  )
}
