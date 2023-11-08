import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Privacy Policy',
}

export default function Page() {
  return (
    <section className="p-2">
      <h1 className="text-xl font-bold">
        1) Privacy Policy for metronomes.xyz
      </h1>
      <p className="p-2">
        By using this website, you hereby consent to the Privacy Policy and
        agree to its terms.
      </p>
      <h2 className="text-lg font-semibold">
        2) What personal information is collected
      </h2>
      <p className="p-2">
        When you register for an account, you are asked for a username that can
        be completely anonymous. This website is hosted on Vercel. IP-Addresses
        and Browser information may be saved by Vercel. This website does not
        have any access on such data.
      </p>
      <h2 className="text-lg font-semibold">
        3) How your personal information is used
      </h2>
      <p className="p-2">
        Your personal information (the username) is used solely to let you login
        into your account.
      </p>
      <h2 className="text-lg font-semibold">
        4) Protection of personal information
      </h2>
      <p className="p-2">
        The website uses SSL encryption when communicating between server and
        client. Data is stored in a database hosted on Vercel who takes care of
        a secure infrastructure. Passwords are encrpyted before saving.
      </p>
      <h2 className="text-lg font-semibold">5) Cookies</h2>
      <p className="p-2">
        The website uses one cookie to handle the user session after sign up or
        login. The cookie expires on logout or after 48 hours of inactivity.
        Also, short-life cookies are set con certain page navigations to
        communicate the status between those pages.
      </p>
      <h2 className="text-lg font-semibold">6) Data sharing</h2>
      <p className="p-2">No data is shared with any external service.</p>
    </section>
  )
}
