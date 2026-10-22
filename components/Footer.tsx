export default function Footer({ email }: { email: string }) {
  return (
    <div className="wrap">
      <footer id="foot">
        <a href={`mailto:${email}`}>{email}</a>
      </footer>
    </div>
  );
}
