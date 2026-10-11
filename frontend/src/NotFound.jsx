import PublicLayout from "./PublicLayout.jsx";

export default function NotFound() {
  return (
    <PublicLayout title="Page not found – DriveNest">
      <main className="wrap doc notfound">
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <p><a className="btn btn-primary" href="/">Go to the homepage</a></p>
      </main>
    </PublicLayout>
  );
}
