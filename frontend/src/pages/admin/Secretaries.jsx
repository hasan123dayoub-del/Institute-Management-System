import PagePlaceholder from '../../components/PagePlaceholder.jsx'

export default function Secretaries() {
  return (
    <PagePlaceholder
      owner="Dev 2 (F2)"
      api={['GET /secretaries', 'POST /secretaries', 'PATCH /secretaries/:id', 'DELETE /secretaries/:id', 'PATCH /users/:id/password']}
      todo={[
        'Table: name, email, phone, active / inactive, actions',
        'Actions: edit, set password, deactivate / activate, delete',
        'Deleting the last active secretary returns 409: show the message',
        'Side form to edit or add a secretary (PasswordField)',
      ]}
    />
  )
}
