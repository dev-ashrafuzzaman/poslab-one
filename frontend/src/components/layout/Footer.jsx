export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 p-3 text-center text-sm bg-white">
      © {new Date().getFullYear()}{" "}
      <a target="_blank" href="https://softnextit.net/">
        Softnext IT
      </a>
    </footer>
  );
}
