import { redirect } from 'next/navigation';

/** Public entry: vacancies (medical roles). Marketing home removed. */
export default function Home() {
  redirect('/careers');
}
