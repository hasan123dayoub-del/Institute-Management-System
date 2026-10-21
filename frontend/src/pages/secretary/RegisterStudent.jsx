import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import * as classesApi from '@/api/classes.js'
import * as studentsApi from '@/api/students.js'
import Field from '@/components/Field.jsx'
import PasswordField from '@/components/PasswordField.jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import ClassOptions from '@/features/secretary/ClassOptions.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { LEVELS } from '@/lib/format.js'
import { cn } from '@/lib/utils'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(v) {
  const errors = {}
  if (v.full_name.trim().length < 3) errors.full_name = 'Enter the full name (3+ characters)'
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email'
  if (v.password.length < 8) errors.password = 'At least 8 characters'
  if (v.placement_score !== '' && (Number(v.placement_score) < 0 || Number(v.placement_score) > 100))
    errors.placement_score = 'A number from 0 to 100'
  return errors
}

// Secretary: create the student's account and put them in a class (or on the waiting list).
export default function RegisterStudent() {
  const navigate = useNavigate()
  const { data: classes, loading } = useLoad(classesApi.list)

  const [values, setValues] = useState({
    full_name: '', phone: '', email: '', password: '', birth_date: '', gender: '',
    guardian_phone: '', address: '', placement_score: '',
  })
  const [level, setLevel] = useState('A1')
  const [classId, setClassId] = useState(null) // null = waiting list
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  // classes the student could join at the chosen level
  const options = (classes ?? []).filter((c) => c.level === level && c.status !== 'finished')

  const chooseLevel = (code) => {
    setLevel(code)
    setClassId(null) // a class of another level would be refused by the server
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setBusy(true)
    try {
      await perform(
        () =>
          studentsApi.create({
            ...values,
            gender: values.gender || undefined,
            birth_date: values.birth_date || undefined,
            placement_score: values.placement_score === '' ? undefined : Number(values.placement_score),
            level,
            class_id: classId,
          }),
        'Student registered',
      )
      navigate('/secretary/students')
    } catch {
      // the error toast was already shown (for example: this email is already in use)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Student and account</CardTitle>
          <CardDescription>The student logs in with this email and password.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={values.full_name} onChange={set('full_name')} error={errors.full_name} />
          <Field label="Phone" value={values.phone} onChange={set('phone')} />
          <Field label="Email (used to log in)" type="email" value={values.email} onChange={set('email')} error={errors.email} />
          <PasswordField value={values.password} onChange={(password) => setValues((v) => ({ ...v, password }))} error={errors.password} />
          <Field label="Date of birth" type="date" value={values.birth_date} onChange={set('birth_date')} />
          <div className="flex flex-col gap-1.5">
            <Label>Gender</Label>
            <Select value={values.gender} onValueChange={(gender) => setValues((v) => ({ ...v, gender }))}>
              <SelectTrigger className="w-full" aria-label="Gender"><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Guardian phone" value={values.guardian_phone} onChange={set('guardian_phone')} />
          <Field label="Address" value={values.address} onChange={set('address')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Level and class</CardTitle>
          <CardDescription>The placement test decides the level.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="Placement test score (out of 100)" type="number" min="0" max="100" value={values.placement_score} onChange={set('placement_score')} error={errors.placement_score} />

          <div className="flex flex-col gap-1.5">
            <Label>Level</Label>
            <div className="grid grid-cols-6 gap-1" role="radiogroup" aria-label="Level">
              {LEVELS.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={level === code}
                  onClick={() => chooseLevel(code)}
                  className={cn(
                    'rounded-md border py-1.5 font-mono text-sm transition-colors',
                    level === code ? 'border-primary bg-primary font-bold text-primary-foreground' : 'hover:bg-muted',
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Class</Label>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <ClassOptions classes={options} value={classId} onChange={setClassId} allowNone emptyText={`No open or running class at ${level} yet.`} />
            )}
          </div>

          <Button type="submit" disabled={busy}>{busy ? 'Registering…' : 'Create account and register'}</Button>
          <p className="text-xs text-muted-foreground">The password is stored hashed, so give it to the student now.</p>
        </CardContent>
      </Card>
    </form>
  )
}
